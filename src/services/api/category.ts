import { apiCall } from './base';

export const categoryAPI = {
  getAllCategories: () => apiCall('/categories'),

  getCategoryById: (categoryId: string) => apiCall(`/categories/${categoryId}`),

  createCategory: (data: any) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (categoryId: string, data: any) =>
    apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (categoryId: string) =>
    apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    }),
};
