import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Play, TrendingUp, Users, Award, Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { userAPI, statsAPI } from '../services/api';

interface HeroSectionProps {
  onViewArtistCommunity?: (artistId: number) => void;
}

export function HeroSection({ onViewArtistCommunity }: HeroSectionProps) {
  const [weeklyNewcomers, setWeeklyNewcomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [currentIndex, setCurrentIndex] = useState(0);

  // 플랫폼 통계 상태
  const [platformStats, setPlatformStats] = useState({
    totalArtists: 0,
    totalProjects: 0,
    totalFunding: 0,
    totalUsers: 0
  });

  const [categories, setCategories] = useState<string[]>(["전체"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 플랫폼 통계 데이터 가져오기
        try {
          // TODO: 실제 API 연동
          // const statsResponse = await apiService.getPlatformStats();
          // setPlatformStats(statsResponse);
        } catch (error) {
          console.error('플랫폼 통계 데이터를 가져오는데 실패했습니다:', error);
          // API 실패 시 기본값 유지
        }

        // API에서 데이터 가져오기 (아직 구현되지 않음)
        setWeeklyNewcomers([]);

        // 카테고리 데이터 가져오기
        try {
          const { constantsService } = require('../services/constants');
          const enums = await constantsService.getEnums();
          const artistCategories = Object.values(enums.ARTIST_CATEGORIES || {});
          setCategories(["전체", ...(artistCategories as string[])]);
        } catch (error) {
          console.error('카테고리 데이터를 가져오는데 실패했습니다:', error);
          // 기본값 유지
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // 에러 발생 시 기본값으로 설정
        setWeeklyNewcomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredNewcomers = selectedCategory === "전체"
    ? weeklyNewcomers
    : weeklyNewcomers.filter(artist => artist.category === selectedCategory);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredNewcomers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredNewcomers.length) % filteredNewcomers.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">히어로 섹션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Hero Section with Artistic Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Artistic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {/* Abstract Art Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-purple-200/40 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-200/25 rounded-full blur-2xl animate-pulse delay-500"></div>

          {/* Geometric Shapes */}
          <div className="absolute top-1/4 right-1/3 w-16 h-16 border-2 border-blue-300/50 rotate-45 animate-spin-slow"></div>
          <div className="absolute bottom-1/3 left-1/5 w-12 h-12 bg-gradient-to-r from-purple-300/40 to-pink-300/40 rotate-12"></div>

          {/* Musical Notes SVG */}
          <div className="absolute top-1/3 left-1/6 text-blue-300/30 animate-bounce">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>

          {/* Paint Brush SVG */}
          <div className="absolute bottom-1/4 right-1/4 text-purple-300/30 animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 00-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
            </svg>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              아티스트와 팬이 함께 만드는<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                창작의 새로운 공간
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              독립 아티스트의 꿈을 현실로, 팬들의 후원을 성공의 공유로.
              신뢰 기반의 펀딩과 수익 공유 시스템으로 건강한 예술 생태계를 만들어갑니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                아티스트로 시작하기
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-purple-300 text-purple-600 hover:bg-purple-50">
                <Play className="w-5 h-5 mr-2" />
                플랫폼 둘러보기
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6 backdrop-blur-sm bg-white/80 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">제작 지원 펀딩</h3>
                <p className="text-gray-600">
                  신뢰할 수 있는 신탁 관리 시스템으로 안전한 프로젝트 펀딩을 지원합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 backdrop-blur-sm bg-white/80 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">수익 공유 포인트</h3>
                <p className="text-gray-600">
                  성공한 프로젝트의 수익을 포인트로 받고, 새로운 투자로 연결하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 backdrop-blur-sm bg-white/80 hover:bg-white/90 transition-all duration-300 hover:shadow-lg border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">커뮤니티 생태계</h3>
                <p className="text-gray-600">
                  장르별 포럼, 라이브 스트리밍, 이벤트로 아티스트와 깊이 소통하세요.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="backdrop-blur-sm bg-white/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900">
                {platformStats.totalArtists.toLocaleString()}
              </div>
              <div className="text-gray-600">등록 아티스트</div>
            </div>
            <div className="backdrop-blur-sm bg-white/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900">
                {platformStats.totalProjects.toLocaleString()}
              </div>
              <div className="text-gray-600">성공 프로젝트</div>
            </div>
            <div className="backdrop-blur-sm bg-white/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900">
                ₩{(platformStats.totalFunding / 100000000).toFixed(1)}억
              </div>
              <div className="text-gray-600">총 펀딩 금액</div>
            </div>
            <div className="backdrop-blur-sm bg-white/60 rounded-lg p-4">
              <div className="text-3xl font-bold text-gray-900">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <div className="text-gray-600">활성 후원자</div>
            </div>
          </div>
        </div>
      </section>

      {/* 이번주 신인 섹션 - 카테고리별 */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 mb-4 px-4 py-2">
              ⭐ 이번주 신인 아티스트
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">새롭게 합류한 창작자들</h2>
            <p className="text-xl text-gray-600">이번주에 Collaboreum에 합류한 신인 아티스트들을 만나보세요</p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentIndex(0);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedCategory === category
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Artists Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{ transform: `translateX(-${currentIndex * (100 / Math.min(filteredNewcomers.length, 3))}%)` }}
              >
                {filteredNewcomers.map((artist) => (
                  <div key={artist.id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="relative h-40">
                        <ImageWithFallback
                          src={artist.coverImage}
                          alt={`${artist.name} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <Badge
                          className={`absolute top-3 left-3 ${artist.category === "음악" ? "bg-blue-500" :
                            artist.category === "미술" ? "bg-purple-500" :
                              artist.category === "문학" ? "bg-green-500" : "bg-red-500"
                            }`}
                        >
                          {artist.category}
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden relative -mt-8">
                            <ImageWithFallback
                              src={artist.profileImage}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                            <p className="text-sm text-gray-600">{artist.age}세 • {artist.location}</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{artist.followers}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{artist.bio}</p>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {artist.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => onViewArtistCommunity?.(artist.id)}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            커뮤니티
                          </Button>
                          <Button variant="outline" size="sm" title="아티스트 프로필 보기">
                            <Users className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {filteredNewcomers.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-10"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all z-10"
                  disabled={currentIndex >= filteredNewcomers.length - 3}
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* More Artists Button */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              더 많은 신인 아티스트 보기
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}