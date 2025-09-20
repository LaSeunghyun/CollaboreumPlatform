// API 응답 처리 유틸리티

export const safeApiCall = async <T>(
  apiCall: () => Promise<unknown>,
  fallback: T,
  errorMessage: string = 'API 호출에 실패했습니다.'
): Promise<T> => {
  try {
    const response = await apiCall();
    
    // 응답이 배열인 경우
    if (Array.isArray(response)) {
      return response as T;
    }
    
    // 응답이 객체이고 data 속성이 있는 경우
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data as T;
    }
    
    // 응답이 객체이고 success 속성이 있는 경우
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success && 'data' in response) {
        return response.data as T;
      }
      throw new Error(response.message || errorMessage);
    }
    
    // 그 외의 경우 응답을 그대로 반환
    return response as T;
  } catch (error) {
    console.error('API 호출 실패:', error);
    return fallback;
  }
};

// 배열 응답을 안전하게 처리
export const safeArrayResponse = <T>(
  response: unknown,
  fallback: T[] = []
): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object' && 'data' in response) {
    return Array.isArray(response.data) ? response.data : fallback;
  }
  
  return fallback;
};

// 객체 응답을 안전하게 처리
export const safeObjectResponse = <T>(
  response: unknown,
  fallback: T | null = null
): T | null => {
  if (response && typeof response === 'object') {
    if ('data' in response) {
      return response.data as T;
    }
    return response as T;
  }
  
  return fallback;
};

// 에러 메시지를 안전하게 추출
export const getErrorMessage = (error: unknown, fallback: string = '알 수 없는 오류가 발생했습니다.'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
};

// API 상태를 확인하는 유틸리티
export const checkApiHealth = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

// 재시도 로직이 포함된 API 호출
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};
