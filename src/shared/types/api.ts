/**
 * API 관련 공통 타입 정의
 */

// 기본 API 응답 구조
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
    status: number;
}

// 에러 응답 구조
export interface ApiError {
    success: false;
    error: string;
    message: string;
    status: number;
    details?: Record<string, any>;
}

// 페이지네이션 응답 구조
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// 페이지네이션 요청 파라미터
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// 검색 요청 파라미터
export interface SearchParams extends PaginationParams {
    query?: string;
    filters?: Record<string, any>;
}

// 파일 업로드 응답
export interface UploadResponse {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadedAt: string;
}

// API 엔드포인트 타입
export type ApiEndpoint =
    | 'auth/login'
    | 'auth/register'
    | 'auth/refresh'
    | 'auth/logout'
    | 'users/profile'
    | 'users/update'
    | 'funding/projects'
    | 'funding/projects/:id'
    | 'funding/projects/:id/back'
    | 'funding/projects/:id/like'
    | 'funding/projects/:id/bookmark'
    | 'funding/stats'
    | 'community/posts'
    | 'community/posts/:id'
    | 'community/posts/:id/like'
    | 'community/posts/:id/comment'
    | 'artists'
    | 'artists/:id'
    | 'artists/:id/projects'
    | 'admin/users'
    | 'admin/projects'
    | 'admin/stats';

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API 요청 설정
export interface ApiRequestConfig {
    method: HttpMethod;
    endpoint: ApiEndpoint;
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
}

// API 클라이언트 인터페이스
export interface ApiClient {
    get<T>(endpoint: ApiEndpoint, params?: Record<string, any>): Promise<ApiResponse<T>>;
    post<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>>;
    put<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>>;
    patch<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>>;
    delete<T>(endpoint: ApiEndpoint): Promise<ApiResponse<T>>;
}

// API 상태 타입
export interface ApiState {
    loading: boolean;
    error: ApiError | null;
    data: any;
}

// API 훅 반환 타입
export interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    refetch: () => Promise<void>;
    mutate: (data: Partial<T>) => Promise<void>;
}

// API 미들웨어 타입
export type ApiMiddleware = (
    config: ApiRequestConfig,
    next: (config: ApiRequestConfig) => Promise<ApiResponse>
) => Promise<ApiResponse>;

// API 인터셉터 타입
export interface ApiInterceptor {
    request?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
    response?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
    error?: (error: ApiError) => ApiError | Promise<ApiError>;
}

// API 캐시 설정
export interface ApiCacheConfig {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
    key?: string;
}

// API 재시도 설정
export interface ApiRetryConfig {
    enabled: boolean;
    maxAttempts: number;
    delay: number; // Delay between retries in milliseconds
    backoffMultiplier: number;
}

// API 설정
export interface ApiConfig {
    baseURL: string;
    timeout: number;
    retry: ApiRetryConfig;
    cache: ApiCacheConfig;
    interceptors: ApiInterceptor[];
    middlewares: ApiMiddleware[];
}
