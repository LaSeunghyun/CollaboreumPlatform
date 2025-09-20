export * from './api';

// 공통 타입 정의
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  username: string;
  displayName: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  ARTIST = 'artist',
  FAN = 'fan',
}

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
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  FUNDING_UPDATE = 'funding_update',
  PROJECT_UPDATE = 'project_update',
  COMMUNITY_UPDATE = 'community_update',
}
