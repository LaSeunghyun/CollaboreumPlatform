import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10분으로 증가 (더 오래 캐시 유지)
      gcTime: 30 * 60 * 1000, // 30분으로 증가 (메모리에서 더 오래 유지)
      retry: (failureCount, error: any) => {
        // 401, 403, 404 에러는 재시도하지 않음
        if (
          error?.status === 401 ||
          error?.status === 403 ||
          error?.status === 404
        ) {
          return false;
        }
        // 최대 2번 재시도로 감소 (빠른 실패)
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // 지수 백오프 최대 5초
      refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 refetch
      refetchOnMount: false, // 마운트 시 자동 refetch 비활성화 (캐시된 데이터 우선 사용)
    },
    mutations: {
      retry: false, // mutation은 재시도하지 않음
    },
  },
});
