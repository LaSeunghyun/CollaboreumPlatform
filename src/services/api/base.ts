import { api } from '@/lib/api/api';
import type { ApiError, ApiRequestConfig, ApiResponse } from '@/shared/types';

type QueueTask<T> = () => Promise<T>;

export type ApiCallOptions = RequestInit & {
  params?: Record<string, unknown>;
  timeout?: number;
};

const PUBLIC_ENDPOINTS = [
  '/artists',
  '/funding/projects',
  '/community/posts',
  '/stats/platform',
  '/categories',
  '/events',
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class RequestQueue {
  private queue: Array<QueueTask<unknown>> = [];
  private running = 0;
  private readonly maxConcurrent = 5;

  add<T>(request: QueueTask<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processNext();
        }
      });
      this.processNext();
    });
  }

  private processNext() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      this.running++;
      const request = this.queue.shift()!;
      void request();
    }
  }
}

const requestQueue = new RequestQueue();

export const normalizeHeaders = (
  headers?: HeadersInit,
): Record<string, string> | undefined => {
  if (!headers) {
    return undefined;
  }

  if (headers instanceof Headers) {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  return headers;
};

const isApiError = (error: unknown): error is ApiError => {
  return Boolean(error) && typeof error === 'object' && 'message' in (error as Record<string, unknown>);
};

const isRetryableError = (error: unknown): boolean => {
  if (isApiError(error)) {
    return Boolean(error.status && error.status >= 500);
  }

  if (error instanceof Error) {
    return (
      error.message.includes('Network') ||
      error.message.includes('timeout') ||
      error.message.includes('Failed to fetch')
    );
  }

  return false;
};

const isPublicEndpoint = (endpoint: string): boolean => {
  return PUBLIC_ENDPOINTS.some(publicEndpoint => endpoint.startsWith(publicEndpoint));
};

export const extractApiData = <T>(
  response: ApiResponse<T> | T | undefined,
): T | null => {
  if (!response) {
    return null;
  }

  if (typeof response === 'object' && response !== null && 'success' in response) {
    const typed = response as ApiResponse<T> & Record<string, unknown>;
    const hasData = Object.prototype.hasOwnProperty.call(typed, 'data');
    const dataValue = typed.data;

    const metaEntries = Object.entries(typed).filter(([key, value]) => {
      if (key === 'success' || key === 'data') {
        return false;
      }
      return value !== undefined;
    });

    if (!hasData && metaEntries.length === 0) {
      return null;
    }

    if (!hasData) {
      return Object.fromEntries(metaEntries) as unknown as T;
    }

    if (metaEntries.length === 0) {
      return (dataValue ?? null) as T;
    }

    return Object.assign(Object.fromEntries(metaEntries), {
      data: dataValue ?? null,
    }) as unknown as T;
  }

  return response as T;
};

export async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {},
  retryCount = 0,
): Promise<T> {
  const maxRetries = 3;
  const retryDelay = 1000;
  const timeout = options.timeout ?? 10000;

  return requestQueue.add(async (): Promise<T> => {
    try {
      const defaultHeaders: Record<string, string> = {};
      if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
      }

      const config: ApiRequestConfig = {
        method: (options.method ?? 'GET').toUpperCase() as ApiRequestConfig['method'],
        headers: {
          ...defaultHeaders,
          ...normalizeHeaders(options.headers),
        },
        data: options.body,
        params: options.params,
        timeout,
      };

      const response = await api.request<T>(endpoint, config);
      return extractApiData(response) as T;
    } catch (error) {
      console.error('API call failed:', error);

      if (isApiError(error)) {
        if (error.status === 401 && isPublicEndpoint(endpoint)) {
          console.warn(`공개 데이터 조회 실패 (401): ${endpoint}`);
          return {
            success: false,
            data: [],
            message: '인증이 필요합니다',
          } as T;
        }

        if (retryCount < maxRetries && isRetryableError(error)) {
          await delay(retryDelay * (retryCount + 1));
          return apiCall<T>(endpoint, options, retryCount + 1);
        }

        const enrichedError = Object.assign(
          new Error(error.message || 'API 요청에 실패했습니다.'),
          {
            status: error.status,
            details: error.details,
            cause: error,
          },
        );

        throw enrichedError;
      }

      if (retryCount < maxRetries && isRetryableError(error)) {
        console.log(`API 호출 재시도 중... (${retryCount + 1}/${maxRetries})`);
        await delay(retryDelay * (retryCount + 1));
        return apiCall<T>(endpoint, options, retryCount + 1);
      }

      throw error instanceof Error
        ? error
        : new Error('요청 처리 중 알 수 없는 오류가 발생했습니다.');
    }
  });
}
