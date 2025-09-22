import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {
  clearTokens,
  cleanInvalidTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistTokens,
  resolveAuthTokenCandidates,
} from '@/features/auth/services/tokenStorage';
import { resolveApiBaseUrl } from '@/lib/config/env';
import {
  ApiResponse,
  ApiError,
  ApiRequestConfig,
  ApiEndpoint,
  HttpMethod,
} from '@/shared/types';

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryParamValue = QueryPrimitive | QueryPrimitive[];
type QueryParams = Record<string, QueryParamValue>;

export type QueryParamsInput = QueryParams | URLSearchParams;
export type RequestBody =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null
  | FormData
  | Blob
  | ArrayBuffer;

// API 요청에 사용할 수 있는 타입들
export type RequestBodyInput = RequestBody | { [key: string]: any };

export type ClientRequestConfig<
  TBody = RequestBody,
  TParams = QueryParamsInput,
> = Omit<ApiRequestConfig, 'data' | 'body' | 'params'> & {
  data?: TBody;
  body?: TBody;
  params?: TParams;
};

export type BatchRequest<TBody = unknown> = {
  method: HttpMethod | Lowercase<HttpMethod>;
  endpoint: ApiEndpoint;
  data?: TBody;
};

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: resolveApiBaseUrl(),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    cleanInvalidTokens();
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      config => {
        const token = getStoredAccessToken();
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(this.handleError(error)),
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        // 401 에러 시 토큰 갱신 시도
        if (error.response?.status === 401) {
          const refreshToken = getStoredRefreshToken();
          if (refreshToken) {
            try {
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
                if (data.success) {
                  const tokenCandidates = resolveAuthTokenCandidates(
                    data.data ?? data,
                  );
                  const storedTokens = persistTokens({
                    accessToken: tokenCandidates.accessToken,
                    fallbackToken: tokenCandidates.fallbackToken,
                    refreshToken: tokenCandidates.refreshToken ?? refreshToken,
                  });

                  if (storedTokens.accessToken) {
                    const originalRequest = error.config;
                    if (originalRequest) {
                      originalRequest.headers = originalRequest.headers ?? {};
                      originalRequest.headers.Authorization = `Bearer ${storedTokens.accessToken}`;
                      return this.client.request(originalRequest);
                    }
                  }

                  console.error(
                    '❌ Token refresh failed: response did not contain a usable token.',
                  );
                  clearTokens();
                }
              }
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
            }
          }
        }

        return Promise.reject(this.handleError(error));
      },
    );
  }

  private clearStoredAuth(
    reason: 'unauthorized' | 'forbidden' | 'unknown' = 'unknown',
  ) {
    clearTokens();
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

  private normalizeEndpoint(endpoint: ApiEndpoint): ApiEndpoint {
    if (typeof endpoint !== 'string') {
      return endpoint;
    }

    const trimmed = endpoint.trim();

    if (trimmed === '' || trimmed === '/') {
      return '';
    }

    if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
      return trimmed;
    }

    const withoutLeadingSlashes = trimmed.replace(/^\/+/, '');

    const baseUrl = this.client.defaults.baseURL ?? '';
    const normalizedBase = baseUrl.replace(/\/+$/, '');

    if (
      normalizedBase.toLowerCase().endsWith('/api') &&
      withoutLeadingSlashes.toLowerCase().startsWith('api/')
    ) {
      return withoutLeadingSlashes.slice(4);
    }

    return withoutLeadingSlashes;
  }

  async request<
    T = unknown,
    TBody = RequestBody,
    TParams = QueryParamsInput | undefined,
  >(
    endpoint: ApiEndpoint,
    config: ClientRequestConfig<TBody, TParams> = {},
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', params, headers, data, body, timeout } = config;

    const url = this.normalizeEndpoint(endpoint);

    const requestConfig: AxiosRequestConfig = {
      url,
      method,
      params,
      headers,
      data: data ?? body,
      timeout,
    };

    const response = await this.client.request<ApiResponse<T>>(requestConfig);
    return response.data;
  }

  async get<T, TParams = QueryParamsInput | undefined>(
    endpoint: ApiEndpoint,
    params?: TParams,
  ): Promise<ApiResponse<T>> {
    return this.request<T, never, TParams>(endpoint, { method: 'GET', params });
  }

  async post<T, TBody = RequestBody>(
    endpoint: ApiEndpoint,
    data?: TBody,
  ): Promise<ApiResponse<T>> {
    return this.request<T, TBody>(endpoint, { method: 'POST', data });
  }

  async put<T, TBody = RequestBody>(
    endpoint: ApiEndpoint,
    data?: TBody,
  ): Promise<ApiResponse<T>> {
    return this.request<T, TBody>(endpoint, { method: 'PUT', data });
  }

  async patch<T, TBody = RequestBody>(
    endpoint: ApiEndpoint,
    data?: TBody,
  ): Promise<ApiResponse<T>> {
    return this.request<T, TBody>(endpoint, { method: 'PATCH', data });
  }

  async delete<T>(endpoint: ApiEndpoint): Promise<ApiResponse<T>> {
    return this.request<T, never>(endpoint, { method: 'DELETE' });
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
  async batch<T, TBody = RequestBody>(
    requests: Array<BatchRequest<TBody>>,
  ): Promise<Array<ApiResponse<T>>> {
    const promises = requests.map(({ method, endpoint, data }) => {
      switch (method.toUpperCase() as HttpMethod) {
        case 'GET':
          return this.get<T>(endpoint);
        case 'POST':
          return this.post<T, TBody>(endpoint, data);
        case 'PUT':
          return this.put<T, TBody>(endpoint, data);
        case 'PATCH':
          return this.patch<T, TBody>(endpoint, data);
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
