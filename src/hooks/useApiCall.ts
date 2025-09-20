import { useState, useCallback, useRef, useEffect } from 'react';

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

export interface ApiCallState<T = unknown> {
    data: T | null;
    loading: boolean;
    error: string | null;
    isSuccess: boolean;
    isError: boolean;
}

export interface ApiCallOptions<TData = unknown, TArgs extends unknown[] = []> {
    immediate?: boolean;
    retryCount?: number;
    retryDelay?: number;
    timeout?: number;
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    onFinally?: () => void;
    onRetry?: (attempt: number, args: TArgs) => void;
}

export interface ApiCallActions<TData = unknown, TArgs extends unknown[] = []> {
    execute: (...args: TArgs) => Promise<TData | null>;
    reset: () => void;
    retry: (...args: TArgs) => Promise<TData | null>;
}

export function useApiCall<TData = unknown, TArgs extends unknown[] = []>(
    apiFunction: AsyncFn<TArgs, TData>,
    options: ApiCallOptions<TData, TArgs> = {}
): ApiCallState<TData> & ApiCallActions<TData, TArgs> {
    const {
        immediate = false,
        retryCount = 0,
        retryDelay = 1000,
        timeout = 30000,
        onSuccess,
        onError,
        onFinally,
        onRetry,
    } = options;

    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    const retryCountRef = useRef(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);
    const lastArgsRef = useRef<TArgs | null>(null);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // API 호출 실행
    const execute = useCallback(async (...args: TArgs): Promise<TData | null> => {
        if (!isMountedRef.current) return null;

        setLoading(true);
        setError(null);
        setIsError(false);
        setIsSuccess(false);
        lastArgsRef.current = args;

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
        } catch (err: unknown) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (!isMountedRef.current) return null;

            const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
            setError(errorMessage);
            setIsError(true);
            setLoading(false);
            onError?.(errorMessage);
            onFinally?.();

            // 재시도 로직
            if (retryCountRef.current < retryCount) {
                retryCountRef.current++;
                onRetry?.(retryCountRef.current, args);
                setTimeout(() => {
                    if (isMountedRef.current) {
                        void execute(...args);
                    }
                }, retryDelay * retryCountRef.current);
            }

            return null;
        }
    }, [apiFunction, timeout, retryCount, retryDelay, onSuccess, onError, onFinally]);

    // 즉시 실행 옵션이 활성화된 경우
    useEffect(() => {
        if (!immediate) {
            return;
        }

        if (lastArgsRef.current) {
            void execute(...lastArgsRef.current);
            return;
        }

        void execute(...([] as unknown as TArgs));
    }, [immediate, execute]);

    // 재시도
    const retry = useCallback(async (...args: TArgs): Promise<TData | null> => {
        retryCountRef.current = 0;
        if (args.length > 0) {
            lastArgsRef.current = args;
            return execute(...args);
        }

        if (lastArgsRef.current) {
            return execute(...lastArgsRef.current);
        }

        return null;
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
export function useApiQuery<TData = unknown, TArgs extends unknown[] = []>(
    queryFunction: AsyncFn<TArgs, TData>,
    options: ApiCallOptions<TData, TArgs> = {}
) {
    return useApiCall(queryFunction, { ...options, immediate: true });
}

export function useApiMutation<TData = unknown, TArgs extends unknown[] = []>(
    mutationFunction: AsyncFn<TArgs, TData>,
    options: ApiCallOptions<TData, TArgs> = {}
) {
    return useApiCall(mutationFunction, { ...options, immediate: false });
}

// 여러 API 호출을 동시에 관리하는 훅
export function useApiBatch<TData = unknown, TArgs extends unknown[] = []>(
    apiFunctions: ReadonlyArray<AsyncFn<TArgs, TData>>,
    options: ApiCallOptions<TData, TArgs> = {}
) {
    const [results, setResults] = useState<Array<TData | null>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executeAll = useCallback(async (...args: TArgs) => {
        setLoading(true);
        setError(null);

        try {
            const promises = apiFunctions.map(fn => fn(...args));
            const settledResults = await Promise.allSettled(promises);

            const successResults = settledResults.map(result =>
                result.status === 'fulfilled' ? result.value : null
            );

            setResults(successResults);

            const hasError = settledResults.some(result => result.status === 'rejected');
            if (hasError) {
                setError('일부 요청이 실패했습니다.');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [apiFunctions]);

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
