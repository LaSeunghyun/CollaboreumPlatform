import { useState, useCallback, useRef, useEffect } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

interface UseRetryReturn<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  retryCount: number;
  isMaxRetriesReached: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

export function useRetry<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {},
): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const lastArgsRef = useRef<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isMaxRetriesReached = retryCount >= maxRetries;

  const executeWithRetry = useCallback(
    async (attempt: number, ...args: any[]): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await asyncFunction(...args);
        setData(result);
        setRetryCount(0); // 성공 시 재시도 카운트 리셋
        return result;
      } catch (err: any) {
        const errorMessage = err.message || '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);

        if (attempt < maxRetries) {
          // 재시도
          setRetryCount(attempt);
          onRetry?.(attempt);

          // 지연 후 재시도
          return new Promise(resolve => {
            timeoutRef.current = setTimeout(async () => {
              const result = await executeWithRetry(attempt + 1, ...args);
              resolve(result);
            }, retryDelay * attempt); // 지수 백오프
          });
        } else {
          // 최대 재시도 횟수 도달
          setRetryCount(maxRetries);
          onMaxRetriesReached?.();
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction, maxRetries, retryDelay, onRetry, onMaxRetriesReached],
  );

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      lastArgsRef.current = args;
      setRetryCount(0);
      return executeWithRetry(0, ...args);
    },
    [executeWithRetry],
  );

  const retry = useCallback(async (): Promise<T | null> => {
    if (isMaxRetriesReached) {
      console.warn('최대 재시도 횟수에 도달했습니다.');
      return null;
    }

    return executeWithRetry(retryCount + 1, ...lastArgsRef.current);
  }, [executeWithRetry, retryCount, isMaxRetriesReached]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setRetryCount(0);
    setIsLoading(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    retryCount,
    isMaxRetriesReached,
    execute,
    retry,
    reset,
    setData,
    setError,
  };
}

// 네트워크 상태를 감지하는 훅
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // 오프라인에서 온라인으로 복구됨
        window.dispatchEvent(new CustomEvent('network-recovered'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

// 자동 재시도 훅 (네트워크 복구 시)
export function useAutoRetry<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions & { autoRetryOnNetworkRecovery?: boolean } = {},
) {
  const { autoRetryOnNetworkRecovery = true, ...retryOptions } = options;
  const { isOnline, wasOffline } = useNetworkStatus();
  const retryHook = useRetry(asyncFunction, retryOptions);

  useEffect(() => {
    if (
      autoRetryOnNetworkRecovery &&
      isOnline &&
      wasOffline &&
      retryHook.error
    ) {
      // 네트워크가 복구되고 에러가 있으면 자동 재시도
      retryHook.retry();
    }
  }, [
    isOnline,
    wasOffline,
    retryHook.error,
    autoRetryOnNetworkRecovery,
    retryHook,
  ]);

  return retryHook;
}
