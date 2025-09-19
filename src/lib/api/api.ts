import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError, ApiRequestConfig, ApiEndpoint } from '@/shared/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // 서버 응답이 있는 경우
      return {
        success: false,
        error: error.response.data?.error || '서버 오류가 발생했습니다.',
        message: error.response.data?.message || '알 수 없는 오류가 발생했습니다.',
        status: error.response.status,
        details: error.response.data?.details,
      };
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      return {
        success: false,
        error: '네트워크 오류',
        message: '서버에 연결할 수 없습니다.',
        status: 0,
      };
    } else {
      // 요청 설정 중 오류가 발생한 경우
      return {
        success: false,
        error: '요청 오류',
        message: error.message || '알 수 없는 오류가 발생했습니다.',
        status: 0,
      };
    }
  }

  async get<T>(endpoint: ApiEndpoint, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await this.client.get(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: ApiEndpoint, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: ApiEndpoint): Promise<ApiResponse<T>> {
    const response = await this.client.delete(endpoint);
    return response.data;
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

    const response = await this.client.post(endpoint, formData, config);
    return response.data;
  }

  // 배치 요청
  async batch<T>(requests: Array<{ method: string; endpoint: ApiEndpoint; data?: any }>): Promise<ApiResponse<T>[]> {
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
