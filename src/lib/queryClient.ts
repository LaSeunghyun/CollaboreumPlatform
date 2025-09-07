import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5분
            gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
            retry: (failureCount, error: any) => {
                // 401, 403, 404 에러는 재시도하지 않음
                if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
                    return false;
                }
                // 최대 3번 재시도
                return failureCount < 3;
            },
            refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 refetch 비활성화
            refetchOnReconnect: true, // 네트워크 재연결 시 refetch
        },
        mutations: {
            retry: false, // mutation은 재시도하지 않음
        },
    },
});
