import { useQuery } from '@tanstack/react-query'
import { liveStreamAPI } from '../../services/api'

export interface LiveStream {
    id: string
    title: string
    artist: string
    category: string
    status: 'live' | 'scheduled' | 'ended'
    viewers?: number
    scheduledTime?: string
    thumbnail?: string
    description?: string
}

export interface LiveStreamsResponse {
    success: boolean
    data?: {
        streams: LiveStream[]
    }
    streams?: LiveStream[]
    message?: string
}

export function useLiveStreams() {
    return useQuery<LiveStreamsResponse>({
        queryKey: ['live-streams'],
        queryFn: () => liveStreamAPI.getLiveStreams(),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    })
}

export function useLiveStream(streamId: string) {
    return useQuery<LiveStream>({
        queryKey: ['live-streams', streamId],
        queryFn: () => liveStreamAPI.getLiveStream(streamId),
        enabled: !!streamId,
        staleTime: 2 * 60 * 1000, // 2분
        gcTime: 5 * 60 * 1000, // 5분
    })
}
