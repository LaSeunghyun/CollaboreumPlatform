import { useQuery } from '@tanstack/react-query'
import { communityApi } from '../../features/community/api/communityApi'
import type { CommunityCategory } from '../../features/community/types'

export const useCategories = () => {
    return useQuery<CommunityCategory[]>({
        queryKey: ['categories'],
        queryFn: () => communityApi.getCategories(),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    })
}