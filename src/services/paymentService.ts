import { api } from './apiClient';
import { ApiResponse } from '../types/api';

// 결제 관련 타입 정의
export interface PaymentRequest {
  projectId: string;
  amount: number;
  paymentMethod: 'card' | 'bank' | 'kakao' | 'naver';
  backerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  rewardId?: string;
  message?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentUrl?: string;
  expiresAt?: string;
}

export interface RefundRequest {
  paymentId: string;
  reason: string;
  amount?: number; // 부분 환불 시
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  processedAt?: string;
}

// 결제 서비스 클래스
class PaymentService {
  // 결제 요청 생성
  async createPayment(data: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return api.post<PaymentResponse>('/payments', data);
  }

  // 결제 상태 확인
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    return api.get<PaymentResponse>(`/payments/${paymentId}`);
  }

  // 결제 승인 (웹훅에서 호출)
  async confirmPayment(paymentId: string, transactionId: string): Promise<ApiResponse<PaymentResponse>> {
    return api.post<PaymentResponse>(`/payments/${paymentId}/confirm`, { transactionId });
  }

  // 결제 취소
  async cancelPayment(paymentId: string, reason: string): Promise<ApiResponse<PaymentResponse>> {
    return api.post<PaymentResponse>(`/payments/${paymentId}/cancel`, { reason });
  }

  // 환불 요청
  async requestRefund(data: RefundRequest): Promise<ApiResponse<RefundResponse>> {
    return api.post<RefundResponse>('/refunds', data);
  }

  // 환불 상태 확인
  async getRefundStatus(refundId: string): Promise<ApiResponse<RefundResponse>> {
    return api.get<RefundResponse>(`/refunds/${refundId}`);
  }

  // 결제 내역 조회
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    projectId?: string;
  }): Promise<ApiResponse<PaymentResponse[]>> {
    return api.get<PaymentResponse[]>('/payments', params);
  }

  // 프로젝트별 결제 통계
  async getProjectPaymentStats(projectId: string): Promise<ApiResponse<{
    totalAmount: number;
    totalBackers: number;
    dailyAmount: number[];
    paymentMethodStats: Record<string, number>;
  }>> {
    return api.get(`/payments/stats/project/${projectId}`);
  }
}

export const paymentService = new PaymentService();
