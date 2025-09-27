import type {
  UserRole as UserRoleValue,
  ArtistCategory as ArtistCategoryValue,
  ArtistGenre as ArtistGenreValue,
  ProjectCategory as ProjectCategoryValue,
  ProjectStatus as ProjectStatusValue,
  ProjectApprovalStatus as ProjectApprovalStatusValue,
  ProjectTaskStatus as ProjectTaskStatusValue,
  ProjectMilestoneStatus as ProjectMilestoneStatusValue,
  PriorityLevel as PriorityLevelValue,
  EventCategory as EventCategoryValue,
  EventStatus as EventStatusValue,
  EventTicketType as EventTicketTypeValue,
  LiveStreamCategory as LiveStreamCategoryValue,
  LiveStreamStatus as LiveStreamStatusValue,
  FundingProjectStatus as FundingProjectStatusValue,
  FundingProjectType as FundingProjectTypeValue,
  FundingExecutionStatus as FundingExecutionStatusValue,
  FundingExpenseCategory as FundingExpenseCategoryValue,
  FundingDistributionStatus as FundingDistributionStatusValue,
  DistributionStatus as DistributionStatusValue,
  FundingUpdateType as FundingUpdateTypeValue,
  ExpenseVerificationStatus as ExpenseVerificationStatusValue,
  TrackGenre as TrackGenreValue,
  MusicMood as MusicMoodValue,
  MusicKey as MusicKeyValue,
  LicenseType as LicenseTypeValue,
  ArtworkCategory as ArtworkCategoryValue,
  ArtworkType as ArtworkTypeValue,
  ArtworkStatus as ArtworkStatusValue,
  NotificationType as NotificationTypeValue,
  PaymentMethod as PaymentMethodValue,
  PaymentProvider as PaymentProviderValue,
  PaymentStatus as PaymentStatusValue,
  CommunityPostCategory as CommunityPostCategoryValue,
  ReactionType as ReactionTypeValue,
} from './prisma';

type EnumObject<T extends string> = Readonly<Record<string, T>>;

declare module '@prisma/client' {
  export class PrismaClient {
    constructor(...args: unknown[]);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(event: string, callback: (...args: any[]) => void): void;
    $transaction<T>(promises: Promise<T>[]): Promise<T[]>;
    $use(middleware: (...args: any[]) => unknown): void;
  }

  export namespace Prisma {
    class PrismaClientKnownRequestError extends Error {
      code: string;
      clientVersion: string;
      meta?: Record<string, unknown>;
    }
    class PrismaClientUnknownRequestError extends Error {
      clientVersion: string;
    }
    class PrismaClientRustPanicError extends Error {
      clientVersion: string;
    }
    class PrismaClientInitializationError extends Error {
      clientVersion: string;
    }
    class PrismaClientValidationError extends Error {}

    type UserRole = UserRoleValue;
    const UserRole: EnumObject<UserRoleValue>;

    type ArtistCategory = ArtistCategoryValue;
    const ArtistCategory: EnumObject<ArtistCategoryValue>;

    type ArtistGenre = ArtistGenreValue;
    const ArtistGenre: EnumObject<ArtistGenreValue>;

    type ProjectCategory = ProjectCategoryValue;
    const ProjectCategory: EnumObject<ProjectCategoryValue>;

    type ProjectStatus = ProjectStatusValue;
    const ProjectStatus: EnumObject<ProjectStatusValue>;

    type ProjectApprovalStatus = ProjectApprovalStatusValue;
    const ProjectApprovalStatus: EnumObject<ProjectApprovalStatusValue>;

    type ProjectTaskStatus = ProjectTaskStatusValue;
    const ProjectTaskStatus: EnumObject<ProjectTaskStatusValue>;

    type ProjectMilestoneStatus = ProjectMilestoneStatusValue;
    const ProjectMilestoneStatus: EnumObject<ProjectMilestoneStatusValue>;

    type PriorityLevel = PriorityLevelValue;
    const PriorityLevel: EnumObject<PriorityLevelValue>;

    type EventCategory = EventCategoryValue;
    const EventCategory: EnumObject<EventCategoryValue>;

    type EventStatus = EventStatusValue;
    const EventStatus: EnumObject<EventStatusValue>;

    type EventTicketType = EventTicketTypeValue;
    const EventTicketType: EnumObject<EventTicketTypeValue>;

    type LiveStreamCategory = LiveStreamCategoryValue;
    const LiveStreamCategory: EnumObject<LiveStreamCategoryValue>;

    type LiveStreamStatus = LiveStreamStatusValue;
    const LiveStreamStatus: EnumObject<LiveStreamStatusValue>;

    type FundingProjectStatus = FundingProjectStatusValue;
    const FundingProjectStatus: EnumObject<FundingProjectStatusValue>;

    type FundingProjectType = FundingProjectTypeValue;
    const FundingProjectType: EnumObject<FundingProjectTypeValue>;

    type FundingExecutionStatus = FundingExecutionStatusValue;
    const FundingExecutionStatus: EnumObject<FundingExecutionStatusValue>;

    type FundingExpenseCategory = FundingExpenseCategoryValue;
    const FundingExpenseCategory: EnumObject<FundingExpenseCategoryValue>;

    type FundingDistributionStatus = FundingDistributionStatusValue;
    const FundingDistributionStatus: EnumObject<FundingDistributionStatusValue>;

    type DistributionStatus = DistributionStatusValue;
    const DistributionStatus: EnumObject<DistributionStatusValue>;

    type FundingUpdateType = FundingUpdateTypeValue;
    const FundingUpdateType: EnumObject<FundingUpdateTypeValue>;

    type ExpenseVerificationStatus = ExpenseVerificationStatusValue;
    const ExpenseVerificationStatus: EnumObject<ExpenseVerificationStatusValue>;

    type TrackGenre = TrackGenreValue;
    const TrackGenre: EnumObject<TrackGenreValue>;

    type MusicMood = MusicMoodValue;
    const MusicMood: EnumObject<MusicMoodValue>;

    type MusicKey = MusicKeyValue;
    const MusicKey: EnumObject<MusicKeyValue>;

    type LicenseType = LicenseTypeValue;
    const LicenseType: EnumObject<LicenseTypeValue>;

    type ArtworkCategory = ArtworkCategoryValue;
    const ArtworkCategory: EnumObject<ArtworkCategoryValue>;

    type ArtworkType = ArtworkTypeValue;
    const ArtworkType: EnumObject<ArtworkTypeValue>;

    type ArtworkStatus = ArtworkStatusValue;
    const ArtworkStatus: EnumObject<ArtworkStatusValue>;

    type NotificationType = NotificationTypeValue;
    const NotificationType: EnumObject<NotificationTypeValue>;

    type PaymentMethod = PaymentMethodValue;
    const PaymentMethod: EnumObject<PaymentMethodValue>;

    type PaymentProvider = PaymentProviderValue;
    const PaymentProvider: EnumObject<PaymentProviderValue>;

    type PaymentStatus = PaymentStatusValue;
    const PaymentStatus: EnumObject<PaymentStatusValue>;

    type CommunityPostCategory = CommunityPostCategoryValue;
    const CommunityPostCategory: EnumObject<CommunityPostCategoryValue>;

    type ReactionType = ReactionTypeValue;
    const ReactionType: EnumObject<ReactionTypeValue>;
  }
}
