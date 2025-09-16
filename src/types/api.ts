// API 응답 표준 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 페이징 파라미터
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// 검색 파라미터
export interface SearchParams extends PaginationParams {
  search?: string;
  category?: string;
  status?: string;
}

// 에러 응답
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}

// 성공 응답
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API 엔드포인트 타입
export type ApiEndpoint = 
  | '/auth/signup'
  | '/auth/login'
  | '/auth/logout'
  | '/auth/verify'
  | '/artists'
  | '/artists/:id'
  | '/funding/projects'
  | '/funding/projects/:id'
  | '/community/posts'
  | '/community/posts/:id'
  | '/events'
  | '/events/:id'
  | '/stats/platform'
  | '/categories'
  | '/notifications';

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 요청 옵션
export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}
