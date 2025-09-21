import { useApiQuery, useApiMutation, usePaginatedQuery } from './useApi';
import { SearchParams } from '../../types/api';

// 결제 요청 생성
export const useCreatePayment = () => {
  return useApiMutation('/payments', 'POST', {
    onSuccess: () => {
      // 결제 성공 시 관련 쿼리 무효화
    },
  });
};

// 결제 상태 조회
export const usePaymentStatus = (paymentId: string) => {
  return useApiQuery(
    ['payment', paymentId],
    `/payments/${paymentId}`,
    undefined,
    { enabled: !!paymentId },
  );
};

// 결제 승인 처리
export const useConfirmPayment = () => {
  return useApiMutation('/payments/:paymentId/confirm', 'POST', {
    onSuccess: () => {
      // 결제 승인 성공 시 관련 쿼리 무효화
    },
  });
};

// 결제 취소
export const useCancelPayment = () => {
  return useApiMutation('/payments/:paymentId/cancel', 'POST', {
    onSuccess: () => {
      // 결제 취소 성공 시 관련 쿼리 무효화
    },
  });
};

// 결제 내역 조회
export const usePaymentHistory = (params?: SearchParams) => {
  return usePaginatedQuery(
    ['payments', params || {}],
    '/payments',
    params || {},
  );
};

// 프로젝트별 결제 통계
export const useProjectPaymentStats = (projectId: string) => {
  return useApiQuery(
    ['project-payment-stats', projectId],
    `/payments/stats/project/${projectId}`,
    undefined,
    { enabled: !!projectId },
  );
};
