import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery as useInfiniteQueryHook,
    UseQueryOptions,
    UseMutationOptions,
} from '@tanstack/react-query';
import { api } from '@/lib/api/api';
import type { ApiResponse } from '@/shared/types';
import { SearchParams } from '../../types/api';

// 기본 쿼리 옵션
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    retry: 1,
    retryDelay: 1000,
};

// 기본 뮤테이션 옵션
const defaultMutationOptions = {
    retry: 1,
    retryDelay: 1000,
};

// 제네릭 API 쿼리 훅
export function useApiQuery<T = any>(
    queryKey: (string | number | object)[],
    endpoint: string,
    params?: Record<string, any>,
    options?: Partial<UseQueryOptions<ApiResponse<T>>>
) {
    return useQuery({
        queryKey,
        queryFn: () => api.get<T>(endpoint, params),
        ...defaultQueryOptions,
        ...options,
    });
}

// 제네릭 API 뮤테이션 훅
export function useApiMutation<T = any, V = any>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options?: Partial<UseMutationOptions<ApiResponse<T>, Error, V>>
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data?: V) => {
            switch (method) {
                case 'POST':
                    return api.post<T>(endpoint, data);
                case 'PUT':
                    return api.put<T>(endpoint, data);
                case 'DELETE':
                    return api.delete<T>(endpoint);
                case 'PATCH':
                    return api.patch<T>(endpoint, data);
                default:
                    return api.post<T>(endpoint, data);
            }
        },
        ...defaultMutationOptions,
        ...options,
    });
}

// 페이지네이션 쿼리 훅
export function usePaginatedQuery<T = any>(
    queryKey: (string | number | object)[],
    endpoint: string,
    params: SearchParams = {},
    options?: Partial<UseQueryOptions<ApiResponse<T>>>
) {
    return useApiQuery<T>(
        queryKey,
        endpoint,
        params,
        {
            ...options,
            placeholderData: (previousData) => previousData as any, // 페이지네이션 시 이전 데이터 유지
        }
    );
}

// 무한 스크롤 쿼리 훅
export function useInfiniteQuery<T = any>(
    queryKey: (string | number | object)[],
    endpoint: string,
    params: Omit<SearchParams, 'page'> = {},
    options?: any
) {
    return useInfiniteQueryHook({
        queryKey,
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
            api.get<T>(endpoint, { ...params, page: pageParam }),
        getNextPageParam: (lastPage: ApiResponse<any>) => {
            if (!lastPage?.pagination) return undefined;
            const { page } = lastPage.pagination as { page: number; totalPages?: number; pages?: number };
            const totalPages = lastPage.pagination.totalPages ?? (lastPage.pagination as any).pages;
            if (typeof totalPages !== 'number') return undefined;
            return page < totalPages ? page + 1 : undefined;
        },
        ...defaultQueryOptions,
        ...options,
    });
}

// 쿼리 무효화 헬퍼
export function useInvalidateQueries() {
    const queryClient = useQueryClient();

    return {
        invalidateAll: () => queryClient.invalidateQueries(),
        invalidateByKey: (queryKey: (string | number | object)[]) =>
            queryClient.invalidateQueries({ queryKey }),
        invalidateByPattern: (pattern: string) =>
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey.some(key =>
                        typeof key === 'string' && key.includes(pattern)
                    )
            }),
    };
}

// 옵티미스틱 업데이트 헬퍼
export function useOptimisticMutation<T = any, V = any>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options?: {
        queryKey: (string | number | object)[];
        updateFn: (oldData: T | undefined, newData: V) => T;
        rollbackFn?: (oldData: T | undefined, newData: V) => T;
    }
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data?: V) => {
            switch (method) {
                case 'POST':
                    return api.post<T>(endpoint, data);
                case 'PUT':
                    return api.put<T>(endpoint, data);
                case 'DELETE':
                    return api.delete<T>(endpoint);
                case 'PATCH':
                    return api.patch<T>(endpoint, data);
                default:
                    return api.post<T>(endpoint, data);
            }
        },
        onMutate: async (newData) => {
            if (!options) return;

            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: options.queryKey });

            // 이전 데이터 백업
            const previousData = queryClient.getQueryData<T>(options.queryKey);

            // 옵티미스틱 업데이트
            queryClient.setQueryData<T>(options.queryKey, (old) =>
                options.updateFn(old, newData as V)
            );

            return { previousData };
        },
        onError: (err, newData, context) => {
            // 에러 시 롤백
            if (options && context?.previousData) {
                queryClient.setQueryData<T>(options.queryKey, context.previousData);
            }
        },
        onSettled: () => {
            // 성공/실패 관계없이 쿼리 무효화
            if (options) {
                queryClient.invalidateQueries({ queryKey: options.queryKey });
            }
        },
        ...defaultMutationOptions,
    });
}
