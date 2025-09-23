// 백엔드에서 제공하는 enum 값들의 TypeScript 타입 정의

export interface Enums {
  USER_ROLES: {
    ARTIST: string;
    ADMIN: string;
    FAN: string;
  };
  ARTIST_CATEGORIES: {
    MUSIC: string;
    ART: string;
    VIDEO: string;
    LITERATURE: string;
    CRAFT: string;
    DESIGN: string;
    OTHER: string;
  };
  ARTIST_GENRES: {
    POP: string;
    ROCK: string;
    RNB: string;
    JAZZ: string;
    CLASSICAL: string;
    HIPHOP: string;
    ELECTRONIC: string;
    INDIE: string;
    ALTERNATIVE: string;
    COUNTRY: string;
    REGGAE: string;
    BLUES: string;
    SOUL: string;
    PUNK: string;
    METAL: string;
    OTHER: string;
  };
  PROJECT_CATEGORIES: {
    MUSIC: string;
    VIDEO: string;
    PERFORMANCE: string;
    BOOK: string;
    GAME: string;
    OTHER: string;
  };
  PROJECT_STATUSES: {
    PLANNING: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    PENDING: string;
    CANCELLED: string;
  };
  TASK_STATUSES: {
    WAITING: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    PENDING: string;
  };
  EVENT_CATEGORIES: {
    FESTIVAL: string;
    PERFORMANCE: string;
    COMPETITION: string;
    WORKSHOP: string;
    SEMINAR: string;
    OTHER: string;
  };
  EVENT_STATUSES: {
    SCHEDULED: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    CANCELLED: string;
  };
  LIVESTREAM_CATEGORIES: {
    MUSIC: string;
    PERFORMANCE: string;
    TALK: string;
    WORKSHOP: string;
    OTHER: string;
  };
  LIVESTREAM_STATUSES: {
    SCHEDULED: string;
    LIVE: string;
    ENDED: string;
    CANCELLED: string;
  };
  FUNDING_PROJECT_STATUSES: {
    PREPARING: string;
    IN_PROGRESS: string;
    SUCCESS: string;
    FAILED: string;
    CANCELLED: string;
    EXECUTING: string;
    COMPLETED: string;
  };
  DISTRIBUTION_STATUSES: {
    WAITING: string;
    DISTRIBUTED: string;
    PAID: string;
  };
  EXPENSE_CATEGORIES: {
    LABOR: string;
    MATERIAL: string;
    EQUIPMENT: string;
    MARKETING: string;
    OTHER: string;
  };
  TRACK_GENRES: {
    INDIE_POP: string;
    ROCK: string;
    ACOUSTIC: string;
    JAZZ: string;
    CLASSICAL: string;
    ELECTRONIC: string;
    HIPHOP: string;
    RNB: string;
    OTHER: string;
  };
  MUSIC_KEYS: string[];
  MUSIC_MOODS: {
    EXCITING: string;
    EMOTIONAL: string;
    CALM: string;
    INTENSE: string;
    MELANCHOLY: string;
    HOPEFUL: string;
    ROMANTIC: string;
    MYSTERIOUS: string;
  };
  LICENSES: {
    ALL_RIGHTS_RESERVED: string;
    CREATIVE_COMMONS: string;
    PUBLIC_DOMAIN: string;
  };
  ARTWORK_TYPES: {
    AUDIO: string;
    IMAGE: string;
    VIDEO: string;
    TEXT: string;
  };
  ARTWORK_STATUSES: {
    DRAFT: string;
    PUBLISHED: string;
    ARCHIVED: string;
  };
  EVENT_TICKET_TYPES: {
    REGULAR: string;
    VIP: string;
    EARLY_BIRD: string;
    STUDENT: string;
  };
  MILESTONE_STATUSES: {
    SCHEDULED: string;
    IN_PROGRESS: string;
    COMPLETED: string;
    DELAYED: string;
  };
  PRIORITIES: {
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    URGENT: string;
  };
  FUNDING_PROJECT_TYPES: {
    REGULAR: string;
    EXECUTION_IN_PROGRESS: string;
    EXPENSE_PUBLIC: string;
    REVENUE_DISTRIBUTION: string;
  };
  // 상태 관련 추가 속성들
  STATUS_COMPLETED: string[];
  STATUS_IN_PROGRESS: string[];
  STATUS_WAITING: string[];
  STATUS_FAILED: string[];
  STATUS_PRIORITIES: Record<string, number>;
  STATUS_DESCRIPTIONS: Record<string, string>;
}

export interface CsvHeaders {
  REVENUE_DISTRIBUTION: string[];
  EXPENSE_RECORDS: string[];
  PROJECT_PROGRESS: string[];
}

export interface StatusColors {
  [key: string]: string;
}

export interface StatusIcons {
  [key: string]: string;
}

export interface ConstantsResponse {
  success: boolean;
  data: Enums | CsvHeaders | StatusColors | StatusIcons;
  message?: string;
}

// 특정 enum 값들을 쉽게 사용할 수 있는 유틸리티 타입
export type UserRole = Enums['USER_ROLES'][keyof Enums['USER_ROLES']];
export type ArtistCategory =
  Enums['ARTIST_CATEGORIES'][keyof Enums['ARTIST_CATEGORIES']];
export type ArtistGenre = Enums['ARTIST_GENRES'][keyof Enums['ARTIST_GENRES']];
export type ProjectCategory =
  Enums['PROJECT_CATEGORIES'][keyof Enums['PROJECT_CATEGORIES']];
export type ProjectCategoryKey = keyof Enums['PROJECT_CATEGORIES'];
export type ProjectStatus =
  Enums['PROJECT_STATUSES'][keyof Enums['PROJECT_STATUSES']];
export type TaskStatus = Enums['TASK_STATUSES'][keyof Enums['TASK_STATUSES']];
export type EventCategory =
  Enums['EVENT_CATEGORIES'][keyof Enums['EVENT_CATEGORIES']];
export type EventStatus =
  Enums['EVENT_STATUSES'][keyof Enums['EVENT_STATUSES']];
export type LiveStreamCategory =
  Enums['LIVESTREAM_CATEGORIES'][keyof Enums['LIVESTREAM_CATEGORIES']];
export type LiveStreamStatus =
  Enums['LIVESTREAM_STATUSES'][keyof Enums['LIVESTREAM_STATUSES']];
export type FundingProjectStatus =
  Enums['FUNDING_PROJECT_STATUSES'][keyof Enums['FUNDING_PROJECT_STATUSES']];
export type DistributionStatus =
  Enums['DISTRIBUTION_STATUSES'][keyof Enums['DISTRIBUTION_STATUSES']];
export type ExpenseCategory =
  Enums['EXPENSE_CATEGORIES'][keyof Enums['EXPENSE_CATEGORIES']];
export type TrackGenre = Enums['TRACK_GENRES'][keyof Enums['TRACK_GENRES']];
export type MusicKey = Enums['MUSIC_KEYS'][number];
export type MusicMood = Enums['MUSIC_MOODS'][keyof Enums['MUSIC_MOODS']];
export type License = Enums['LICENSES'][keyof Enums['LICENSES']];
export type ArtworkType = Enums['ARTWORK_TYPES'][keyof Enums['ARTWORK_TYPES']];
export type ArtworkStatus =
  Enums['ARTWORK_STATUSES'][keyof Enums['ARTWORK_STATUSES']];
export type EventTicketType =
  Enums['EVENT_TICKET_TYPES'][keyof Enums['EVENT_TICKET_TYPES']];
export type MilestoneStatus =
  Enums['MILESTONE_STATUSES'][keyof Enums['MILESTONE_STATUSES']];
export type Priority = Enums['PRIORITIES'][keyof Enums['PRIORITIES']];
export type FundingProjectType =
  Enums['FUNDING_PROJECT_TYPES'][keyof Enums['FUNDING_PROJECT_TYPES']];
