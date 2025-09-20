/**
 * 에러 처리 유틸리티
 */

import { ApiError, AppError } from '../types';

// 에러 타입 정의
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

// 에러 레벨 정의
export enum ErrorLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// 에러 분류 인터페이스
export interface ErrorClassification {
  type: ErrorType;
  level: ErrorLevel;
  retryable: boolean;
  userMessage: string;
  technicalMessage: string;
}

// 에러 분류 함수
export function classifyError(error: unknown): ErrorClassification {
  // API 에러인 경우
  if (isApiError(error)) {
    return classifyApiError(error);
  }

  // 네트워크 에러인 경우
  if (isNetworkError(error)) {
    return {
      type: ErrorType.NETWORK,
      level: ErrorLevel.MEDIUM,
      retryable: true,
      userMessage: '네트워크 연결을 확인해주세요.',
      technicalMessage: 'Network connection failed',
    };
  }

  // 알 수 없는 에러
  return {
    type: ErrorType.UNKNOWN,
    level: ErrorLevel.MEDIUM,
    retryable: false,
    userMessage: '알 수 없는 오류가 발생했습니다.',
    technicalMessage: 'Unknown error occurred',
  };
}

// API 에러 분류
function classifyApiError(error: ApiError): ErrorClassification {
  switch (error.status) {
    case 400:
      return {
        type: ErrorType.VALIDATION,
        level: ErrorLevel.LOW,
        retryable: false,
        userMessage: '입력한 정보를 확인해주세요.',
        technicalMessage: error.message,
      };
    case 401:
      return {
        type: ErrorType.AUTHENTICATION,
        level: ErrorLevel.HIGH,
        retryable: false,
        userMessage: '로그인이 필요합니다.',
        technicalMessage: 'Authentication required',
      };
    case 403:
      return {
        type: ErrorType.AUTHORIZATION,
        level: ErrorLevel.HIGH,
        retryable: false,
        userMessage: '접근 권한이 없습니다.',
        technicalMessage: 'Access denied',
      };
    case 404:
      return {
        type: ErrorType.NOT_FOUND,
        level: ErrorLevel.LOW,
        retryable: false,
        userMessage: '요청한 리소스를 찾을 수 없습니다.',
        technicalMessage: 'Resource not found',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        type: ErrorType.SERVER,
        level: ErrorLevel.HIGH,
        retryable: true,
        userMessage: '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        technicalMessage: error.message,
      };
    default:
      return {
        type: ErrorType.API,
        level: ErrorLevel.MEDIUM,
        retryable: (error.status ?? 0) >= 500,
        userMessage: error.message || '요청 처리 중 오류가 발생했습니다.',
        technicalMessage: error.message,
      };
  }
}

// 에러 타입 체크 함수들
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    'status' in error &&
    (error as ApiError).success === false
  );
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('ERR_NETWORK'))
  );
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.status === 400;
}

export function isAuthenticationError(error: unknown): boolean {
  return isApiError(error) && error.status === 401;
}

export function isAuthorizationError(error: unknown): boolean {
  return isApiError(error) && error.status === 403;
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export function isServerError(error: unknown): boolean {
  return isApiError(error) && (error.status ?? 0) >= 500;
}

// 에러 로깅 함수
export function logError(error: unknown, context?: Record<string, any>): void {
  const classification = classifyError(error);
  const errorData: AppError = {
    success: false,
    status: 500,
    code: classification.type,
    message: classification.technicalMessage,
    details: {
      ...context,
      level: classification.level,
      retryable: classification.retryable,
      timestamp: new Date().toISOString(),
    },
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  };

  // 개발 환경에서는 콘솔에 로그
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', errorData);
  }

  // 프로덕션 환경에서는 에러 리포팅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등의 에러 리포팅 서비스로 전송
    // reportError(errorData);
  }
}

// 에러 복구 전략
export function getErrorRecoveryStrategy(error: unknown): {
  shouldRetry: boolean;
  retryDelay: number;
  maxRetries: number;
} {
  const classification = classifyError(error);

  if (!classification.retryable) {
    return {
      shouldRetry: false,
      retryDelay: 0,
      maxRetries: 0,
    };
  }

  switch (classification.type) {
    case ErrorType.NETWORK:
      return {
        shouldRetry: true,
        retryDelay: 1000, // 1초
        maxRetries: 3,
      };
    case ErrorType.SERVER:
      return {
        shouldRetry: true,
        retryDelay: 2000, // 2초
        maxRetries: 2,
      };
    default:
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: 0,
      };
  }
}

// 사용자 친화적 에러 메시지 생성
export function getUserFriendlyMessage(error: unknown): string {
  const classification = classifyError(error);
  return classification.userMessage;
}

// 에러 경계용 에러 생성
export function createErrorBoundaryError(error: Error, errorInfo: unknown): AppError {
  return {
    success: false,
    status: 500,
    code: 'ERROR_BOUNDARY',
    message: 'React Error Boundary caught an error',
    details: {
      componentStack: errorInfo.componentStack,
      errorBoundary: errorInfo.errorBoundary,
    },
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };
}

// 에러 메트릭 수집
export function collectErrorMetrics(error: unknown, context?: Record<string, any>): void {
  const classification = classifyError(error);

  // 에러 메트릭 데이터 수집
  const metrics = {
    errorType: classification.type,
    errorLevel: classification.level,
    retryable: classification.retryable,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context,
  };

  // 메트릭 수집 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // collectMetrics(metrics);
  }
}

// 에러 알림 전송
export function sendErrorNotification(error: unknown, context?: Record<string, any>): void {
  const classification = classifyError(error);

  // 중요한 에러인 경우 알림 전송
  if (classification.level === ErrorLevel.CRITICAL || classification.level === ErrorLevel.HIGH) {
    const notification = {
      title: '시스템 오류 발생',
      message: classification.userMessage,
      type: 'error' as const,
      timestamp: new Date().toISOString(),
      context,
    };

    // 알림 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // sendNotification(notification);
    }
  }
}
