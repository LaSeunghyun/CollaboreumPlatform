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

      // API 사용 시도 - 새로 가입한 아티스트 우선 조회
      try {
        const response = await artistAPI.getNewArtists(20) as any;
        if (response.success && response.data?.artists) {
          setArtists(response.data.artists);
          return;
        }
      } catch (apiError) {
        console.error('새 아티스트 API 호출 실패:', apiError);
        // 새 아티스트 API 실패 시 인기 아티스트로 폴백
        try {
          const fallbackResponse = await artistAPI.getPopularArtists(20) as any;
          if (fallbackResponse.success && fallbackResponse.data?.artists) {
            setArtists(fallbackResponse.data.artists);
            return;
          }
        } catch (fallbackError) {
          console.error('인기 아티스트 API 호출도 실패:', fallbackError);
        }

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
    <section id="artists" className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary/20">
            <span className="text-lg">👨‍🎨</span>
            주목받는 아티스트
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            창의적인 <span className="text-primary">아티스트</span>들을 만나보세요
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            다양한 장르의 독립 아티스트들과 함께 새로운 창작의 세계를 탐험하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-apple-lg transition-all duration-300 group border-border/50 rounded-3xl">
              {/* Cover Image */}
              <div className="relative h-48">
                <ImageWithFallback
                  src={artist.coverImage}
                  alt={`${artist.name} cover`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Profile Section */}
              <div className="relative px-6 pb-6">
                {/* Profile Image */}
                <div className="absolute -top-12 left-6">
                  <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-apple">
                    <ImageWithFallback
                      src={artist.profileImage || (artist as any).avatar}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Artist Info */}
                <div className="pt-16">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{artist.name}</h3>
                      <p className="text-muted-foreground font-medium">{artist.category}</p>
                      <p className="text-sm text-muted-foreground">{artist.location}</p>
                    </div>
                    <div className="flex items-center bg-primary/10 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-primary fill-current mr-1" />
                      <span className="text-sm font-medium text-primary">{artist.rating || 0}</span>
                    </div>
                  </div>

                  <p className="text-foreground/80 text-sm mb-4 line-clamp-2 leading-relaxed">{artist.bio}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {artist.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-secondary/80 text-foreground rounded-lg px-3 py-1">
                        {tag}
                      </Badge>
                    )) || []}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-border/50 mb-6">
                    <div>
                      <div className="text-lg font-bold text-foreground">{artist.followers || 0}</div>
                      <div className="text-xs text-muted-foreground font-medium">팔로워</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">{artist.completedProjects || 0}</div>
                      <div className="text-xs text-muted-foreground font-medium">완료 프로젝트</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {artist.totalEarned ? `₩${artist.totalEarned.toLocaleString()}` : '₩0'}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">총 펀딩</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
                      onClick={() => handleFollow(artist.id)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      팔로우
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/50 rounded-xl px-4">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-border hover:bg-secondary/50 rounded-xl px-4">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Active Project Notice */}
                  {(artist.activeProjects || 0) > 0 && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                      <span className="text-sm text-primary font-medium">
                        현재 진행 중인 프로젝트 {artist.activeProjects}개
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary/50 cursor-pointer font-medium px-8 py-4 rounded-2xl"
          >
            더 많은 아티스트 보기
          </Button>
        </div>
      </div>
    </section>
  );
}