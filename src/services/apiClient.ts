import { resolveApiBaseUrl } from '@/lib/config/env';
import { ApiResponse, ApiRequestOptions } from '../types/api';

// API 클라이언트 설정
const API_CONFIG = {
    baseURL: resolveApiBaseUrl(),
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
};

// 토큰 관리
class TokenManager {
    private static instance: TokenManager;
    private token: string | null = null;

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('authToken');
        }
        return this.token;
    }

    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken(): void {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }
}

// API 클라이언트 클래스
class ApiClient {
    private tokenManager = TokenManager.getInstance();

    private async request<T = any>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            method = 'GET',
            body,
            headers = {},
            timeout = API_CONFIG.timeout,
            retries = API_CONFIG.retries,
        } = options;

        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const token = this.tokenManager.getToken();

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        const requestOptions: Record<string, unknown> = {
            method,
            headers: requestHeaders,
            signal: (window as any).AbortSignal?.timeout?.(timeout),
        };

        if (body && method !== 'GET') {
            requestOptions.body = JSON.stringify(body);
        }

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    // 401 Unauthorized 처리
                    if (response.status === 401) {
                        this.tokenManager.clearToken();
                        // 공개 엔드포인트가 아닌 경우에만 에러 발생
                        if (!this.isPublicEndpoint(endpoint)) {
                            throw new Error('인증이 필요합니다.');
                        }
                    }

                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                return data as ApiResponse<T>;

            } catch (error) {
                lastError = error as Error;

                // 마지막 시도가 아니고 재시도 가능한 에러인 경우
                if (attempt < retries && this.isRetryableError(error as Error)) {
                    await this.delay(API_CONFIG.retryDelay * Math.pow(2, attempt));
                    continue;
                }

                throw error;
            }
        }

        throw lastError || new Error('API 요청 실패');
    }

    private isPublicEndpoint(endpoint: string): boolean {
        const publicEndpoints = [
            '/artists',
            '/funding/projects',
            '/community/posts',
            '/stats/platform',
            '/categories',
            '/events',
        ];

        return publicEndpoints.some(publicEndpoint =>
            endpoint.startsWith(publicEndpoint)
        );
    }

    private isRetryableError(error: Error): boolean {
        // 네트워크 에러나 5xx 서버 에러는 재시도 가능
        return error.message.includes('fetch') ||
            error.message.includes('timeout') ||
            error.message.includes('5');
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // HTTP 메서드들
    async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
        return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'POST', body: data });
    }

    async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PUT', body: data });
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PATCH', body: data });
    }
}

// 싱글톤 인스턴스 내보내기
export const apiClient = new ApiClient();

// 편의 함수들
export const api = {
    get: <T = any>(endpoint: string, params?: Record<string, any>) =>
        apiClient.get<T>(endpoint, params),
    post: <T = any>(endpoint: string, data?: any) =>
        apiClient.post<T>(endpoint, data),
    put: <T = any>(endpoint: string, data?: any) =>
        apiClient.put<T>(endpoint, data),
    delete: <T = any>(endpoint: string) =>
        apiClient.delete<T>(endpoint),
    patch: <T = any>(endpoint: string, data?: any) =>
        apiClient.patch<T>(endpoint, data),
};

// API 상태 확인
export const isAPIAvailable = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get('/health');
        return response.success;
    } catch {
        return false;
    }
};
