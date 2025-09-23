import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInCalendarDays, formatDistanceToNow } from 'date-fns';

import { userProfileAPI } from '@/services/api/user';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatCurrency = (amount: unknown) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNumber(amount));
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
      return 'bg-success-100 text-success-700';
    case 'pending':
    case 'processing':
      return 'bg-warning-100 text-warning-700';
    case 'cancelled':
    case 'refunded':
      return 'bg-danger-100 text-danger-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
    case 'success':
      return '완료';
    case 'pending':
    case 'processing':
      return '대기중';
    case 'cancelled':
      return '취소됨';
    case 'refunded':
      return '환불됨';
    default:
      return status;
  }
};

export type FanProfileStatusTone = 'success' | 'warning' | 'danger' | 'default';

export interface FanProfileHookParams {
  userId?: string;
  fallbackUser?: Partial<FanProfile> & { id?: string };
  enabled?: boolean;
}

export interface FanProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  following: number;
  totalPledges: number;
  totalAmount: number;
  formattedTotalAmount: string;
  followingArtists: unknown[];
}

export interface FanProfileFollowing {
  id: string;
  name: string;
  avatar?: string;
  followers: number;
}

export interface FanProfileMonthlySummary {
  backingCount: number;
  formattedBackingAmount: string;
  followingCount: number;
  totalPledges: number;
}

export interface FanProfileActivity {
  id: string;
  projectTitle: string;
  description: string;
  relativeTime: string;
}

export interface FanProfileBacking {
  id: string;
  projectId: string;
  projectTitle: string;
  artistName: string;
  rewardTitle?: string;
  amount: number;
  formattedAmount: string;
  status: string;
  statusText: string;
  statusColorClass: string;
  pledgeDate: Date | null;
  pledgeDateLabel: string;
}

export const useFanProfile = ({
  userId,
  fallbackUser,
  enabled = true,
}: FanProfileHookParams) => {
  const hasUser = Boolean(userId) && enabled;

  const profileQuery = useQuery({
    queryKey: ['fan', 'profile', userId],
    queryFn: () => userProfileAPI.getUserProfile(userId as string),
    enabled: hasUser,
    staleTime: 5 * 60 * 1000,
  });

  const backingsQuery = useQuery({
    queryKey: ['fan', 'backings', userId],
    queryFn: () =>
      userProfileAPI.getUserBackings(userId as string, { limit: 20 }),
    enabled: hasUser,
    staleTime: 5 * 60 * 1000,
  });

  const profile = useMemo<FanProfile | null>(() => {
    if (!hasUser) return null;

    const apiProfile =
      (profileQuery.data as any)?.data ?? profileQuery.data ?? null;

    const resolved =
      apiProfile ??
      (fallbackUser
        ? {
            ...fallbackUser,
            id: fallbackUser.id ?? userId,
            followingArtists: (fallbackUser as any).following ?? [],
          }
        : null);

    if (!resolved) return null;

    const followingArtists = Array.isArray(resolved.followingArtists)
      ? resolved.followingArtists
      : Array.isArray((resolved as any).following)
        ? (resolved as any).following
        : [];

    const followingCount =
      resolved.following ??
      (resolved as any).followingCount ??
      followingArtists.length ??
      0;

    const totalPledges =
      resolved.totalPledges ??
      (resolved as any).totalBackingCount ??
      (resolved as any).totalBackings ??
      0;

    const totalAmount = toNumber(
      resolved.totalAmount ??
        (resolved as any).totalBackingAmount ??
        (resolved as any).sumBackingAmount ??
        0,
    );

    return {
      id: resolved.id ?? resolved.userId ?? (userId as string),
      name:
        resolved.name ??
        (resolved as any).username ??
        fallbackUser?.name ??
        '이름 없음',
      email: resolved.email ?? fallbackUser?.email ?? '',
      avatar: resolved.avatar ?? fallbackUser?.avatar,
      bio: resolved.bio ?? fallbackUser?.bio ?? '',
      following: followingCount,
      totalPledges,
      totalAmount,
      formattedTotalAmount: formatCurrency(totalAmount),
      followingArtists,
    };
  }, [fallbackUser, hasUser, profileQuery.data, userId]);

  const rawBackings = useMemo(() => {
    const raw = (backingsQuery.data as any)?.data ?? backingsQuery.data ?? [];
    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.backings)) {
      return raw.backings;
    }

    if (Array.isArray(raw?.items)) {
      return raw.items;
    }

    return [];
  }, [backingsQuery.data]);

  const processedBackings = useMemo<FanProfileBacking[]>(() => {
    return rawBackings.map((pledge: any, index: number) => {
      const amount = toNumber(
        pledge.amount ?? pledge.totalAmount ?? pledge.price,
      );
      const pledgeDate = parseDate(
        pledge.pledgeDate ?? pledge.createdAt ?? pledge.date,
      );
      const projectId = String(
        pledge.projectId ?? pledge.project?.id ?? pledge.id ?? `${index}`,
      );
      const status = String(
        pledge.status ?? pledge.state ?? 'completed',
      ).toLowerCase();

      return {
        id:
          String(pledge.id ?? pledge.backingId ?? pledge.pledgeId) ||
          `${projectId}-${pledgeDate?.toISOString() ?? index}`,
        projectId,
        projectTitle:
          pledge.projectTitle ?? pledge.project?.title ?? '이름 없는 프로젝트',
        artistName:
          pledge.artistName ??
          pledge.project?.artist?.name ??
          pledge.artist?.name ??
          '알 수 없음',
        rewardTitle: pledge.rewardTitle ?? pledge.reward?.title ?? undefined,
        amount,
        formattedAmount: formatCurrency(amount),
        status,
        statusText: getStatusText(status),
        statusColorClass: getStatusColor(status),
        pledgeDate,
        pledgeDateLabel: pledgeDate
          ? pledgeDate.toLocaleDateString()
          : '정보 없음',
      };
    });
  }, [rawBackings]);

  const totalBackingAmount = useMemo(() => {
    return processedBackings.reduce((sum, pledge) => sum + pledge.amount, 0);
  }, [processedBackings]);

  const aggregatedProfile = useMemo(() => {
    if (!profile) return null;

    return {
      ...profile,
      totalPledges: profile.totalPledges || processedBackings.length,
      totalAmount: profile.totalAmount || totalBackingAmount,
      formattedTotalAmount:
        profile.formattedTotalAmount || formatCurrency(totalBackingAmount),
    };
  }, [processedBackings.length, profile, totalBackingAmount]);

  const followingArtists = useMemo<FanProfileFollowing[]>(() => {
    if (!aggregatedProfile) return [];

    return (aggregatedProfile.followingArtists ?? []).map(
      (artist: any, index: number) => ({
        id: String(artist?.id ?? artist?.artistId ?? index),
        name: artist?.name ?? artist?.username ?? '이름 없는 아티스트',
        avatar:
          artist?.avatar ?? artist?.image ?? artist?.profileImage ?? undefined,
        followers: toNumber(
          artist?.followers ??
            artist?.followersCount ??
            artist?.followerCount ??
            0,
        ),
      }),
    );
  }, [aggregatedProfile]);

  const monthlyBackings = useMemo(() => {
    const now = new Date();
    return processedBackings.filter(pledge => {
      if (!pledge.pledgeDate) return false;
      return differenceInCalendarDays(now, pledge.pledgeDate) <= 30;
    });
  }, [processedBackings]);

  const monthlySummary = useMemo<FanProfileMonthlySummary>(() => {
    const backingAmount = monthlyBackings.reduce(
      (sum, pledge) => sum + pledge.amount,
      0,
    );

    return {
      backingCount: monthlyBackings.length,
      formattedBackingAmount: formatCurrency(backingAmount),
      followingCount:
        aggregatedProfile?.following ?? followingArtists.length ?? 0,
      totalPledges: aggregatedProfile?.totalPledges ?? processedBackings.length,
    };
  }, [
    aggregatedProfile,
    followingArtists.length,
    monthlyBackings,
    processedBackings.length,
  ]);

  const recentActivities = useMemo<FanProfileActivity[]>(() => {
    return processedBackings.slice(0, 3).map(pledge => ({
      id: pledge.id,
      projectTitle: pledge.projectTitle,
      description: `${pledge.projectTitle}에 후원했습니다`,
      relativeTime: pledge.pledgeDate
        ? formatDistanceToNow(pledge.pledgeDate, { addSuffix: true })
        : '날짜 정보 없음',
    }));
  }, [processedBackings]);

  return {
    hasUser,
    aggregatedProfile,
    followingArtists,
    backings: processedBackings,
    monthlySummary,
    recentActivities,
    profileQuery,
    backingsQuery,
  };
};

export type UseFanProfileResult = ReturnType<typeof useFanProfile>;
