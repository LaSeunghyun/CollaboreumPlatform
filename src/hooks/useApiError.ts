import { useState, useCallback } from 'react';

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: unknown;
}

export interface UseApiErrorReturn {
    error: ApiError | null;
    setError: (error: ApiError | null) => void;
    clearError: () => void;
    handleApiError: (error: unknown) => void;
    isError: boolean;
}

export function useApiError(): UseApiErrorReturn {
    const [error, setError] = useState<ApiError | null>(null);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleApiError = useCallback((error: unknown) => {
        let apiError: ApiError;

        if (error instanceof Error) {
            apiError = {
                message: error.message,
                details: error,
            };
        } else if (typeof error === 'object' && error !== null) {
            const errorObj = error as Record<string, unknown>;
            apiError = {
                message: String(errorObj.message || '알 수 없는 오류가 발생했습니다.'),
                code: String(errorObj.code || ''),
                status: Number(errorObj.status) || undefined,
                details: errorObj,
            };
        } else {
            apiError = {
                message: '알 수 없는 오류가 발생했습니다.',
                details: error,
            };
        }

        setError(apiError);
        console.error('API Error:', apiError);
    }, []);

    return {
        error,
        setError,
        clearError,
        handleApiError,
        isError: error !== null,
    };
}

// API 에러 메시지를 사용자 친화적으로 변환
export const getErrorMessage = (error: ApiError): string => {
    // HTTP 상태 코드별 메시지
    if (error.status) {
        switch (error.status) {
            case 400:
                return '잘못된 요청입니다. 입력값을 확인해주세요.';
            case 401:
                return '로그인이 필요합니다.';
            case 403:
                return '접근 권한이 없습니다.';
            case 404:
                return '요청한 리소스를 찾을 수 없습니다.';
            case 409:
                return '이미 존재하는 데이터입니다.';
            case 422:
                return '입력 데이터에 오류가 있습니다.';
            case 429:
                return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            case 500:
                return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            case 502:
            case 503:
            case 504:
                return '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
            default:
                return `서버 오류가 발생했습니다. (${error.status})`;
        }
    }

    // 에러 코드별 메시지
    if (error.code) {
        switch (error.code) {
            case 'NETWORK_ERROR':
                return '네트워크 연결을 확인해주세요.';
            case 'TIMEOUT':
                return '요청 시간이 초과되었습니다.';
            case 'VALIDATION_ERROR':
                return '입력 데이터에 오류가 있습니다.';
            case 'AUTHENTICATION_ERROR':
                return '인증에 실패했습니다.';
            case 'AUTHORIZATION_ERROR':
                return '권한이 없습니다.';
            default:
                return error.message;
        }
    }

    return error.message;
};

// 에러 복구 제안 메시지
export const getRecoverySuggestion = (error: ApiError): string | null => {
    if (error.status === 401) {
        return '로그인 페이지로 이동하시겠습니까?';
    }

    if (error.status === 403) {
        return '관리자에게 문의하시거나 다른 계정으로 로그인해주세요.';
    }

    if (error.status === 404) {
        return '홈페이지로 이동하시겠습니까?';
    }

    if (error.status === 429) {
        return '잠시 후 다시 시도해주세요.';
    }

    if (error.status && error.status >= 500) {
        return '잠시 후 다시 시도하거나 고객센터에 문의해주세요.';
    }

    if (error.code === 'NETWORK_ERROR') {
        return '인터넷 연결을 확인하고 다시 시도해주세요.';
    }

    return null;
};
