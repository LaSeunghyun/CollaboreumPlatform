import { useQuery } from '@tanstack/react-query';
import { apiCall } from '../../services/api';

export interface Category {
  value: string;
  label: string;
  color: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ['community', 'categories'],
    queryFn: async (): Promise<Category[]> => {
      const response = await apiCall<{ success: boolean; data: Category[] }>('/community/categories');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
};