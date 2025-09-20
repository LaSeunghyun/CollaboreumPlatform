import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { resolveApiBaseUrl } from '@/lib/config/env';
import {
  ApiResponse,
  ApiError,
  ApiRequestConfig,
  ApiEndpoint,
} from '@/shared/types';
import {
  sanitizeToken,
  storeTokens,
} from '@/features/auth/services/authService';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: resolveApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      config => {
        const authToken = sanitizeToken(localStorage.getItem('authToken'));
        const accessToken = sanitizeToken(localStorage.getItem('accessToken'));

        const token = authToken ?? accessToken;

        // 디버깅을 위한 로그
        console.log('🔍 API Request Debug:', {
          url: config.url,
          authToken: authToken ? `${authToken.substring(0, 20)}...` : 'null',
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
          selectedToken: token ? `${token.substring(0, 20)}...` : 'null',
          headers: config.headers,
        });

        // localStorage 전체 상태 확인
        console.log('🔍 localStorage 전체 상태:', {
          allKeys: Object.keys(localStorage),
          authToken: localStorage.getItem('authToken'),
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken')
        });

        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('⚠️ No auth token found in localStorage');
        }
        return config;
      },
      error => Promise.reject(this.handleError(error)),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async error => {
        // 401 에러 시 토큰 갱신 시도
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              console.log('🔄 Attempting token refresh...');
              const response = await fetch(
                `${this.client.defaults.baseURL}/auth/refresh`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refreshToken }),
                },
              );

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                  const storedTokens = storeTokens(
                    data.data.accessToken,
                    data.data.refreshToken,
                    data.data.token,
                  );

                  if (!storedTokens.accessToken) {
                    console.error('❌ Token refresh response did not contain a valid access token');
                    this.clearStoredAuth('unauthorized');
                    return Promise.reject(
                      new Error('토큰 갱신 실패: 유효한 액세스 토큰을 받지 못했습니다'),
                    );
                  }

                  console.log('✅ Token refreshed successfully');

                  // 원래 요청 재시도
                  const originalRequest = error.config;
                  if (!originalRequest) {
                    return Promise.reject(
                      new Error('토큰 갱신 후 원본 요청 정보를 찾을 수 없습니다'),
                    );
                  }

                  originalRequest.headers = {
                    ...(originalRequest.headers ?? {}),
                    Authorization: `Bearer ${storedTokens.accessToken}`,
                  };

                  return this.client.request(originalRequest);
                }
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
            }
          }
          this.clearStoredAuth('unauthorized');
          return Promise.reject(
            new Error('토큰 갱신 실패: 유효한 토큰을 확보하지 못했습니다'),
          );
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private clearStoredAuth(
    reason: 'unauthorized' | 'forbidden' | 'unknown' = 'unknown',
  ) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('auth:logout', {
          detail: {
            reason,
            source: 'api-client',
          },
        }),
      );
    }
  }

  private handleError(error: AxiosError | Error): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        this.clearStoredAuth('unauthorized');
      }

      return {
        success: false,
        error: (error.response?.data as ApiError)?.error || error.message,
        message:
          (error.response?.data as ApiError)?.message ||
          error.message ||
          '알 수 없는 오류가 발생했습니다.',
        status,
        details: (error.response?.data as ApiError)?.details,
      };
    }

    return {
      success: false,
      error: '요청 오류',
      message: error.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  async request<T = unknown>(
    endpoint: ApiEndpoint,
    config: ApiRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', params, headers, data, body, timeout } = config;

    const requestConfig: AxiosRequestConfig = {
      url: endpoint,
      method,
      params,
      headers,
      data: data ?? body,
      timeout,
    };

    const response = await this.client.request<ApiResponse<T>>(requestConfig);
    return response.data;
  }

  async get<T>(
    endpoint: ApiEndpoint,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async put<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  async patch<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  async delete<T>(endpoint: ApiEndpoint): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 파일 업로드
  async uploadFile<T>(
    endpoint: ApiEndpoint,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(
      endpoint,
      formData,
      config,
    );
    return response.data;
  }

  // 배치 요청
  async batch<T>(
    requests: Array<{ method: string; endpoint: ApiEndpoint; data?: any }>,
  ): Promise<Array<ApiResponse<T>>> {
    const promises = requests.map(({ method, endpoint, data }) => {
      switch (method.toUpperCase()) {
        case 'GET':
          return this.get<T>(endpoint);
        case 'POST':
          return this.post<T>(endpoint, data);
        case 'PUT':
          return this.put<T>(endpoint, data);
        case 'PATCH':
          return this.patch<T>(endpoint, data);
        case 'DELETE':
          return this.delete<T>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    });

    return Promise.all(promises);
  }

  // 요청 취소를 위한 AbortController
  createAbortController(): AbortController {
    return new AbortController();
  }

  // 요청 취소
  cancelRequest(controller: AbortController): void {
    controller.abort();
  }
}

export const api = new ApiClient();
