import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artistAPI } from '../../services/api';

// TODO: Artist 관리 API 스키마가 확정되면 전용 DTO 타입으로 교체한다.
interface ArtistProfileUpdateInput {
  name?: string;
  username?: string;
  bio?: string;
  category?: string;
  tags?: string[];
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  [key: string]: unknown;
}

// 아티스트 목록 조회
export const useArtists = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  genre?: string;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['artists', params],
    queryFn: () => artistAPI.getAllArtists(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 아티스트 상세 조회
export const useArtist = (artistId: string) => {
  return useQuery({
    queryKey: ['artist', artistId],
    queryFn: () => artistAPI.getArtistById(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
};

// 인기 아티스트 조회
export const usePopularArtists = (limit?: number) => {
  return useQuery({
    queryKey: ['artists', 'popular', limit],
    queryFn: () => artistAPI.getPopularArtists(limit),
    staleTime: 10 * 60 * 1000, // 10분
    retry: 1, // 재시도 1회만
    retryDelay: 1000,
  });
};

// 신규 아티스트 조회
export const useNewArtists = (limit?: number) => {
  return useQuery({
    queryKey: ['artists', 'new', limit],
    queryFn: () => artistAPI.getNewArtists(limit),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 아티스트 팔로우/언팔로우
export const useFollowArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artistId,
      action,
    }: {
      artistId: string;
      action: 'follow' | 'unfollow';
    }) => artistAPI.followArtist(artistId, action),
    onSuccess: (_, { artistId }) => {
      queryClient.invalidateQueries({ queryKey: ['artist', artistId] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
};

// 아티스트 프로필 업데이트
export const useUpdateArtistProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      artistId,
      data,
    }: {
      artistId: string;
      data: ArtistProfileUpdateInput;
    }) => artistAPI.updateArtistProfile(artistId, data),
    onSuccess: (_, { artistId }) => {
      queryClient.invalidateQueries({ queryKey: ['artist', artistId] });
    },
  });
};
