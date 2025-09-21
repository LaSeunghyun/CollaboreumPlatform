import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery as useInfiniteQueryHook,
    type QueryKey,
    type UseQueryOptions,
    type UseMutationOptions,
    type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import {
    api,
    type QueryParamsInput,
    type RequestBodyInput,
} from '@/lib/api/api';
import type { ApiResponse } from '@/shared/types';
import type { SearchParams } from '../../types/api';

type MutationMethod = 'POST' | 'PUT' | 'DELETE' | 'PATCH';

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
export function useApiQuery<
    TData = unknown,
    TParams extends QueryParamsInput | undefined = QueryParamsInput | undefined,
    TError = Error,
>(
    queryKey: QueryKey,
    endpoint: string,
    params?: TParams,
    options?: Omit<
        UseQueryOptions<ApiResponse<TData>, TError, ApiResponse<TData>, QueryKey>,
        'queryKey' | 'queryFn'
    >,
) {
    return useQuery<ApiResponse<TData>, TError>({
        queryKey,
        queryFn: () => api.get<TData>(endpoint, params),
        ...defaultQueryOptions,
        ...options,
    });
}

// 제네릭 API 뮤테이션 훅
export function useApiMutation<
    TData = unknown,
    TVariables extends RequestBodyInput = RequestBodyInput,
    TError = Error,
>(
    endpoint: string,
    method: MutationMethod = 'POST',
    options?: Omit<
        UseMutationOptions<ApiResponse<TData>, TError, TVariables | void>,
        'mutationFn'
    >,
) {
    return useMutation<ApiResponse<TData>, TError, TVariables | void>({
        mutationFn: (variables?: TVariables | void) => {
            switch (method) {
                case 'POST':
                    return api.post<TData>(endpoint, variables as RequestBodyInput);
                case 'PUT':
                    return api.put<TData>(endpoint, variables as RequestBodyInput);
                case 'DELETE':
                    return api.delete<TData>(endpoint);
                case 'PATCH':
                    return api.patch<TData>(endpoint, variables as RequestBodyInput);
                default:
                    return api.post<TData>(endpoint, variables as RequestBodyInput);
            }
        },
        ...defaultMutationOptions,
        ...options,
    });
}

// 페이지네이션 쿼리 훅
export function usePaginatedQuery<TData = unknown, TError = Error>(
    queryKey: QueryKey,
    endpoint: string,
    params: SearchParams = {},
    options?: Omit<
        UseQueryOptions<ApiResponse<TData>, TError, ApiResponse<TData>, QueryKey>,
        'queryKey' | 'queryFn'
    >,
) {
    return useApiQuery<TData, QueryParamsInput, TError>(
        queryKey,
        endpoint,
        params as QueryParamsInput,
        {
            ...options,
            placeholderData: (previousData: ApiResponse<TData> | undefined) =>
                previousData, // 페이지네이션 시 이전 데이터 유지
        },
    );
}

// 무한 스크롤 쿼리 훅
export function useInfiniteQuery<TData = unknown, TError = Error>(
    queryKey: QueryKey,
    endpoint: string,
    params: Omit<SearchParams, 'page'> = {},
    options?: any,
) {
    return useInfiniteQueryHook({
        queryKey,
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
            api.get<TData>(endpoint, {
                ...params,
                page: pageParam,
            } as QueryParamsInput),
        getNextPageParam: (lastPage: ApiResponse<TData>) => {
            if (!lastPage?.pagination) return undefined;
            const { page, totalPages, hasNext } = lastPage.pagination;

            if (typeof page !== 'number') {
                return undefined;
            }

            if (typeof totalPages === 'number') {
                return page < totalPages ? page + 1 : undefined;
            }

            if (typeof hasNext === 'boolean') {
                return hasNext ? page + 1 : undefined;
            }

            const legacyPages = (lastPage.pagination as { pages?: number }).pages;
            if (typeof legacyPages === 'number') {
                return page < legacyPages ? page + 1 : undefined;
            }

            return undefined;
        },
        ...defaultQueryOptions,
        ...(options ?? {}),
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
                predicate: query =>
                    query.queryKey.some(
                        key => typeof key === 'string' && key.includes(pattern),
                    ),
            }),
    };
}

// 옵티미스틱 업데이트 헬퍼
interface OptimisticContext<TData> {
    previousData?: ApiResponse<TData>;
}

type BaseMutationOptions<TData, TVariables, TError> = Omit<
    UseMutationOptions<
        ApiResponse<TData>,
        TError,
        TVariables | void,
        OptimisticContext<TData>
    >,
    'mutationFn'
>;

interface OptimisticMutationOptions<TData, TVariables, TError = Error>
    extends BaseMutationOptions<TData, TVariables, TError> {
    queryKey: QueryKey;
    updateFn: (
        oldData: ApiResponse<TData> | undefined,
        newData: TVariables,
    ) => ApiResponse<TData> | undefined;
    rollbackFn?: (
        oldData: ApiResponse<TData> | undefined,
        newData: TVariables,
    ) => ApiResponse<TData> | undefined;
}

export function useOptimisticMutation<
    TData = unknown,
    TVariables extends RequestBodyInput = RequestBodyInput,
    TError = Error,
>(
    endpoint: string,
    method: MutationMethod = 'POST',
    options?: OptimisticMutationOptions<TData, TVariables, TError>,
) {
    const queryClient = useQueryClient();
    const {
        queryKey,
        updateFn,
        rollbackFn,
        onMutate,
        onError,
        onSettled,
        ...restOptions
    } = options ?? {};

    return useMutation<
        ApiResponse<TData>,
        TError,
        TVariables | void,
        OptimisticContext<TData>
    >({
        mutationFn: (variables?: TVariables | void) => {
            switch (method) {
                case 'POST':
                    return api.post<TData>(endpoint, variables as RequestBodyInput);
                case 'PUT':
                    return api.put<TData>(endpoint, variables as RequestBodyInput);
                case 'DELETE':
                    return api.delete<TData>(endpoint);
                case 'PATCH':
                    return api.patch<TData>(endpoint, variables as RequestBodyInput);
                default:
                    return api.post<TData>(endpoint, variables as RequestBodyInput);
            }
        },
        onMutate: async (variables, context) => {
            if (!queryKey || !updateFn) {
                return undefined;
            }

            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey });

            // 이전 데이터 백업
            const previousData =
                queryClient.getQueryData<ApiResponse<TData>>(queryKey);

            // 옵티미스틱 업데이트
            const nextData = updateFn(previousData, variables as TVariables);
            if (nextData !== undefined) {
                queryClient.setQueryData<ApiResponse<TData>>(queryKey, nextData);
            }

            const userContext = await onMutate?.(variables, context);
            if (userContext && typeof userContext === 'object') {
                return {
                    previousData,
                    ...userContext,
                } as OptimisticContext<TData>;
            }

            return { previousData };
        },
        onError: (error, variables, context, mutationContext) => {
            if (queryKey && rollbackFn && context?.previousData) {
                const rollbackData = rollbackFn(
                    context.previousData,
                    variables as TVariables,
                );
                if (rollbackData !== undefined) {
                    queryClient.setQueryData<ApiResponse<TData>>(queryKey, rollbackData);
                }
            } else if (queryKey && context?.previousData) {
                queryClient.setQueryData<ApiResponse<TData>>(
                    queryKey,
                    context.previousData,
                );
            }

            onError?.(error, variables, context, mutationContext);
        },
        onSettled: (data, error, variables, context, mutationContext) => {
            if (queryKey) {
                void queryClient.invalidateQueries({ queryKey });
            }

            onSettled?.(data, error, variables, context, mutationContext);
        },
        ...defaultMutationOptions,
        ...restOptions,
    });
}
