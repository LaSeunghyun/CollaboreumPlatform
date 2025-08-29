import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, ExternalLink, Play, Users, RefreshCw } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { artistAPI } from '../services/api';
import { Artist } from '../types';

export function ArtistSection() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArtists = async () => {
    try {
      setLoading(true);
      setError(null);

      // API 사용 시도
      try {
        const response = await artistAPI.getPopularArtists(20) as any;
        if (response.success && response.data?.artists) {
          setArtists(response.data.artists);
          return;
        }
      } catch (apiError) {
        console.error('API 호출 실패:', apiError);
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        setArtists([]);
        return;
      }

    } catch (error) {
      console.error('아티스트 데이터 로드 실패:', error);
      setError('아티스트 정보를 불러오는데 실패했습니다.');
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const handleRefresh = () => {
    loadArtists();
  };

  const handleFollow = async (artistId: string) => {
    try {
      await artistAPI.followArtist(artistId, 'follow');
      // 팔로우 성공 시 로컬 상태 업데이트
      setArtists(prev => prev.map(artist =>
        artist.id === artistId
          ? { ...artist, followers: artist.followers + 1 }
          : artist
      ));
    } catch (error) {
      console.error('팔로우 실패:', error);
      // 에러 처리 (사용자에게 알림 등)
    }
  };

  if (loading) {
    return (
      <section id="artists" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">아티스트 정보를 불러오는 중...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="artists" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Users className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-medium">{error}</p>
            </div>
            <div className="space-x-4">
              <Button onClick={handleRefresh} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (artists.length === 0) {
    return (
      <section id="artists" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">표시할 아티스트가 없습니다.</p>
            <Button onClick={handleRefresh} className="mt-4">
              새로고침
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="artists" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">주목받는 아티스트</h2>
          <p className="text-xl text-gray-600">재능 있는 독립 아티스트들을 만나보세요</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="relative h-32">
                <ImageWithFallback
                  src={artist.coverImage}
                  alt={`${artist.name} cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                {artist.isVerified && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="default" className="bg-blue-600">
                      인증됨
                    </Badge>
                  </div>
                )}
                {artist.featured && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="default" className="bg-yellow-600">
                      추천
                    </Badge>
                  </div>
                )}
              </div>

              {/* Profile Section */}
              <div className="relative px-6 pb-6">
                {/* Profile Image */}
                <div className="absolute -top-12 left-6 z-10">
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
                    <ImageWithFallback
                      src={artist.profileImage || (artist as any).avatar}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Artist Info */}
                <div className="pt-16">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
                      <p className="text-gray-600">{artist.category}</p>
                      <p className="text-sm text-gray-500">{artist.location}</p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium">{artist.rating || 0}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{artist.bio}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {artist.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    )) || []}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-gray-200">
                    <div>
                      <div className="text-lg font-bold text-gray-900">{artist.followers || 0}</div>
                      <div className="text-xs text-gray-600">팔로워</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{artist.completedProjects || 0}</div>
                      <div className="text-xs text-gray-600">완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {artist.totalEarned ? `₩${artist.totalEarned.toLocaleString()}` : '₩0'}
                      </div>
                      <div className="text-xs text-gray-600">총 펀딩</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleFollow(artist.id)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      팔로우
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Active Project Notice */}
                  {(artist.activeProjects || 0) > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-center">
                      <span className="text-sm text-blue-800">
                        현재 진행 중인 프로젝트 {artist.activeProjects}개
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            더 많은 아티스트 보기
          </Button>
        </div>
      </div>
    </section>
  );
}