// 배치 API 호출을 위한 유틸리티
import type { ApiResponse } from '@/shared/types';
import { apiCall } from '../../services/api';

type SupportedMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface BatchRequest<TBody = Record<string, unknown>, TResult = unknown> {
    id: string;
    url: string;
    method?: SupportedMethod;
    data?: TBody;
}

export interface BatchResponse<TResult = unknown> {
    id: string;
    success: boolean;
    data?: TResult;
    error?: string;
}

class BatchApiManager {
    private requests: Map<string, BatchRequest<unknown, unknown>> = new Map();
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly BATCH_DELAY = 50; // 50ms 지연으로 배치 처리

    addRequest<TBody = Record<string, unknown>, TResult = unknown>(
        request: BatchRequest<TBody, TResult>,
    ): Promise<BatchResponse<TResult>> {
        return new Promise(resolve => {
            this.requests.set(request.id, request);

            // 기존 타임아웃이 있으면 취소
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            // 새로운 타임아웃 설정
            this.timeoutId = setTimeout(() => {
                this.processBatch().then(responses => {
                    const response = responses.find(r => r.id === request.id);
                    resolve(
                        (response as BatchResponse<TResult> | undefined) ?? {
                            id: request.id,
                            success: false,
                            error: 'Request not found',
                        },
                    );
                });
            }, this.BATCH_DELAY);
        });
    }

    private async processBatch(): Promise<Array<BatchResponse<unknown>>> {
        const requests = Array.from(this.requests.values());
        this.requests.clear();
        this.timeoutId = null;

        if (requests.length === 0) return [];

        try {
            // 서버에 배치 요청 전송
            const response = await apiCall('/api/batch', {
                method: 'POST',
                body: JSON.stringify({ requests }),
            });
            if (Array.isArray(response)) {
                return response as Array<BatchResponse<unknown>>;
            }

            const apiResponse = response as ApiResponse<Array<BatchResponse<unknown>>> | null;
            if (apiResponse?.data && Array.isArray(apiResponse.data)) {
                return apiResponse.data;
            }

            return [];
        } catch (error) {
            // 배치 처리 실패 시 개별 요청으로 폴백
            return this.fallbackToIndividualRequests(requests);
        }
    }

    private async fallbackToIndividualRequests(
        requests: Array<BatchRequest<unknown, unknown>>,
    ): Promise<Array<BatchResponse<unknown>>> {
        const responses: Array<BatchResponse<unknown>> = [];

        for (const request of requests) {
            try {
                const response = await apiCall(request.url, {
                    method: request.method || 'GET',
                    body: request.data ? JSON.stringify(request.data) : undefined,
                });

                responses.push({
                    id: request.id,
                    success: true,
                    data: response
                });
            } catch (error) {
                responses.push({
                    id: request.id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }

        return responses;
    }
}

export const batchApiManager = new BatchApiManager();

// 편의 함수들
export const batchGet = <TResult = unknown>(url: string, id?: string) =>
    batchApiManager.addRequest<Record<string, never>, TResult>({
        id: id || Math.random().toString(36).substr(2, 9),
        url,
        method: 'GET',
    });

export const batchPost = <TBody = Record<string, unknown>, TResult = unknown>(
    url: string,
    data?: TBody,
    id?: string,
) =>
    batchApiManager.addRequest<TBody | undefined, TResult>({
        id: id || Math.random().toString(36).substr(2, 9),
        url,
        method: 'POST',
        data,
    });

// TODO: 지원되는 요청 본문/응답 타입을 명확히 정의하고,
//       api/services 계층과 공유할 도메인 DTO를 도입한다.
