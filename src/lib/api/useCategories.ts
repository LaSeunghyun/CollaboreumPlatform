import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/core/client';

export interface Category {
  value: string;
  label: string;
  color: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['community', 'categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await apiCall<
        Category[] | { success: boolean; data: Category[] }
      >('/community/categories');

      if (Array.isArray(response)) {
        return response;
      }

      if (response && typeof response === 'object' && 'data' in response) {
        return response.data ?? [];
      }

      return [];
    },
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
};
