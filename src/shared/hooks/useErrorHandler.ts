import { useCallback, useState } from 'react';
import {
  classifyError,
  logError,
  getUserFriendlyMessage,
  getErrorRecoveryStrategy,
  collectErrorMetrics,
  sendErrorNotification,
  ErrorType,
  ErrorLevel
} from '../lib/errorHandler';
import { ApiError, AppError } from '../types';

// 에러 상태 인터페이스
export interface ErrorState {
  error: AppError | null;
  isError: boolean;
  errorMessage: string;
  errorType: ErrorType | null;
  errorLevel: ErrorLevel | null;
  retryable: boolean;
}

// 에러 핸들러 훅 반환 타입
export interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: unknown, context?: Record<string, any>) => void;
  clearError: () => void;
  retry: () => void;
  isRetrying: boolean;
}

// 에러 핸들러 훅
export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: '',
    errorType: null,
    errorLevel: null,
    retryable: false,
  });
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: unknown, context?: Record<string, any>) => {
    const classification = classifyError(error);

    // 에러 로깅
    logError(error, context);

    // 에러 메트릭 수집
    collectErrorMetrics(error, context);

    // 에러 알림 전송
    sendErrorNotification(error, context);

    // 에러 상태 업데이트
    setErrorState({
      error: error as AppError,
      isError: true,
      errorMessage: getUserFriendlyMessage(error),
      errorType: classification.type,
      errorLevel: classification.level,
      retryable: classification.retryable,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: '',
      errorType: null,
      errorLevel: null,
      retryable: false,
    });
  }, []);

  const retry = useCallback(async () => {
    if (!errorState.retryable || isRetrying) return;

    setIsRetrying(true);

    try {
      // 재시도 로직 구현
      // 예: API 재호출, 컴포넌트 리렌더링 등
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 재시도 성공 시 에러 상태 클리어
      clearError();
    } catch (error) {
      // 재시도 실패 시 에러 처리
      handleError(error, { retryAttempt: true });
    } finally {
      setIsRetrying(false);
    }
  }, [errorState.retryable, isRetrying, clearError, handleError]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    isRetrying,
  };
}

// 특정 에러 타입별 핸들러
export function useSpecificErrorHandler() {
  const { handleError, clearError } = useErrorHandler();

  const handleApiError = useCallback((error: ApiError, context?: Record<string, any>) => {
    handleError(error, { ...context, errorSource: 'API' });
  }, [handleError]);

  const handleNetworkError = useCallback((error: Error, context?: Record<string, any>) => {
    handleError(error, { ...context, errorSource: 'NETWORK' });
  }, [handleError]);

  const handleValidationError = useCallback((error: Error, context?: Record<string, any>) => {
    handleError(error, { ...context, errorSource: 'VALIDATION' });
  }, [handleError]);

  const handleAuthError = useCallback((error: ApiError, context?: Record<string, any>) => {
    handleError(error, { ...context, errorSource: 'AUTHENTICATION' });
  }, [handleError]);

  return {
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleAuthError,
    clearError,
  };
}

// 에러 복구 전략 훅
export function useErrorRecovery() {
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);

  const attemptRecovery = useCallback(async (
    error: unknown,
    recoveryFn: () => Promise<void>,
    context?: Record<string, any>
  ): Promise<boolean> => {
    const strategy = getErrorRecoveryStrategy(error);

    if (!strategy.shouldRetry || retryCount >= strategy.maxRetries) {
      return false;
    }

    setIsRecovering(true);
    setRetryCount(prev => prev + 1);

    try {
      // 재시도 지연
      await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));

      // 복구 함수 실행
      await recoveryFn();

      // 복구 성공
      setRetryCount(0);
      return true;
    } catch (recoveryError) {
      // 복구 실패
      if (retryCount < strategy.maxRetries) {
        // 재귀적으로 재시도
        return attemptRecovery(recoveryError, recoveryFn, context);
      }
      return false;
    } finally {
      setIsRecovering(false);
    }
  }, [retryCount]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
  }, []);

  return {
    attemptRecovery,
    resetRetryCount,
    retryCount,
    isRecovering,
  };
}

// 에러 경계용 훅
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<unknown>(null);

  const handleError = useCallback((error: Error, errorInfo: unknown) => {
    setError(error);
    setErrorInfo(errorInfo);

    // 에러 로깅
    logError(error, { componentStack: (errorInfo as { componentStack?: string })?.componentStack });
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  return {
    error,
    errorInfo,
    handleError,
    resetError,
    hasError: !!error,
  };
}
