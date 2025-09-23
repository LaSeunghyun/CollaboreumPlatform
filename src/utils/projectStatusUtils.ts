import { FundingProjectStatus } from '@/features/funding/types';

/**
 * 프로젝트 상태를 자동으로 계산하는 유틸리티 함수들
 */

export interface ProjectDateInfo {
  startDate: Date | string;
  endDate: Date | string;
  currentDate?: Date;
}

/**
 * 프로젝트의 현재 상태를 계산합니다.
 * @param startDate 프로젝트 시작일
 * @param endDate 프로젝트 종료일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 프로젝트 상태
 */
export const calculateProjectStatus = (
  startDate: Date | string,
  endDate: Date | string,
  currentDate: Date = new Date(),
): FundingProjectStatus => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date(currentDate);

  // 시작일 전이면 대기 상태
  if (now < start) {
    return FundingProjectStatus.DRAFT;
  }

  // 종료일 이후면 종료 상태
  if (now > end) {
    return FundingProjectStatus.CLOSED;
  }

  // 시작일부터 종료일까지는 진행 중
  return FundingProjectStatus.COLLECTING;
};

/**
 * 프로젝트가 시작되었는지 확인합니다.
 * @param startDate 프로젝트 시작일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 시작 여부
 */
export const isProjectStarted = (
  startDate: Date | string,
  currentDate: Date = new Date(),
): boolean => {
  const start = new Date(startDate);
  const now = new Date(currentDate);
  return now >= start;
};

/**
 * 프로젝트가 종료되었는지 확인합니다.
 * @param endDate 프로젝트 종료일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 종료 여부
 */
export const isProjectEnded = (
  endDate: Date | string,
  currentDate: Date = new Date(),
): boolean => {
  const end = new Date(endDate);
  const now = new Date(currentDate);
  return now > end;
};

/**
 * 프로젝트가 진행 중인지 확인합니다.
 * @param startDate 프로젝트 시작일
 * @param endDate 프로젝트 종료일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 진행 중 여부
 */
export const isProjectInProgress = (
  startDate: Date | string,
  endDate: Date | string,
  currentDate: Date = new Date(),
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date(currentDate);
  return now >= start && now <= end;
};

/**
 * 프로젝트 시작까지 남은 일수를 계산합니다.
 * @param startDate 프로젝트 시작일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 남은 일수 (음수면 이미 시작됨)
 */
export const getDaysUntilStart = (
  startDate: Date | string,
  currentDate: Date = new Date(),
): number => {
  const start = new Date(startDate);
  const now = new Date(currentDate);
  const diffTime = start.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 프로젝트 종료까지 남은 일수를 계산합니다.
 * @param endDate 프로젝트 종료일
 * @param currentDate 현재 날짜 (기본값: new Date())
 * @returns 남은 일수 (음수면 이미 종료됨)
 */
export const getDaysUntilEnd = (
  endDate: Date | string,
  currentDate: Date = new Date(),
): number => {
  const end = new Date(endDate);
  const now = new Date(currentDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 프로젝트 상태에 따른 한국어 라벨을 반환합니다.
 * @param status 프로젝트 상태
 * @returns 한국어 라벨
 */
export const getProjectStatusLabel = (status: FundingProjectStatus): string => {
  const labels: Record<FundingProjectStatus, string> = {
    [FundingProjectStatus.DRAFT]: '대기 중',
    [FundingProjectStatus.COLLECTING]: '진행 중',
    [FundingProjectStatus.SUCCEEDED]: '성공',
    [FundingProjectStatus.FAILED]: '실패',
    [FundingProjectStatus.EXECUTING]: '집행 중',
    [FundingProjectStatus.DISTRIBUTING]: '분배 중',
    [FundingProjectStatus.CLOSED]: '종료',
  };
  return labels[status];
};

/**
 * 프로젝트 상태에 따른 색상을 반환합니다.
 * @param status 프로젝트 상태
 * @returns Tailwind CSS 색상 클래스
 */
export const getProjectStatusColor = (status: FundingProjectStatus): string => {
  const colors: Record<FundingProjectStatus, string> = {
    [FundingProjectStatus.DRAFT]: 'text-muted-foreground bg-muted',
    [FundingProjectStatus.COLLECTING]: 'text-primary bg-primary/10',
    [FundingProjectStatus.SUCCEEDED]: 'text-success-600 bg-success-50',
    [FundingProjectStatus.FAILED]: 'text-danger-600 bg-danger-50',
    [FundingProjectStatus.EXECUTING]: 'text-warning-600 bg-warning-50',
    [FundingProjectStatus.DISTRIBUTING]: 'text-info-600 bg-info-50',
    [FundingProjectStatus.CLOSED]: 'text-muted-foreground bg-muted',
  };
  return colors[status];
};

/**
 * 프로젝트 상태를 주기적으로 업데이트하는 훅을 위한 유틸리티
 * @param projects 프로젝트 목록
 * @returns 업데이트된 프로젝트 목록
 */
export const updateProjectStatuses = <
  T extends {
    startDate: string;
    endDate: string;
    status: FundingProjectStatus;
  },
>(
  projects: T[],
): T[] => {
  return projects.map(project => ({
    ...project,
    status: calculateProjectStatus(project.startDate, project.endDate),
  }));
};
