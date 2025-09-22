import { apiCall } from './base';

export const constantsAPI = {
  getEnums: () => apiCall('/constants/enums'),

  getEnumsByCategory: (category: string) =>
    apiCall(`/constants/enums/${category}`),

  getCsvHeaders: () => apiCall('/constants/csv-headers'),

  getStatusColors: () => apiCall('/constants/status-colors'),

  getStatusIcons: () => apiCall('/constants/status-icons'),

  getArtworkCategories: () => apiCall('/constants/artwork-categories'),

  getExpenseCategories: () => apiCall('/constants/expense-categories'),

  getPaymentMethods: () => apiCall('/constants/payment-methods'),

  getStatusConfig: (type: 'project' | 'funding' | 'event') =>
    apiCall(`/constants/status-config/${type}`),
};
