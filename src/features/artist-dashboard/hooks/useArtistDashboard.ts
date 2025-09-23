import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { artistAPI } from '@/api/modules/artist';
import {
  calculateProgress,
  formatCountWithUnit,
  formatCurrencyToMillions,
  formatInteger,
  formatPercentage,
} from '@/features/artist-dashboard/lib/formatters';

interface ArtistSummary {
  id?: string;
  name?: string;
  totalProjects?: number;
  totalFunding?: number;
  followers?: number;
  monthlyGrowth?: number;
}

interface ProjectResponse {
  id: string | number;
  title?: string;
  status?: string;
  raised?: number;
  goal?: number;
  backers?: number;
  revenueShare?: number;
  daysLeft?: number;
  totalRevenue?: number;
  sharedRevenue?: number;
}

interface WbsItem {
  id: string | number;
  task: string;
  status: string;
  startDate: string;
  endDate: string;
  responsible: string;
  progress: number;
}

export type OverviewStatKey = 'projects' | 'funding' | 'followers' | 'growth';

export interface OverviewStat {
  key: OverviewStatKey;
  label: string;
  value: string;
}

export interface ProjectCardData {
  id: string;
  title: string;
  status: string;
  statusTone: 'active' | 'completed' | 'default';
  isCompleted: boolean;
  progressValue: number;
  progressLabel: string;
  goalLabel: string;
  raisedLabel: string;
  backersLabel: string;
  revenueShareLabel: string;
  daysLeftLabel: string;
  completionSummary?: {
    goalLabel: string;
    raisedLabel: string;
    backersLabel: string;
    totalRevenueLabel: string;
    sharedRevenueLabel: string;
    netRevenueLabel: string;
  };
}

export interface ProjectsSectionData {
  title: string;
  ctaLabel: string;
  emptyState: {
    isEmpty: boolean;
    message: string;
    actionLabel: string;
  };
  projects: ProjectCardData[];
}

export interface WbsItemViewModel {
  id: string;
  task: string;
  status: string;
  statusTone: 'completed' | 'inProgress' | 'default';
  startDate: string;
  endDate: string;
  responsible: string;
  progressValue: number;
  progressLabel: string;
  showInProgressHint: boolean;
}

export interface WbsSectionData {
  header: {
    title: string;
    overallProgressLabel: string;
    overallProgressValue: number;
  };
  emptyState: {
    isEmpty: boolean;
    message: string;
    actionLabel: string;
  };
  items: WbsItemViewModel[];
}

interface ArtistDashboardState {
  artist: ArtistSummary | null;
  projects: ProjectResponse[];
  wbsItems: WbsItem[];
}

export interface ArtistDashboardData {
  isLoading: boolean;
  error: string | null;
  greetingName: string;
  overviewStats: OverviewStat[];
  projectsSection: ProjectsSectionData;
  wbsSection: WbsSectionData;
  analyticsMessage: string;
  settingsMessage: string;
}

const DEFAULT_WBS_ITEMS: WbsItem[] = [];

export const useArtistDashboard = (): ArtistDashboardData => {
  const { user } = useAuth();
  const [state, setState] = useState<ArtistDashboardState>({
    artist: null,
    projects: [],
    wbsItems: DEFAULT_WBS_ITEMS,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!user?.id) {
        setError('사용자 정보를 찾을 수 없습니다.');
        setState({ artist: null, projects: [], wbsItems: DEFAULT_WBS_ITEMS });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [artistResponse, projectsResponse] = await Promise.all([
          artistAPI.getArtistById(user.id.toString()),
          artistAPI.getProjects(user.id),
        ]);

        if (!isMounted) {
          return;
        }

        const artistApiResponse = artistResponse as {
          success?: boolean;
          data?: ArtistSummary;
        };
        const projectsApiResponse = projectsResponse as {
          success?: boolean;
          data?: ProjectResponse[];
        };

        const nextArtist =
          artistApiResponse.success && artistApiResponse.data ? artistApiResponse.data : null;

        const nextProjects =
          projectsApiResponse.success && Array.isArray(projectsApiResponse.data)
            ? projectsApiResponse.data
            : [];

        setState({
          artist: nextArtist,
          projects: nextProjects,
          wbsItems: DEFAULT_WBS_ITEMS,
        });
      } catch (dashboardError) {
        if (!isMounted) {
          return;
        }

        console.error('아티스트 대시보드 데이터 로드 실패:', dashboardError);
        setError('대시보드 정보를 불러오는 중 오류가 발생했습니다.');
        setState({ artist: null, projects: [], wbsItems: DEFAULT_WBS_ITEMS });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const greetingName = state.artist?.name ?? user?.name ?? '사용자';

  const overviewStats = useMemo<OverviewStat[]>(() => {
    const totalProjects = state.artist?.totalProjects ?? state.projects.length;
    const totalFunding = state.artist?.totalFunding ?? state.projects.reduce((sum, project) => {
      return sum + (project.raised ?? 0);
    }, 0);
    const followers = state.artist?.followers ?? 0;
    const monthlyGrowth = state.artist?.monthlyGrowth ?? 0;

    return [
      {
        key: 'projects',
        label: '총 프로젝트',
        value: formatInteger(totalProjects),
      },
      {
        key: 'funding',
        label: '총 펀딩 금액',
        value: formatCurrencyToMillions(totalFunding),
      },
      {
        key: 'followers',
        label: '팔로워',
        value: formatInteger(followers),
      },
      {
        key: 'growth',
        label: '월 성장률',
        value: formatPercentage(monthlyGrowth, { includeSign: true }),
      },
    ];
  }, [state.artist, state.projects]);

  const projectCards = useMemo<ProjectCardData[]>(() => {
    return state.projects.map(project => {
      const progressValue = Math.round(
        calculateProgress(project.raised ?? 0, project.goal ?? 0),
      );
      const isCompleted = project.status === '완료';
      const statusTone = isCompleted
        ? 'completed'
        : project.status === '진행중'
          ? 'active'
          : 'default';

      const totalRevenue = project.totalRevenue ?? 0;
      const sharedRevenue = project.sharedRevenue ?? 0;
      const netRevenue = totalRevenue - sharedRevenue;

      return {
        id: project.id.toString(),
        title: project.title ?? '제목 미정 프로젝트',
        status: project.status ?? '진행중',
        statusTone,
        isCompleted,
        progressValue,
        progressLabel: `${progressValue}%`,
        goalLabel: formatCurrencyToMillions(project.goal ?? 0),
        raisedLabel: formatCurrencyToMillions(project.raised ?? 0),
        backersLabel: formatCountWithUnit(project.backers ?? 0, '명'),
        revenueShareLabel: `${project.revenueShare ?? 0}%`,
        daysLeftLabel: formatCountWithUnit(project.daysLeft ?? 0, '일'),
        completionSummary: isCompleted
          ? {
              goalLabel: formatCurrencyToMillions(project.goal ?? 0),
              raisedLabel: formatCurrencyToMillions(project.raised ?? 0),
              backersLabel: formatCountWithUnit(project.backers ?? 0, '명'),
              totalRevenueLabel: formatCurrencyToMillions(totalRevenue),
              sharedRevenueLabel: formatCurrencyToMillions(sharedRevenue),
              netRevenueLabel: formatCurrencyToMillions(netRevenue),
            }
          : undefined,
      };
    });
  }, [state.projects]);

  const projectsSection: ProjectsSectionData = useMemo(
    () => ({
      title: '내 프로젝트',
      ctaLabel: '새 프로젝트 등록',
      emptyState: {
        isEmpty: projectCards.length === 0,
        message: '아직 등록된 프로젝트가 없습니다.',
        actionLabel: '첫 번째 프로젝트 등록하기',
      },
      projects: projectCards,
    }),
    [projectCards],
  );

  const wbsItems = state.wbsItems;

  const wbsSection: WbsSectionData = useMemo(
    () => ({
      header: {
        title: "정규 앨범 '도시의 밤' 제작",
        overallProgressLabel: '전체 진행률: 32%',
        overallProgressValue: 32,
      },
      emptyState: {
        isEmpty: wbsItems.length === 0,
        message: '아직 등록된 작업이 없습니다.',
        actionLabel: '첫 번째 작업 추가하기',
      },
      items: wbsItems.map(item => {
        const statusTone =
          item.status === '완료'
            ? 'completed'
            : item.status === '진행중'
              ? 'inProgress'
              : 'default';

        return {
          id: item.id.toString(),
          task: item.task,
          status: item.status,
          statusTone,
          startDate: item.startDate,
          endDate: item.endDate,
          responsible: item.responsible,
          progressValue: item.progress,
          progressLabel: `${item.progress}%`,
          showInProgressHint: statusTone === 'inProgress',
        };
      }),
    }),
    [wbsItems],
  );

  return {
    isLoading,
    error,
    greetingName,
    overviewStats,
    projectsSection,
    wbsSection,
    analyticsMessage: '분석 데이터를 준비 중입니다...',
    settingsMessage: '설정 페이지를 준비 중입니다...',
  };
};
