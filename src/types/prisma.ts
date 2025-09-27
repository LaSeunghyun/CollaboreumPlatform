type EnumValue<T extends Record<string, string>> = T[keyof T];

type EnumRecord = Record<string, string>;

const createEnumRecord = <T extends EnumRecord>(values: T) =>
  Object.freeze(values);

export const UserRole = createEnumRecord({
  ARTIST: 'ARTIST',
  ADMIN: 'ADMIN',
  FAN: 'FAN',
} as const);
export type UserRole = EnumValue<typeof UserRole>;

export const ArtistCategory = createEnumRecord({
  MUSIC: 'MUSIC',
  ART: 'ART',
  VIDEO: 'VIDEO',
  LITERATURE: 'LITERATURE',
  CRAFT: 'CRAFT',
  DESIGN: 'DESIGN',
  OTHER: 'OTHER',
} as const);
export type ArtistCategory = EnumValue<typeof ArtistCategory>;

export const ArtistGenre = createEnumRecord({
  POP: 'POP',
  ROCK: 'ROCK',
  RNB: 'RNB',
  JAZZ: 'JAZZ',
  CLASSICAL: 'CLASSICAL',
  HIPHOP: 'HIPHOP',
  ELECTRONIC: 'ELECTRONIC',
  INDIE: 'INDIE',
  ALTERNATIVE: 'ALTERNATIVE',
  COUNTRY: 'COUNTRY',
  REGGAE: 'REGGAE',
  BLUES: 'BLUES',
  SOUL: 'SOUL',
  PUNK: 'PUNK',
  METAL: 'METAL',
  OTHER: 'OTHER',
} as const);
export type ArtistGenre = EnumValue<typeof ArtistGenre>;

export const ProjectCategory = createEnumRecord({
  MUSIC: 'MUSIC',
  VIDEO: 'VIDEO',
  PERFORMANCE: 'PERFORMANCE',
  BOOK: 'BOOK',
  GAME: 'GAME',
  OTHER: 'OTHER',
} as const);
export type ProjectCategory = EnumValue<typeof ProjectCategory>;

export const ProjectStatus = createEnumRecord({
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
} as const);
export type ProjectStatus = EnumValue<typeof ProjectStatus>;

export const ProjectApprovalStatus = createEnumRecord({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const);
export type ProjectApprovalStatus = EnumValue<typeof ProjectApprovalStatus>;

export const ProjectTaskStatus = createEnumRecord({
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
} as const);
export type ProjectTaskStatus = EnumValue<typeof ProjectTaskStatus>;

export const ProjectMilestoneStatus = createEnumRecord({
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DELAYED: 'DELAYED',
} as const);
export type ProjectMilestoneStatus = EnumValue<typeof ProjectMilestoneStatus>;

export const PriorityLevel = createEnumRecord({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const);
export type PriorityLevel = EnumValue<typeof PriorityLevel>;

export const EventCategory = createEnumRecord({
  FESTIVAL: 'FESTIVAL',
  PERFORMANCE: 'PERFORMANCE',
  COMPETITION: 'COMPETITION',
  WORKSHOP: 'WORKSHOP',
  SEMINAR: 'SEMINAR',
  OTHER: 'OTHER',
} as const);
export type EventCategory = EnumValue<typeof EventCategory>;

export const EventStatus = createEnumRecord({
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const);
export type EventStatus = EnumValue<typeof EventStatus>;

export const EventTicketType = createEnumRecord({
  REGULAR: 'REGULAR',
  VIP: 'VIP',
  EARLY_BIRD: 'EARLY_BIRD',
  STUDENT: 'STUDENT',
} as const);
export type EventTicketType = EnumValue<typeof EventTicketType>;

export const LiveStreamCategory = createEnumRecord({
  MUSIC: 'MUSIC',
  PERFORMANCE: 'PERFORMANCE',
  TALK: 'TALK',
  WORKSHOP: 'WORKSHOP',
  OTHER: 'OTHER',
} as const);
export type LiveStreamCategory = EnumValue<typeof LiveStreamCategory>;

export const LiveStreamStatus = createEnumRecord({
  SCHEDULED: 'SCHEDULED',
  LIVE: 'LIVE',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
} as const);
export type LiveStreamStatus = EnumValue<typeof LiveStreamStatus>;

export const FundingProjectStatus = createEnumRecord({
  PREPARING: 'PREPARING',
  IN_PROGRESS: 'IN_PROGRESS',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
} as const);
export type FundingProjectStatus = EnumValue<typeof FundingProjectStatus>;

export const FundingProjectType = createEnumRecord({
  REGULAR: 'REGULAR',
  EXECUTION_IN_PROGRESS: 'EXECUTION_IN_PROGRESS',
  EXPENSE_PUBLIC: 'EXPENSE_PUBLIC',
  REVENUE_DISTRIBUTION: 'REVENUE_DISTRIBUTION',
} as const);
export type FundingProjectType = EnumValue<typeof FundingProjectType>;

export const FundingExecutionStatus = createEnumRecord({
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  DELAYED: 'DELAYED',
} as const);
export type FundingExecutionStatus = EnumValue<typeof FundingExecutionStatus>;

export const FundingExpenseCategory = createEnumRecord({
  LABOR: 'LABOR',
  MATERIAL: 'MATERIAL',
  EQUIPMENT: 'EQUIPMENT',
  MARKETING: 'MARKETING',
  OTHER: 'OTHER',
} as const);
export type FundingExpenseCategory = EnumValue<typeof FundingExpenseCategory>;

export const FundingDistributionStatus = createEnumRecord({
  WAITING: 'WAITING',
  DISTRIBUTED: 'DISTRIBUTED',
  PAID: 'PAID',
} as const);
export type FundingDistributionStatus = EnumValue<typeof FundingDistributionStatus>;

export const FundingUpdateType = createEnumRecord({
  GENERAL: 'GENERAL',
  EXECUTION_PROGRESS: 'EXECUTION_PROGRESS',
  EXPENSE_PUBLIC: 'EXPENSE_PUBLIC',
  REVENUE_SHARE: 'REVENUE_SHARE',
} as const);
export type FundingUpdateType = EnumValue<typeof FundingUpdateType>;

export const DistributionStatus = createEnumRecord({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const);
export type DistributionStatus = EnumValue<typeof DistributionStatus>;

export const ExpenseVerificationStatus = createEnumRecord({
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const);
export type ExpenseVerificationStatus = EnumValue<typeof ExpenseVerificationStatus>;

export const TrackGenre = createEnumRecord({
  INDIE_POP: 'INDIE_POP',
  ROCK: 'ROCK',
  ACOUSTIC: 'ACOUSTIC',
  JAZZ: 'JAZZ',
  CLASSICAL: 'CLASSICAL',
  ELECTRONIC: 'ELECTRONIC',
  HIPHOP: 'HIPHOP',
  RNB: 'RNB',
  OTHER: 'OTHER',
} as const);
export type TrackGenre = EnumValue<typeof TrackGenre>;

export const MusicMood = createEnumRecord({
  EXCITING: 'EXCITING',
  EMOTIONAL: 'EMOTIONAL',
  CALM: 'CALM',
  INTENSE: 'INTENSE',
  MELANCHOLY: 'MELANCHOLY',
  HOPEFUL: 'HOPEFUL',
  ROMANTIC: 'ROMANTIC',
  MYSTERIOUS: 'MYSTERIOUS',
} as const);
export type MusicMood = EnumValue<typeof MusicMood>;

export const MusicKey = createEnumRecord({
  C: 'C',
  C_SHARP: 'C_SHARP',
  D: 'D',
  D_SHARP: 'D_SHARP',
  E: 'E',
  F: 'F',
  F_SHARP: 'F_SHARP',
  G: 'G',
  G_SHARP: 'G_SHARP',
  A: 'A',
  A_SHARP: 'A_SHARP',
  B: 'B',
} as const);
export type MusicKey = EnumValue<typeof MusicKey>;

export const LicenseType = createEnumRecord({
  ALL_RIGHTS_RESERVED: 'ALL_RIGHTS_RESERVED',
  CREATIVE_COMMONS: 'CREATIVE_COMMONS',
  PUBLIC_DOMAIN: 'PUBLIC_DOMAIN',
} as const);
export type LicenseType = EnumValue<typeof LicenseType>;

export const ArtworkCategory = createEnumRecord({
  MUSIC: 'MUSIC',
  ART: 'ART',
  LITERATURE: 'LITERATURE',
  PERFORMANCE: 'PERFORMANCE',
} as const);
export type ArtworkCategory = EnumValue<typeof ArtworkCategory>;

export const ArtworkType = createEnumRecord({
  AUDIO: 'AUDIO',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  TEXT: 'TEXT',
} as const);
export type ArtworkType = EnumValue<typeof ArtworkType>;

export const ArtworkStatus = createEnumRecord({
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const);
export type ArtworkStatus = EnumValue<typeof ArtworkStatus>;

export const NotificationType = createEnumRecord({
  FUNDING: 'FUNDING',
  EVENT: 'EVENT',
  POINT: 'POINT',
  FOLLOW: 'FOLLOW',
  PROJECT: 'PROJECT',
  COMMENT: 'COMMENT',
  LIKE: 'LIKE',
  SYSTEM: 'SYSTEM',
} as const);
export type NotificationType = EnumValue<typeof NotificationType>;

export const PaymentMethod = createEnumRecord({
  CARD: 'CARD',
  BANK: 'BANK',
  KAKAO: 'KAKAO',
  NAVER: 'NAVER',
} as const);
export type PaymentMethod = EnumValue<typeof PaymentMethod>;

export const PaymentProvider = createEnumRecord({
  TOSS: 'TOSS',
  IAMPORT: 'IAMPORT',
} as const);
export type PaymentProvider = EnumValue<typeof PaymentProvider>;

export const PaymentStatus = createEnumRecord({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const);
export type PaymentStatus = EnumValue<typeof PaymentStatus>;

export const CommunityPostCategory = createEnumRecord({
  FREE: 'FREE',
  QUESTION: 'QUESTION',
  MUSIC: 'MUSIC',
  ART: 'ART',
  LITERATURE: 'LITERATURE',
  PERFORMANCE: 'PERFORMANCE',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  TECHNOLOGY: 'TECHNOLOGY',
  OTHER: 'OTHER',
} as const);
export type CommunityPostCategory = EnumValue<typeof CommunityPostCategory>;

export const ReactionType = createEnumRecord({
  LIKE: 'LIKE',
  DISLIKE: 'DISLIKE',
} as const);
export type ReactionType = EnumValue<typeof ReactionType>;

export const PrismaEnums = {
  USER_ROLES: UserRole,
  ARTIST_CATEGORIES: ArtistCategory,
  ARTIST_GENRES: ArtistGenre,
  PROJECT_CATEGORIES: ProjectCategory,
  PROJECT_STATUSES: ProjectStatus,
  PROJECT_APPROVAL_STATUSES: ProjectApprovalStatus,
  TASK_STATUSES: ProjectTaskStatus,
  MILESTONE_STATUSES: ProjectMilestoneStatus,
  PRIORITIES: PriorityLevel,
  EVENT_CATEGORIES: EventCategory,
  EVENT_STATUSES: EventStatus,
  EVENT_TICKET_TYPES: EventTicketType,
  LIVESTREAM_CATEGORIES: LiveStreamCategory,
  LIVESTREAM_STATUSES: LiveStreamStatus,
  FUNDING_PROJECT_STATUSES: FundingProjectStatus,
  FUNDING_PROJECT_TYPES: FundingProjectType,
  FUNDING_EXECUTION_STATUSES: FundingExecutionStatus,
  EXPENSE_CATEGORIES: FundingExpenseCategory,
  FUNDING_DISTRIBUTION_STATUSES: FundingDistributionStatus,
  DISTRIBUTION_STATUSES: FundingDistributionStatus,
  REVENUE_DISTRIBUTION_STATUSES: DistributionStatus,
  FUNDING_UPDATE_TYPES: FundingUpdateType,
  EXPENSE_VERIFICATION_STATUSES: ExpenseVerificationStatus,
  TRACK_GENRES: TrackGenre,
  MUSIC_KEYS: Object.values(MusicKey),
  MUSIC_MOODS: MusicMood,
  LICENSES: LicenseType,
  ARTWORK_CATEGORIES: ArtworkCategory,
  ARTWORK_TYPES: ArtworkType,
  ARTWORK_STATUSES: ArtworkStatus,
  NOTIFICATION_TYPES: NotificationType,
  PAYMENT_METHODS: PaymentMethod,
  PAYMENT_PROVIDERS: PaymentProvider,
  PAYMENT_STATUSES: PaymentStatus,
  COMMUNITY_POST_CATEGORIES: CommunityPostCategory,
  REACTION_TYPES: ReactionType,
} as const;
