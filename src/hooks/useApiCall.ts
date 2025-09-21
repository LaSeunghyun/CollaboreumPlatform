import { useState, useCallback, useRef, useEffect } from 'react';

export interface ApiCallState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface ApiCallOptions {
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export interface ApiCallActions<T = any> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {},
): ApiCallState<T> & ApiCallActions<T> {
  const {
    immediate = false,
    retryCount = 0,
    retryDelay = 1000,
    timeout = 30000,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 즉시 실행 옵션이 활성화된 경우
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  // API 호출 실행
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!isMountedRef.current) return null;

      setLoading(true);
      setError(null);
      setIsError(false);
      setIsSuccess(false);

      // 타임아웃 설정
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setError('요청 시간이 초과되었습니다.');
            setIsError(true);
            setLoading(false);
            onError?.('요청 시간이 초과되었습니다.');
            onFinally?.();
          }
        }, timeout);
      }

      try {
        const result = await apiFunction(...args);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (isMountedRef.current) {
          setData(result);
          setIsSuccess(true);
          setLoading(false);
          onSuccess?.(result);
          onFinally?.();
          retryCountRef.current = 0; // 성공 시 재시도 카운트 리셋
        }

        return result;
      } catch (err) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (!isMountedRef.current) return null;

        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);
        setIsError(true);
        setLoading(false);
        onError?.(errorMessage);
        onFinally?.();

        // 재시도 로직
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setTimeout(() => {
            if (isMountedRef.current) {
              execute(...args);
            }
          }, retryDelay * retryCountRef.current);
        }

        return null;
      }
    },
    [
      apiFunction,
      timeout,
      retryCount,
      retryDelay,
      onSuccess,
      onError,
      onFinally,
    ],
  );

  // 재시도
  const retry = useCallback(async (): Promise<T | null> => {
    retryCountRef.current = 0;
    return execute();
  }, [execute]);

  // 상태 리셋
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setIsSuccess(false);
    setIsError(false);
    retryCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    data,
    loading,
    error,
    isSuccess,
    isError,
    execute,
    reset,
    retry,
  };
}

// 특정 API 호출을 위한 간편 훅들
export function useApiQuery<T = any>(
  queryFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {},
) {
  return useApiCall(queryFunction, { ...options, immediate: true });
}

export function useApiMutation<T = any>(
  mutationFunction: (...args: any[]) => Promise<T>,
  options: ApiCallOptions = {},
) {
  return useApiCall(mutationFunction, { ...options, immediate: false });
}

// 여러 API 호출을 동시에 관리하는 훅
export function useApiBatch<T = any>(
  apiFunctions: Array<(...args: any[]) => Promise<T>>,
  options: ApiCallOptions = {},
) {
  const [results, setResults] = useState<Array<T | null>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAll = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);

      try {
        const promises = apiFunctions.map(fn => fn(...args));
        const results = await Promise.allSettled(promises);

        const successResults = results.map(result =>
          result.status === 'fulfilled' ? result.value : null,
        );

        setResults(successResults);

        const hasError = results.some(result => result.status === 'rejected');
        if (hasError) {
          setError('일부 요청이 실패했습니다.');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.',
        );
      } finally {
        setLoading(false);
      }
    },
    [apiFunctions],
  );

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    loading,
    error,
    executeAll,
    reset,
  };
}
