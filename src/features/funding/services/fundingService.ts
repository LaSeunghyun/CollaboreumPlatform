import { api } from '@/lib/api/api';
import { ApiResponse } from '@/shared/types';
import {
  FundingProject,
  FundingStats,
  FundingFilters,
  CreateFundingProjectRequest,
  BackProjectRequest,
} from '../types/funding.types';
import { FundingProjectStatus } from '../types';
import {
  FundingProjectStatus as PrismaFundingProjectStatusEnum,
  type FundingProjectStatus as PrismaFundingProjectStatus,
} from '@/types/prisma';

type FundingProjectsResponse = {
  projects: FundingProjectApi[];
};

type FundingProjectApi = {
  id?: string | number;
  _id?: string | number;
  title: string;
  description?: string;
  shortDescription?: string;
  goalAmount: number;
  currentAmount?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  daysLeft?: number;
  ownerId?: string;
  categoryId?: string;
  category?: string;
  image?: string;
  images?: string[];
  tags?: string[];
  progress?: number;
  backerCount?: number;
  backers?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  featured?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
};

const PRISMA_STATUS_MAP: Record<
  PrismaFundingProjectStatus,
  FundingProjectStatus
> = {
  [PrismaFundingProjectStatusEnum.PREPARING]: FundingProjectStatus.DRAFT,
  [PrismaFundingProjectStatusEnum.IN_PROGRESS]:
    FundingProjectStatus.COLLECTING,
  [PrismaFundingProjectStatusEnum.SUCCESS]:
    FundingProjectStatus.SUCCEEDED,
  [PrismaFundingProjectStatusEnum.FAILED]: FundingProjectStatus.FAILED,
  [PrismaFundingProjectStatusEnum.CANCELLED]: FundingProjectStatus.CLOSED,
  [PrismaFundingProjectStatusEnum.EXECUTING]:
    FundingProjectStatus.EXECUTING,
  [PrismaFundingProjectStatusEnum.COMPLETED]: FundingProjectStatus.CLOSED,
};

const NORMALIZED_PRISMA_STATUS_MAP = Object.entries(PRISMA_STATUS_MAP).reduce(
  (acc, [key, value]) => {
    acc[key] = value;
    acc[key.toLowerCase()] = value;
    return acc;
  },
  {} as Record<string, FundingProjectStatus>,
);

const STATUS_MAP: Record<string, FundingProjectStatus> = {
  ...NORMALIZED_PRISMA_STATUS_MAP,
  collecting: FundingProjectStatus.COLLECTING,
  진행중: FundingProjectStatus.COLLECTING,
  succeeded: FundingProjectStatus.SUCCEEDED,
  success: FundingProjectStatus.SUCCEEDED,
  성공: FundingProjectStatus.SUCCEEDED,
  failed: FundingProjectStatus.FAILED,
  failure: FundingProjectStatus.FAILED,
  실패: FundingProjectStatus.FAILED,
  취소: FundingProjectStatus.CLOSED,
  executing: FundingProjectStatus.EXECUTING,
  집행중: FundingProjectStatus.EXECUTING,
  distributing: FundingProjectStatus.DISTRIBUTING,
  분배중: FundingProjectStatus.DISTRIBUTING,
  closed: FundingProjectStatus.CLOSED,
  완료: FundingProjectStatus.CLOSED,
  draft: FundingProjectStatus.DRAFT,
  준비중: FundingProjectStatus.DRAFT,
};

const SHORT_DESCRIPTION_LENGTH = 120;

const mapFundingProjectStatus = (status?: string): FundingProjectStatus => {
  if (!status) {
    return FundingProjectStatus.DRAFT;
  }

  const normalized = status.trim().toLowerCase();
  if (normalized in STATUS_MAP) {
    return STATUS_MAP[normalized]!;
  }

  if (status in STATUS_MAP) {
    return STATUS_MAP[status]!;
  }

  return FundingProjectStatus.DRAFT;
};

const createShortDescription = (description?: string): string => {
  if (!description) {
    return '';
  }

  const trimmed = description.trim();
  if (trimmed.length <= SHORT_DESCRIPTION_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, SHORT_DESCRIPTION_LENGTH - 1)}…`;
};

const mapFundingProjectFromApi = (
  project: FundingProjectApi,
): FundingProject | null => {
  const identifier = project.id ?? project._id;
  if (!identifier) {
    return null;
  }

  const targetAmount = project.goalAmount ?? 0;
  const currentAmount = project.currentAmount ?? 0;

  const imageList = Array.isArray(project.images)
    ? project.images.filter((image): image is string => Boolean(image))
    : [];

  if (project.image) {
    imageList.unshift(project.image);
  }

  const uniqueImages = Array.from(new Set(imageList));

  const progress =
    typeof project.progress === 'number'
      ? Math.min(Math.max(Math.round(project.progress), 0), 100)
      : targetAmount > 0
        ? Math.min(
            Math.max(Math.round((currentAmount / targetAmount) * 100), 0),
            100,
          )
        : 0;

  return {
    id: String(identifier),
    title: project.title,
    description: project.description ?? '',
    shortDescription:
      project.shortDescription ?? createShortDescription(project.description),
    targetAmount,
    currentAmount,
    status: mapFundingProjectStatus(project.status),
    startDate: project.startDate,
    endDate: project.endDate,
    daysLeft: project.daysLeft,
    ownerId: project.ownerId,
    categoryId: project.categoryId,
    category: project.category,
    images: uniqueImages,
    tags: Array.isArray(project.tags) ? project.tags : [],
    progress,
    backerCount: project.backerCount ?? project.backers ?? 0,
    isActive: project.isActive ?? true,
    isFeatured: project.isFeatured ?? project.featured ?? false,
    metadata: project.metadata ?? {},
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

const ensureSuccess = <T>(
  response: ApiResponse<T>,
  fallbackMessage: string,
): ApiResponse<T> => {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response;
};

const requireData = <T>(
  response: ApiResponse<T>,
  fallbackMessage: string,
): T => {
  const safeResponse = ensureSuccess(response, fallbackMessage);

  if (safeResponse.data === undefined || safeResponse.data === null) {
    throw new Error(fallbackMessage);
  }

  return safeResponse.data;
};

const normalizeProjectList = (
  projects: FundingProjectApi[] | undefined | null,
): FundingProject[] => {
  if (!projects) {
    return [];
  }

  return projects
    .map(mapFundingProjectFromApi)
    .filter((project): project is FundingProject => project !== null);
};

class FundingService {
  // 펀딩 프로젝트 목록 조회
  async getProjects(filters?: FundingFilters): Promise<FundingProject[]> {
    const params = new URLSearchParams();

    if (filters?.category) params.append('category', filters.category);
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters?.minAmount)
      params.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount)
      params.append('maxAmount', filters.maxAmount.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/funding/projects?${queryString}`
      : '/funding/projects';

    const response = await api.get<FundingProjectsResponse>(endpoint);
    const payload = ensureSuccess(
      response,
      '펀딩 프로젝트를 불러오지 못했습니다.',
    ).data;

    return normalizeProjectList(payload?.projects);
  }

  // 펀딩 프로젝트 상세 조회
  async getProject(id: number): Promise<FundingProject> {
    const response = await api.get<FundingProjectApi>(
      `/funding/projects/${id}`,
    );
    const project = requireData(
      response,
      '펀딩 프로젝트를 불러오지 못했습니다.',
    );
    const normalized = mapFundingProjectFromApi(project);

    if (!normalized) {
      throw new Error('유효한 펀딩 프로젝트 정보를 찾을 수 없습니다.');
    }

    return normalized;
  }

  // 펀딩 통계 조회
  async getStats(): Promise<FundingStats> {
    const response = await api.get<FundingStats>('/funding/stats');
    return requireData(response, '펀딩 통계를 불러오지 못했습니다.');
  }

  // 펀딩 프로젝트 생성
  async createProject(
    data: CreateFundingProjectRequest,
  ): Promise<FundingProject> {
    const response = await api.post<FundingProjectApi>(
      '/funding/projects',
      data as any,
    );
    const project = requireData(response, '펀딩 프로젝트 생성에 실패했습니다.');
    const normalized = mapFundingProjectFromApi(project);

    if (!normalized) {
      throw new Error('생성된 펀딩 프로젝트 정보를 처리할 수 없습니다.');
    }

    return normalized;
  }

  // 펀딩 프로젝트 수정
  async updateProject(
    id: number,
    data: Partial<CreateFundingProjectRequest>,
  ): Promise<FundingProject> {
    const response = await api.put<FundingProjectApi>(
      `/funding/projects/${id}`,
      data,
    );
    const project = requireData(
      response,
      '펀딩 프로젝트 업데이트에 실패했습니다.',
    );
    const normalized = mapFundingProjectFromApi(project);

    if (!normalized) {
      throw new Error('업데이트된 펀딩 프로젝트 정보를 처리할 수 없습니다.');
    }

    return normalized;
  }

  // 펀딩 프로젝트 삭제
  async deleteProject(id: number): Promise<void> {
    ensureSuccess(
      await api.delete(`/funding/projects/${id}`),
      '펀딩 프로젝트 삭제에 실패했습니다.',
    );
  }

  // 프로젝트 후원
  async backProject(
    data: BackProjectRequest,
  ): Promise<{ paymentId: number; message: string }> {
    const response = await api.post<{ paymentId: number; message: string }>(
      `/funding/projects/${data.projectId}/back`,
      data as any,
    );

    return requireData(response, '후원 처리에 실패했습니다.');
  }

  // 프로젝트 좋아요
  async likeProject(
    projectId: number,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const response = await api.post<{ liked: boolean; likesCount: number }>(
      `/funding/projects/${projectId}/like`,
    );

    return requireData(response, '좋아요 처리에 실패했습니다.');
  }

  // 프로젝트 북마크
  async bookmarkProject(projectId: number): Promise<{ bookmarked: boolean }> {
    const response = await api.post<{ bookmarked: boolean }>(
      `/funding/projects/${projectId}/bookmark`,
    );

    return requireData(response, '북마크 처리에 실패했습니다.');
  }

  // 사용자 후원 내역 조회
  async getUserBackings(userId: string): Promise<FundingProject[]> {
    const response = await api.get<FundingProjectApi[]>(
      `/funding/users/${userId}/backings`,
    );
    const projects = ensureSuccess(
      response,
      '후원 내역을 불러오지 못했습니다.',
    ).data;

    return normalizeProjectList(projects);
  }

  // 아티스트 프로젝트 목록 조회
  async getArtistProjects(artistId: string): Promise<FundingProject[]> {
    const response = await api.get<FundingProjectApi[]>(
      `/funding/artists/${artistId}/projects`,
    );
    const projects = ensureSuccess(
      response,
      '아티스트 프로젝트를 불러오지 못했습니다.',
    ).data;

    return normalizeProjectList(projects);
  }

  // 프로젝트 승인 (관리자)
  async approveProject(projectId: number): Promise<void> {
    ensureSuccess(
      await api.post(`/funding/projects/${projectId}/approve`),
      '프로젝트 승인에 실패했습니다.',
    );
  }

  // 프로젝트 거부 (관리자)
  async rejectProject(projectId: number, reason: string): Promise<void> {
    ensureSuccess(
      await api.post(`/funding/projects/${projectId}/reject`, { reason }),
      '프로젝트 거부에 실패했습니다.',
    );
  }
}

export const fundingService = new FundingService();
