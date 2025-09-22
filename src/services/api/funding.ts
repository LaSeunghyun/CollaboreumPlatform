import type { ApiResponse } from '@/shared/types';
import type { FundingProject, RevenueShare } from '@/types/fundingProject';

import { apiCall, extractApiData } from './base';

const toArray = <T>(value: T[] | undefined | null): T[] =>
  Array.isArray(value) ? value : [];

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const toIsoString = (value: unknown): string => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const createId = (value: unknown, prefix: string): string => {
  if (!value) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  if (typeof value === 'string') {
    return value.trim() !== ''
      ? value
      : `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object' && value !== null && '_id' in value) {
    return createId((value as Record<string, unknown>)._id, prefix);
  }

  return String(value);
};

const mapRevenueShare = (
  share: unknown,
  totalRevenue: number,
): RevenueShare => {
  if (share && typeof share === 'object' && !Array.isArray(share)) {
    const shareObject = share as { amount?: unknown; percentage?: unknown };
    const derivedAmount =
      typeof shareObject.percentage === 'number'
        ? Math.round((shareObject.percentage / 100) * totalRevenue)
        : 0;
    const amount = toNumber(shareObject.amount, derivedAmount);
    const percentage =
      typeof shareObject.percentage === 'number'
        ? shareObject.percentage
        : totalRevenue > 0
          ? Number(((amount / totalRevenue) * 100).toFixed(2))
          : 0;

    return {
      amount,
      percentage,
    };
  }

  const ratio = toNumber(share);
  return {
    amount: Math.round(ratio * totalRevenue),
    percentage: Number((ratio * 100).toFixed(2)),
  };
};

export const mapFundingProjectDetail = (
  project: any,
): FundingProject | null => {
  if (!project) {
    return null;
  }

  const totalRevenue = toNumber(
    project?.revenueDistribution?.totalRevenue,
    toNumber(project?.currentAmount),
  );
  const backersArray = project.backersList ?? project.backers;

  const goalAmount = toNumber(
    project.goalAmount,
    toNumber(project.targetAmount),
  );

  return {
    id: createId(project.id ?? project._id, 'project'),
    title: typeof project.title === 'string' ? project.title : '',
    description:
      typeof project.description === 'string' ? project.description : '',
    artist:
      typeof project.artist === 'string'
        ? project.artist
        : typeof project.artistName === 'string'
          ? project.artistName
          : '',
    category: typeof project.category === 'string' ? project.category : '',
    goalAmount,
    targetAmount: toNumber(project.targetAmount, goalAmount),
    currentAmount: toNumber(project.currentAmount),
    backers:
      typeof project.backers === 'number'
        ? project.backers
        : Array.isArray(project.backers)
          ? project.backers.length
          : Array.isArray(project.backersList)
            ? project.backersList.length
            : 0,
    daysLeft: toNumber(project.daysLeft),
    image: typeof project.image === 'string' ? project.image : '',
    status: typeof project.status === 'string' ? project.status : '',
    progressPercentage: toNumber(
      project.progressPercentage,
      toNumber(project.progress),
    ),
    startDate: toIsoString(project.startDate),
    endDate: toIsoString(project.endDate),
    story:
      typeof project.story === 'string'
        ? project.story
        : typeof project.description === 'string'
          ? project.description
          : undefined,
    artistAvatar:
      typeof project.artistAvatar === 'string'
        ? project.artistAvatar
        : undefined,
    artistRating:
      typeof project.artistRating === 'number'
        ? project.artistRating
        : undefined,
    artistId: project.artistId
      ? String(project.artistId)
      : project.artist &&
          typeof project.artist === 'object' &&
          '_id' in project.artist
        ? String((project.artist as { _id: unknown })._id)
        : undefined,
    featured:
      typeof project.featured === 'boolean' ? project.featured : undefined,
    rewards: toArray(project.rewards).map((reward: any) => ({
      id: createId(reward.id ?? reward._id ?? reward.title, 'reward'),
      title: typeof reward.title === 'string' ? reward.title : '',
      description:
        typeof reward.description === 'string' ? reward.description : '',
      amount: toNumber(reward.amount),
      estimatedDelivery: toIsoString(reward.estimatedDelivery),
      claimed: typeof reward.claimed === 'number' ? reward.claimed : undefined,
      maxClaim:
        typeof reward.maxClaim === 'number' ? reward.maxClaim : undefined,
    })),
    updates: toArray(project.updates).map((update: any) => ({
      id: createId(update.id ?? update._id ?? update.title, 'update'),
      title: typeof update.title === 'string' ? update.title : '',
      content: typeof update.content === 'string' ? update.content : '',
      date: toIsoString(update.date ?? update.createdAt),
      type: typeof update.type === 'string' ? update.type : undefined,
      createdAt: update.createdAt ? toIsoString(update.createdAt) : undefined,
    })),
    backersList: toArray(backersArray).map((backer: any) => ({
      id: createId(backer.id ?? backer._id ?? backer.user, 'backer'),
      userId: backer.userId
        ? String(backer.userId)
        : backer.user
          ? String(backer.user)
          : undefined,
      userName:
        typeof backer.userName === 'string'
          ? backer.userName
          : backer.isAnonymous
            ? '익명 후원자'
            : '익명 후원자',
      amount: toNumber(backer.amount),
      date: toIsoString(backer.date ?? backer.backedAt),
      status: typeof backer.status === 'string' ? backer.status : '완료',
    })),
    executionPlan: {
      stages: toArray(project.executionPlan?.stages).map((stage: any) => ({
        id: createId(stage.id ?? stage._id ?? stage.name, 'stage'),
        name: typeof stage.name === 'string' ? stage.name : '',
        description:
          typeof stage.description === 'string' ? stage.description : '',
        budget: toNumber(stage.budget),
        startDate: toIsoString(stage.startDate),
        endDate: toIsoString(stage.endDate),
        status: typeof stage.status === 'string' ? stage.status : '계획',
        progress: toNumber(stage.progress),
      })),
      totalBudget: toNumber(
        project.executionPlan?.totalBudget,
        toNumber(project.goalAmount),
      ),
    },
    expenseRecords: toArray(project.expenseRecords).map((expense: any) => ({
      id: createId(expense.id ?? expense._id ?? expense.title, 'expense'),
      category: typeof expense.category === 'string' ? expense.category : '',
      title: typeof expense.title === 'string' ? expense.title : '',
      description:
        typeof expense.description === 'string' ? expense.description : '',
      amount: toNumber(expense.amount),
      date: toIsoString(expense.date),
      receipt: typeof expense.receipt === 'string' ? expense.receipt : '',
      stage: expense.stage ? String(expense.stage) : '',
      verified: Boolean(expense.verified),
    })),
    revenueDistribution: {
      totalRevenue,
      platformFee: mapRevenueShare(
        project.revenueDistribution?.platformFee,
        totalRevenue,
      ),
      artistShare: mapRevenueShare(
        project.revenueDistribution?.artistShare,
        totalRevenue,
      ),
      backerShare: mapRevenueShare(
        project.revenueDistribution?.backerShare,
        totalRevenue,
      ),
      distributions: toArray(project.revenueDistribution?.distributions).map(
        (distribution: any) => ({
          id: createId(
            distribution.id ?? distribution._id ?? distribution.backer,
            'distribution',
          ),
          backer: distribution.backer ? String(distribution.backer) : undefined,
          userName:
            typeof distribution.userName === 'string'
              ? distribution.userName
              : '익명 후원자',
          originalAmount: toNumber(distribution.originalAmount),
          profitShare: toNumber(distribution.profitShare),
          amount: toNumber(distribution.amount ?? distribution.totalReturn),
          date: toIsoString(distribution.date ?? distribution.distributedAt),
          status:
            typeof distribution.status === 'string'
              ? distribution.status
              : '대기',
        }),
      ),
    },
  };
};

export const fundingAPI = {
  getProjects: (filters?: any) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return apiCall(`/funding/projects${queryParams}`);
  },

  getProject: async (projectId: string): Promise<FundingProject | null> => {
    const response = await apiCall<ApiResponse<FundingProject>>(
      `/funding/projects/${projectId}`,
    );
    return mapFundingProjectDetail(extractApiData(response));
  },

  getProjectDetail: async (
    projectId: string,
  ): Promise<FundingProject | null> => {
    const response = await apiCall<ApiResponse<FundingProject>>(
      `/funding/projects/${projectId}`,
    );
    return mapFundingProjectDetail(extractApiData(response));
  },

  createProject: (projectData: any) =>
    apiCall('/funding/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  updateProject: (projectId: string, projectData: any) =>
    apiCall(`/funding/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  backProject: (projectId: string, backData: any) =>
    apiCall(`/funding/projects/${projectId}/back`, {
      method: 'POST',
      body: JSON.stringify(backData),
    }),

  refundProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/refund`, {
      method: 'POST',
    }),

  updateExecutionPlan: (projectId: string, executionData: any) =>
    apiCall(`/funding/projects/${projectId}/execution`, {
      method: 'PUT',
      body: JSON.stringify(executionData),
    }),

  addExpense: (projectId: string, expenseData: any) =>
    apiCall(`/funding/projects/${projectId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    }),

  distributeRevenue: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/distribute-revenue`, {
      method: 'POST',
    }),

  likeProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/like`, {
      method: 'POST',
    }),

  bookmarkProject: (projectId: string) =>
    apiCall(`/funding/projects/${projectId}/bookmark`, {
      method: 'POST',
    }),

  getProjectDetails: (projectId: number) =>
    fundingAPI.getProjectDetail(String(projectId)),

  investInProject: (projectId: number, amount: number) =>
    apiCall(`/funding/projects/${projectId}/invest`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  getProjectUpdates: (projectId: number) =>
    apiCall(`/funding/projects/${projectId}/updates`),
};
