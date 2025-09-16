// 동적 상수 관리 - API에서 가져오는 데이터
export const DYNAMIC_CONSTANTS = {
  // 기본값들 (API 실패 시 사용)
  DEFAULT_CATEGORIES: [
    { value: 'music', label: '음악' },
    { value: 'video', label: '비디오' },
    { value: 'performance', label: '공연' },
    { value: 'book', label: '도서' },
    { value: 'game', label: '게임' },
    { value: 'other', label: '기타' },
  ],
  
  DEFAULT_SORT_OPTIONS: [
    { value: 'popular', label: '인기순' },
    { value: 'latest', label: '최신순' },
    { value: 'deadline', label: '마감임박' },
    { value: 'progress', label: '달성률' },
  ],
  
  DEFAULT_PAYMENT_METHODS: [
    { value: 'card', label: '신용카드' },
    { value: 'bank', label: '계좌이체' },
    { value: 'kakao', label: '카카오페이' },
    { value: 'naver', label: '네이버페이' },
  ],
  
  DEFAULT_EXPENSE_CATEGORIES: [
    { value: 'labor', label: '인건비' },
    { value: 'material', label: '재료비' },
    { value: 'equipment', label: '장비비' },
    { value: 'marketing', label: '마케팅비' },
    { value: 'other', label: '기타' },
  ],
  
  // 이미지 관련
  DEFAULT_IMAGES: {
    PLACEHOLDER: '/images/placeholder.png',
    AVATAR: '/images/default-avatar.png',
    PROJECT_THUMBNAIL: '/images/project-placeholder.png',
  },
  
  // 상태별 색상
  STATUS_COLORS: {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100',
    pending: 'text-gray-600 bg-gray-100',
  },
  
  // 상태별 아이콘
  STATUS_ICONS: {
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle',
    info: 'info',
    pending: 'clock',
  },
  
  // 페이지네이션
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // API 설정
  API: {
    TIMEOUT: 10000,
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
  },
  
  // 캐시 설정
  CACHE: {
    STALE_TIME: 5 * 60 * 1000, // 5분
    GC_TIME: 10 * 60 * 1000, // 10분
  },
} as const;

// 타입 정의
export type Category = {
  value: string;
  label: string;
};

export type SortOption = {
  value: string;
  label: string;
};

export type PaymentMethod = {
  value: string;
  label: string;
};

export type ExpenseCategory = {
  value: string;
  label: string;
};

// 상수 타입
export type DynamicConstants = typeof DYNAMIC_CONSTANTS;
