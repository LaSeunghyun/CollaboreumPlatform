import { useQuery } from '@tanstack/react-query';
import { categoryAPI } from '../../services/api';

// 모든 카테고리 조회
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryAPI.getAllCategories(),
        staleTime: 30 * 60 * 1000, // 30분
        gcTime: 60 * 60 * 1000, // 1시간
    });
};

// 특정 카테고리 조회
export const useCategory = (categoryId: string) => {
    return useQuery({
        queryKey: ['category', categoryId],
        queryFn: () => categoryAPI.getCategoryById(categoryId),
        enabled: !!categoryId,
        staleTime: 30 * 60 * 1000,
    });
};
