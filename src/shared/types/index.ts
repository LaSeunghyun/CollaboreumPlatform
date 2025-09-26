import type { Prisma } from '@prisma/client';

export * from './api';

export type { Prisma } from '@prisma/client';

export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

type WithBaseEntity<T extends { createdAt: Date; updatedAt: Date }> = Omit<
  T,
  'createdAt' | 'updatedAt'
> &
  BaseEntity;

export type User = WithBaseEntity<Prisma.User>;

export const USER_ROLE_VALUES = [
  'admin',
  'artist',
  'fan',
] as const satisfies readonly Prisma.UserRole[];
export type UserRole = (typeof USER_ROLE_VALUES)[number];
export const UserRole = {
  ADMIN: USER_ROLE_VALUES[0],
  ARTIST: USER_ROLE_VALUES[1],
  FAN: USER_ROLE_VALUES[2],
} as const satisfies Record<'ADMIN' | 'ARTIST' | 'FAN', UserRole>;

export const NOTIFICATION_TYPE_VALUES = [
  'info',
  'success',
  'warning',
  'error',
  'funding_update',
  'project_update',
  'community_update',
] as const satisfies readonly Prisma.NotificationType[];
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];
export const NotificationType = {
  INFO: NOTIFICATION_TYPE_VALUES[0],
  SUCCESS: NOTIFICATION_TYPE_VALUES[1],
  WARNING: NOTIFICATION_TYPE_VALUES[2],
  ERROR: NOTIFICATION_TYPE_VALUES[3],
  FUNDING_UPDATE: NOTIFICATION_TYPE_VALUES[4],
  PROJECT_UPDATE: NOTIFICATION_TYPE_VALUES[5],
  COMMUNITY_UPDATE: NOTIFICATION_TYPE_VALUES[6],
} as const satisfies Record<
  'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'FUNDING_UPDATE' | 'PROJECT_UPDATE' | 'COMMUNITY_UPDATE',
  NotificationType
>;

export type Notification = WithBaseEntity<Prisma.Notification>;

export const FUNDING_PROJECT_STATUS_VALUES = [
  'draft',
  'collecting',
  'succeeded',
  'failed',
  'executing',
  'distributing',
  'closed',
] as const satisfies readonly Prisma.FundingProjectStatus[];
export type FundingProjectStatus = (typeof FUNDING_PROJECT_STATUS_VALUES)[number];
export const FundingProjectStatus = {
  DRAFT: FUNDING_PROJECT_STATUS_VALUES[0],
  COLLECTING: FUNDING_PROJECT_STATUS_VALUES[1],
  SUCCEEDED: FUNDING_PROJECT_STATUS_VALUES[2],
  FAILED: FUNDING_PROJECT_STATUS_VALUES[3],
  EXECUTING: FUNDING_PROJECT_STATUS_VALUES[4],
  DISTRIBUTING: FUNDING_PROJECT_STATUS_VALUES[5],
  CLOSED: FUNDING_PROJECT_STATUS_VALUES[6],
} as const satisfies Record<
  'DRAFT' | 'COLLECTING' | 'SUCCEEDED' | 'FAILED' | 'EXECUTING' | 'DISTRIBUTING' | 'CLOSED',
  FundingProjectStatus
>;

export const PLEDGE_STATUS_VALUES = [
  'pending',
  'authorized',
  'captured',
  'refunded',
  'failed',
  'cancelled',
] as const satisfies readonly Prisma.PledgeStatus[];
export type PledgeStatus = (typeof PLEDGE_STATUS_VALUES)[number];
export const PledgeStatus = {
  PENDING: PLEDGE_STATUS_VALUES[0],
  AUTHORIZED: PLEDGE_STATUS_VALUES[1],
  CAPTURED: PLEDGE_STATUS_VALUES[2],
  REFUNDED: PLEDGE_STATUS_VALUES[3],
  FAILED: PLEDGE_STATUS_VALUES[4],
  CANCELLED: PLEDGE_STATUS_VALUES[5],
} as const satisfies Record<
  'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED' | 'CANCELLED',
  PledgeStatus
>;

export const EXECUTION_STATUS_VALUES = [
  'pending',
  'approved',
  'rejected',
  'completed',
] as const satisfies readonly Prisma.ExecutionStatus[];
export type ExecutionStatus = (typeof EXECUTION_STATUS_VALUES)[number];
export const ExecutionStatus = {
  PENDING: EXECUTION_STATUS_VALUES[0],
  APPROVED: EXECUTION_STATUS_VALUES[1],
  REJECTED: EXECUTION_STATUS_VALUES[2],
  COMPLETED: EXECUTION_STATUS_VALUES[3],
} as const satisfies Record<
  'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED',
  ExecutionStatus
>;

export const DISTRIBUTION_STATUS_VALUES = [
  'pending',
  'calculated',
  'executed',
  'failed',
] as const satisfies readonly Prisma.DistributionStatus[];
export type DistributionStatus = (typeof DISTRIBUTION_STATUS_VALUES)[number];
export const DistributionStatus = {
  PENDING: DISTRIBUTION_STATUS_VALUES[0],
  CALCULATED: DISTRIBUTION_STATUS_VALUES[1],
  EXECUTED: DISTRIBUTION_STATUS_VALUES[2],
  FAILED: DISTRIBUTION_STATUS_VALUES[3],
} as const satisfies Record<
  'PENDING' | 'CALCULATED' | 'EXECUTED' | 'FAILED',
  DistributionStatus
>;

export const DISTRIBUTION_RULE_TYPE_VALUES = [
  'owner',
  'platform',
  'artist',
  'contributor',
  'custom',
] as const satisfies readonly Prisma.DistributionRuleType[];
export type DistributionRuleType = (typeof DISTRIBUTION_RULE_TYPE_VALUES)[number];
export const DistributionRuleType = {
  OWNER: DISTRIBUTION_RULE_TYPE_VALUES[0],
  PLATFORM: DISTRIBUTION_RULE_TYPE_VALUES[1],
  ARTIST: DISTRIBUTION_RULE_TYPE_VALUES[2],
  CONTRIBUTOR: DISTRIBUTION_RULE_TYPE_VALUES[3],
  CUSTOM: DISTRIBUTION_RULE_TYPE_VALUES[4],
} as const satisfies Record<
  'OWNER' | 'PLATFORM' | 'ARTIST' | 'CONTRIBUTOR' | 'CUSTOM',
  DistributionRuleType
>;

export const DISTRIBUTION_ITEM_STATUS_VALUES = [
  'pending',
  'processing',
  'completed',
  'failed',
] as const satisfies readonly Prisma.DistributionItemStatus[];
export type DistributionItemStatus = (typeof DISTRIBUTION_ITEM_STATUS_VALUES)[number];
export const DistributionItemStatus = {
  PENDING: DISTRIBUTION_ITEM_STATUS_VALUES[0],
  PROCESSING: DISTRIBUTION_ITEM_STATUS_VALUES[1],
  COMPLETED: DISTRIBUTION_ITEM_STATUS_VALUES[2],
  FAILED: DISTRIBUTION_ITEM_STATUS_VALUES[3],
} as const satisfies Record<
  'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
  DistributionItemStatus
>;

export type NotificationEntity = Notification;

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 에러 타입
export interface AppError {
  success: false;
  status: number;
  code?: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp?: string;
}

// 폼 상태 타입
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 통화 포맷팅
export interface CurrencyFormat {
  amount: number; // 원 단위 (정수)
  formatted: string; // 포맷된 문자열
  currency: 'KRW';
}

// 파일 업로드
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

// 알림 타입
export interface NotificationPayload extends NotificationEntity {
  data?: Record<string, unknown>;
}
