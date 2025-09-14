import { useQuery } from '@tanstack/react-query'
import { apiCall } from '../../services/api'

export interface PlatformStats {
    totalArtists: number
    totalProjects: number
    totalFunding: number
    totalUsers: number
}

export interface StatsResponse {
    success: boolean
    data: PlatformStats
    message?: string
}

export function usePlatformStats() {
    return useQuery<StatsResponse>({
        queryKey: ['platform-stats'],
        queryFn: () => apiCall<StatsResponse>('/stats/platform'),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
}

export function useCommunityStats() {
    return useQuery<StatsResponse>({
        queryKey: ['community-stats'],
        queryFn: () => apiCall<StatsResponse>('/stats/community'),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
}