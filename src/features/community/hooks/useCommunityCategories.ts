// 커뮤니티 카테고리 React Query 훅들
import { useQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import type { CommunityCategory } from '../types'

// 카테고리 목록 조회
export const useCommunityCategories = () => {
    return useQuery({
        queryKey: ['community', 'categories'],
        queryFn: () => communityApi.getCategories(),
        staleTime: 30 * 60 * 1000, // 30분 (카테고리는 자주 변경되지 않음)
        gcTime: 60 * 60 * 1000, // 1시간
    })
}
