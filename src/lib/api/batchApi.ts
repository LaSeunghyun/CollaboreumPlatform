// 배치 API 호출을 위한 유틸리티
import { apiCall } from '../../services/api';

interface BatchRequest {
    id: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
}

interface BatchResponse {
    id: string;
    success: boolean;
    data?: any;
    error?: string;
}

class BatchApiManager {
    private requests: Map<string, BatchRequest> = new Map();
    private timeoutId: NodeJS.Timeout | null = null;
    private readonly BATCH_DELAY = 50; // 50ms 지연으로 배치 처리

    addRequest(request: BatchRequest): Promise<BatchResponse> {
        return new Promise((resolve) => {
            this.requests.set(request.id, request);

            // 기존 타임아웃이 있으면 취소
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            // 새로운 타임아웃 설정
            this.timeoutId = setTimeout(() => {
                this.processBatch().then(responses => {
                    const response = responses.find(r => r.id === request.id);
                    resolve(response || { id: request.id, success: false, error: 'Request not found' });
                });
            }, this.BATCH_DELAY);
        });
    }

    private async processBatch(): Promise<BatchResponse[]> {
        const requests = Array.from(this.requests.values());
        this.requests.clear();
        this.timeoutId = null;

        if (requests.length === 0) return [];

        try {
            // 서버에 배치 요청 전송
            const response = await apiCall('/api/batch', {
                method: 'POST',
                body: JSON.stringify({ requests })
            });

            return (response as any).data || [];
        } catch (error) {
            // 배치 처리 실패 시 개별 요청으로 폴백
            return this.fallbackToIndividualRequests(requests);
        }
    }

    private async fallbackToIndividualRequests(requests: BatchRequest[]): Promise<BatchResponse[]> {
        const responses: BatchResponse[] = [];

        for (const request of requests) {
            try {
                const response = await apiCall(request.url, {
                    method: request.method || 'GET',
                    body: request.data ? JSON.stringify(request.data) : undefined
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
export const batchGet = (url: string, id?: string) =>
    batchApiManager.addRequest({
        id: id || Math.random().toString(36).substr(2, 9),
        url,
        method: 'GET'
    });

export const batchPost = (url: string, data: any, id?: string) =>
    batchApiManager.addRequest({
        id: id || Math.random().toString(36).substr(2, 9),
        url,
        method: 'POST',
        data
    });
