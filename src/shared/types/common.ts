/**
 * 공통 타입 정의
 */

// 기본 엔티티 인터페이스
export interface BaseEntity {
  id: string | number;
  createdAt: string;
  updatedAt: string;
}

// 사용자 역할 타입
export type UserRole = 'admin' | 'artist' | 'fan';

// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

// 프로젝트 상태 타입
export type ProjectStatus = 'draft' | 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';

// 결제 상태 타입
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

// 결제 방법 타입
export type PaymentMethod = 'card' | 'phone' | 'bank' | 'paypal' | 'kakao' | 'naver';

// 알림 타입
export type NotificationType = 
  | 'project_approved'
  | 'project_rejected'
  | 'project_completed'
  | 'project_failed'
  | 'payment_received'
  | 'payment_failed'
  | 'comment_received'
  | 'like_received'
  | 'follow_received'
  | 'system_announcement';

// 파일 타입
export type FileType = 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';

// 정렬 방향 타입
export type SortOrder = 'asc' | 'desc';

// 정렬 기준 타입
export type SortBy = 'createdAt' | 'updatedAt' | 'title' | 'amount' | 'popularity' | 'deadline';

// 필터 연산자 타입
export type FilterOperator = 
  | 'eq'        // equals
  | 'ne'        // not equals
  | 'gt'        // greater than
  | 'gte'       // greater than or equal
  | 'lt'        // less than
  | 'lte'       // less than or equal
  | 'in'        // in array
  | 'nin'       // not in array
  | 'contains'  // contains string
  | 'startsWith' // starts with
  | 'endsWith'  // ends with
  | 'regex';    // regular expression

// 필터 조건 타입
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

// 정렬 조건 타입
export interface SortCondition {
  field: string;
  order: SortOrder;
}

// 페이지네이션 정보 타입
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 검색 결과 타입
export interface SearchResult<T> {
  items: T[];
  pagination: PaginationInfo;
  filters: Record<string, any>;
  sort: SortCondition[];
  query?: string;
}

// 폼 상태 타입
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 모달 상태 타입
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

// 토스트 메시지 타입
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 테마 타입
export type Theme = 'light' | 'dark' | 'system';

// 언어 타입
export type Language = 'ko' | 'en' | 'ja' | 'zh';

// 지역화 설정 타입
export interface LocaleConfig {
  language: Language;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
}

// 설정 타입
export interface AppSettings {
  theme: Theme;
  locale: LocaleConfig;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
  };
}

// 에러 타입
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp: string;
}

// 로딩 상태 타입
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

// 성공 상태 타입
export interface SuccessState {
  isSuccess: boolean;
  message?: string;
  data?: any;
}

// 액션 타입 (Redux 스타일)
export interface Action<T = any> {
  type: string;
  payload?: T;
  meta?: Record<string, any>;
}

// 리듀서 타입
export type Reducer<S, A extends Action> = (state: S, action: A) => S;

// 셀렉터 타입
export type Selector<T, R> = (state: T) => R;

// 디스패처 타입
export type Dispatcher<A extends Action> = (action: A) => void;

// 미들웨어 타입
export type Middleware<S, A extends Action> = (
  store: { getState: () => S; dispatch: Dispatcher<A> }
) => (next: Dispatcher<A>) => (action: A) => void;

// 이벤트 핸들러 타입
export type EventHandler<T = Event> = (event: T) => void;

// 마우스 이벤트 핸들러 타입
export type MouseEventHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;

// 키보드 이벤트 핸들러 타입
export type KeyboardEventHandler<T = HTMLInputElement> = (event: React.KeyboardEvent<T>) => void;

// 폼 이벤트 핸들러 타입
export type FormEventHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void;

// 변경 이벤트 핸들러 타입
export type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;

// 포커스 이벤트 핸들러 타입
export type FocusEventHandler<T = HTMLInputElement> = (event: React.FocusEvent<T>) => void;

// 블러 이벤트 핸들러 타입
export type BlurEventHandler<T = HTMLInputElement> = (event: React.FocusEvent<T>) => void;

// 스크롤 이벤트 핸들러 타입
export type ScrollEventHandler<T = HTMLDivElement> = (event: React.UIEvent<T>) => void;

// 리사이즈 이벤트 핸들러 타입
export type ResizeEventHandler<T = HTMLDivElement> = (event: React.UIEvent<T>) => void;

// 드래그 이벤트 핸들러 타입
export type DragEventHandler<T = HTMLDivElement> = (event: React.DragEvent<T>) => void;

// 터치 이벤트 핸들러 타입
export type TouchEventHandler<T = HTMLDivElement> = (event: React.TouchEvent<T>) => void;

// 휠 이벤트 핸들러 타입
export type WheelEventHandler<T = HTMLDivElement> = (event: React.WheelEvent<T>) => void;

// 애니메이션 이벤트 핸들러 타입
export type AnimationEventHandler<T = HTMLDivElement> = (event: React.AnimationEvent<T>) => void;

// 전환 이벤트 핸들러 타입
export type TransitionEventHandler<T = HTMLDivElement> = (event: React.TransitionEvent<T>) => void;
