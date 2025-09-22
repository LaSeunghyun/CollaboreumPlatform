import type {
  Backer,
  ExecutionPlan,
  ExpenseRecord,
  FundingProject,
  FundingProjectBackerPayload,
  FundingProjectDistributionPayload,
  FundingProjectExecutionPlanPayload,
  FundingProjectExpensePayload,
  FundingProjectPayload,
  FundingProjectRewardPayload,
  FundingProjectUpdatePayload,
  RevenueDistribution,
  RevenueShare,
  RevenueSharePayload,
} from '@/types/fundingProject';

const toArray = <T>(value?: readonly (T | null | undefined)[] | null): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is T => item != null);
};

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

  if (
    typeof value === 'object' &&
    value !== null &&
    '_id' in (value as Record<string, unknown>)
  ) {
    return createId((value as Record<string, unknown>)._id, prefix);
  }

  return String(value);
};

const mapRevenueShare = (
  share: RevenueSharePayload,
  totalRevenue: number,
): RevenueShare => {
  if (share && typeof share === 'object' && !Array.isArray(share)) {
    const shareObject = share as { amount?: unknown; percentage?: unknown };
    const rawPercentage = shareObject.percentage;
    const percentageValue =
      typeof rawPercentage === 'number'
        ? rawPercentage
        : typeof rawPercentage === 'string'
          ? toNumber(rawPercentage)
          : undefined;
    const derivedAmount =
      percentageValue !== undefined
        ? Math.round((percentageValue / 100) * totalRevenue)
        : 0;
    const amount = toNumber(shareObject.amount, derivedAmount);
    const percentage =
      percentageValue !== undefined
        ? percentageValue
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

export const mapRewards = (
  rewards?: FundingProjectPayload['rewards'],
): FundingProject['rewards'] => {
  return toArray<FundingProjectRewardPayload>(rewards).map(reward => ({
    id: createId(reward.id ?? reward._id ?? reward.title, 'reward'),
    title: typeof reward.title === 'string' ? reward.title : '',
    description:
      typeof reward.description === 'string' ? reward.description : '',
    amount: toNumber(reward.amount),
    estimatedDelivery: toIsoString(reward.estimatedDelivery),
    claimed:
      typeof reward.claimed === 'number'
        ? reward.claimed
        : typeof reward.claimed === 'string'
          ? toNumber(reward.claimed)
          : undefined,
    maxClaim:
      typeof reward.maxClaim === 'number'
        ? reward.maxClaim
        : typeof reward.maxClaim === 'string'
          ? toNumber(reward.maxClaim)
          : undefined,
  }));
};

export const mapUpdates = (
  updates?: FundingProjectPayload['updates'],
): FundingProject['updates'] => {
  return toArray<FundingProjectUpdatePayload>(updates).map(update => ({
    id: createId(update.id ?? update._id ?? update.title, 'update'),
    title: typeof update.title === 'string' ? update.title : '',
    content: typeof update.content === 'string' ? update.content : '',
    date: toIsoString(update.date ?? update.createdAt),
    type: typeof update.type === 'string' ? update.type : undefined,
    createdAt: update.createdAt ? toIsoString(update.createdAt) : undefined,
  }));
};

export const mapBackers = (
  backers: Pick<FundingProjectPayload, 'backers' | 'backersList'>,
): Backer[] => {
  const fallbackBackers = Array.isArray(backers.backers)
    ? backers.backers
    : undefined;

  return toArray<FundingProjectBackerPayload>(
    backers.backersList ?? fallbackBackers,
  ).map(backer => ({
    id: createId(backer.id ?? backer._id ?? backer.user, 'backer'),
    userId: backer.userId
      ? String(backer.userId)
      : backer.user
        ? String(
            typeof backer.user === 'object' &&
              backer.user &&
              '_id' in backer.user
              ? (backer.user as { _id?: unknown })._id
              : backer.user,
          )
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
  }));
};

export const mapExecutionPlan = (
  executionPlan: FundingProjectExecutionPlanPayload | undefined,
  fallbackBudget: number,
): ExecutionPlan => {
  return {
    stages: toArray(executionPlan?.stages).map(stage => ({
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
    totalBudget: toNumber(executionPlan?.totalBudget, fallbackBudget),
  };
};

export const mapExpenseRecords = (
  expenses?: FundingProjectPayload['expenseRecords'],
): ExpenseRecord[] => {
  return toArray<FundingProjectExpensePayload>(expenses).map(expense => ({
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
  }));
};

export const mapRevenueDistribution = (
  revenueDistribution: FundingProjectPayload['revenueDistribution'],
  totalRevenue: number,
): RevenueDistribution => {
  return {
    totalRevenue,
    platformFee: mapRevenueShare(
      revenueDistribution?.platformFee,
      totalRevenue,
    ),
    artistShare: mapRevenueShare(
      revenueDistribution?.artistShare,
      totalRevenue,
    ),
    backerShare: mapRevenueShare(
      revenueDistribution?.backerShare,
      totalRevenue,
    ),
    distributions: toArray<FundingProjectDistributionPayload>(
      revenueDistribution?.distributions,
    ).map(distribution => ({
      id: createId(
        distribution.id ?? distribution._id ?? distribution.backer,
        'distribution',
      ),
      backer: distribution.backer
        ? String(
            typeof distribution.backer === 'object' &&
              distribution.backer &&
              '_id' in distribution.backer
              ? (distribution.backer as { _id?: unknown })._id
              : distribution.backer,
          )
        : undefined,
      userName:
        typeof distribution.userName === 'string'
          ? distribution.userName
          : '익명 후원자',
      originalAmount: toNumber(distribution.originalAmount),
      profitShare: toNumber(distribution.profitShare),
      amount: toNumber(distribution.amount ?? distribution.totalReturn),
      date: toIsoString(distribution.date ?? distribution.distributedAt),
      status:
        typeof distribution.status === 'string' ? distribution.status : '대기',
    })),
  };
};

export const mapFundingProjectDetail = (
  project: FundingProjectPayload | null | undefined,
): FundingProject | null => {
  if (!project) {
    return null;
  }

  const goalAmount = toNumber(
    project.goalAmount,
    toNumber(project.targetAmount),
  );
  const targetAmount = toNumber(project.targetAmount, goalAmount);
  const currentAmount = toNumber(project.currentAmount);
  const totalRevenue = toNumber(
    project.revenueDistribution?.totalRevenue,
    currentAmount,
  );

  const backerCount =
    typeof project.backers === 'number'
      ? project.backers
      : Array.isArray(project.backers)
        ? project.backers.length
        : Array.isArray(project.backersList)
          ? project.backersList.filter(
              (item): item is NonNullable<typeof item> => item != null,
            ).length
          : 0;

  const artistName =
    typeof project.artist === 'string'
      ? project.artist
      : project.artist && typeof project.artist === 'object'
        ? typeof (project.artist as { name?: unknown }).name === 'string'
          ? (project.artist as { name: string }).name
          : typeof project.artistName === 'string'
            ? project.artistName
            : ''
        : typeof project.artistName === 'string'
          ? project.artistName
          : '';

  return {
    id: createId(project.id ?? project._id, 'project'),
    title: typeof project.title === 'string' ? project.title : '',
    description:
      typeof project.description === 'string' ? project.description : '',
    artist: artistName,
    category: typeof project.category === 'string' ? project.category : '',
    goalAmount,
    targetAmount,
    currentAmount,
    backers: backerCount,
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
          project.artist !== null &&
          '_id' in project.artist
        ? String((project.artist as { _id?: unknown })._id)
        : undefined,
    featured:
      typeof project.featured === 'boolean' ? project.featured : undefined,
    rewards: mapRewards(project.rewards),
    updates: mapUpdates(project.updates),
    backersList: mapBackers({
      backers: project.backers,
      backersList: project.backersList,
    }),
    executionPlan: mapExecutionPlan(project.executionPlan, goalAmount),
    expenseRecords: mapExpenseRecords(project.expenseRecords),
    revenueDistribution: mapRevenueDistribution(
      project.revenueDistribution,
      totalRevenue,
    ),
  };
};

export type { FundingProjectPayload };
