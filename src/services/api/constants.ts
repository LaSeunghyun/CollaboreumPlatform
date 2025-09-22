import { apiCall } from './base';

// Constants API
export const constantsAPI = {
  // 모든 enum 값들 조회
  getEnums: () => apiCall('/constants/enums'),

  // 특정 카테고리의 enum 값들 조회
  getEnumsByCategory: (category: string) =>
    apiCall(`/constants/enums/${category}`),

  // CSV 헤더 조회
  getCsvHeaders: () => apiCall('/constants/csv-headers'),

  // 상태별 색상 조회
  getStatusColors: () => apiCall('/constants/status-colors'),

  // 상태별 아이콘 조회
  getStatusIcons: () => apiCall('/constants/status-icons'),

  // 아트워크 카테고리 조회
  getArtworkCategories: () => apiCall('/constants/artwork-categories'),

  // 비용 카테고리 조회
  getExpenseCategories: () => apiCall('/constants/expense-categories'),

  // 결제 방법 조회
  getPaymentMethods: () => apiCall('/constants/payment-methods'),

  // 상태 설정 조회
  getStatusConfig: (type: 'project' | 'funding' | 'event') =>
    apiCall(`/constants/status-config/${type}`),
};
