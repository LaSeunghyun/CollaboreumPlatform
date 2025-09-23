import { apiCall } from '../core/client';

// Category APIs
export const categoryAPI = {
  // 모든 카테고리 조회
  getAllCategories: () => apiCall('/categories'),

  // 특정 카테고리 조회
  getCategoryById: (categoryId: string) => apiCall(`/categories/${categoryId}`),

  // 카테고리 생성 (관리자용)
  createCategory: (data: any) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 카테고리 수정 (관리자용)
  updateCategory: (categoryId: string, data: any) =>
    apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 카테고리 삭제 (관리자용)
  deleteCategory: (categoryId: string) =>
    apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    }),
};
