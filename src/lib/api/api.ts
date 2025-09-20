import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { resolveApiBaseUrl } from '@/lib/config/env';
import { ApiResponse, ApiError, ApiRequestConfig, ApiEndpoint } from '@/shared/types';

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
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(this.handleError(error))
    );
  }

  private clearStoredAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  private handleError(error: AxiosError | Error): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) {
        this.clearStoredAuth();
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

  async request<T = unknown>(endpoint: ApiEndpoint, config: ApiRequestConfig<unknown> = {}): Promise<ApiResponse<T>> {
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

  async get<T>(endpoint: ApiEndpoint, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: ApiEndpoint, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  async put<T>(endpoint: ApiEndpoint, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  async patch<T>(endpoint: ApiEndpoint, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  async delete<T>(endpoint: ApiEndpoint): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 파일 업로드
  async uploadFile<T>(endpoint: ApiEndpoint, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(endpoint, formData, config);
    return response.data;
  }

  // 배치 요청
  async batch<T>(requests: Array<{ method: string; endpoint: ApiEndpoint; data?: unknown }>): Promise<Array<ApiResponse<T>>> {
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
