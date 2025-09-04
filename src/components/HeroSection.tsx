import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Play, TrendingUp, Users, Award, Star, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { userAPI, statsAPI } from '../services/api';
import { getCategoryBadgeColor } from '../constants/categories';

interface HeroSectionProps {
  onViewArtistCommunity?: (artistId: number) => void;
  onNavigate?: (section: string) => void;
}

export function HeroSection({ onViewArtistCommunity, onNavigate }: HeroSectionProps) {
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
          const API_BASE_URL = process.env.REACT_APP_API_URL ||
            (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://collaboreumplatform-production.up.railway.app/api');

          const statsResponse = await fetch(`${API_BASE_URL}/stats/platform`);
          if (statsResponse.ok) {
            const contentType = statsResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const statsData = await statsResponse.json();
              console.log('플랫폼 통계 데이터:', statsData);

              if (statsData.success && statsData.data) {
                setPlatformStats({
                  totalArtists: statsData.data.registeredArtists || 0,
                  totalProjects: statsData.data.successfulProjects || 0,
                  totalFunding: statsData.data.totalFunding || 0,
                  totalUsers: statsData.data.activeSupporters || 0
                });
              } else {
                // API 응답이 실패한 경우 기본값 사용
                setPlatformStats({
                  totalArtists: 0,
                  totalProjects: 0,
                  totalFunding: 0,
                  totalUsers: 0
                });
              }
            } else {
              // HTML 응답인 경우 기본값 유지
              setPlatformStats({
                totalArtists: 0,
                totalProjects: 0,
                totalFunding: 0,
                totalUsers: 0
              });
            }
          } else {
            console.warn('통계 API 응답 실패:', statsResponse.status);
            setPlatformStats({
              totalArtists: 0,
              totalProjects: 0,
              totalFunding: 0,
              totalUsers: 0
            });
          }
        } catch (error) {
          console.error('통계 API 호출 실패:', error);
          // API 실패 시 기본값 유지
          setPlatformStats({
            totalArtists: 0,
            totalProjects: 0,
            totalFunding: 0,
            totalUsers: 0
          });
        }

        // 주간 신규 아티스트 데이터 가져오기
        try {
          const newcomersResponse = await fetch('/api/artists/weekly-newcomers');
          if (newcomersResponse.ok) {
            const contentType = newcomersResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const newcomersData = await newcomersResponse.json();
              setWeeklyNewcomers(newcomersData.data || []);
            } else {
              // HTML 응답인 경우 빈 배열로 설정
              setWeeklyNewcomers([]);
            }
          } else {
            setWeeklyNewcomers([]);
          }
        } catch (error) {
          setWeeklyNewcomers([]);
        }

        // 카테고리 데이터 가져오기
        try {
          const { constantsService } = require('../services/constants');
          const enums = await constantsService.getEnums();
          const artistCategories = Object.values(enums.ARTIST_CATEGORIES || {});
          setCategories(["전체", ...(artistCategories as string[])]);
        } catch (error) {
          // 기본값 유지
          setCategories(["전체"]);
        }
      } catch (error) {
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
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Sophisticated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-muted/30"></div>
          {/* Animated Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-primary/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          {/* Yellow gradient highlight behind hero text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-yellow-400/30 via-yellow-300/15 to-transparent rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {/* Main Content */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              새로운 창작 생태계가 시작됩니다
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 tracking-tight">
              <span className="block mb-2">아티스트와 팬이</span>
              <span className="block mb-2">함께 만드는</span>
              <span className="block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-extrabold">
                크리에이티브 생태계
              </span>
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              독립 아티스트의 꿈을 현실로 만들고, 팬들과 함께 성장하는 새로운 플랫폼.<br />
              <span className="text-foreground font-medium">신뢰와 투명성</span>을 바탕으로 건강한 예술 생태계를 구축합니다.
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-5xl mx-auto">
            {[
              { number: platformStats.totalArtists.toLocaleString(), label: "등록 아티스트", icon: "👨‍🎨" },
              { number: platformStats.totalProjects.toLocaleString(), label: "성공 프로젝트", icon: "🎯" },
              { number: `₩${(platformStats.totalFunding / 100000000).toFixed(1)}억`, label: "총 펀딩 금액", icon: "💰" },
              { number: platformStats.totalUsers.toLocaleString(), label: "활성 후원자", icon: "❤️" }
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="glass-morphism rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:shadow-apple-lg hover:scale-105">
                  <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-2xl lg:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm lg:text-base text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/10 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary/20">
              <span className="text-lg">⭐</span>
              이번주 주목받는 신인 아티스트
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
              새롭게 합류한 <span className="text-primary">창작자들</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              창의적인 아이디어와 열정으로 가득한 신인 아티스트들과 함께하세요
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-1 p-2 glass-morphism rounded-2xl border-border/30">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentIndex(0);
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-apple"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
                    <Card className="overflow-hidden hover:shadow-apple-lg transition-all duration-300 group cursor-pointer border-border/50 rounded-3xl">
                      <div className="relative h-48">
                        <ImageWithFallback
                          src={artist.coverImage}
                          alt={`${artist.name} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge
                          className={`absolute top-4 left-4 rounded-xl font-medium ${artist.category === "음악" ? "bg-primary text-primary-foreground" :
                            artist.category === "미술" ? "bg-chart-5 text-white" :
                              artist.category === "문학" ? "bg-chart-2 text-white" : "bg-destructive text-white"
                            }`}
                        >
                          {artist.category}
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full border-3 border-background shadow-apple overflow-hidden relative -mt-10 bg-background">
                            <ImageWithFallback
                              src={artist.profileImage}
                              alt={artist.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{artist.name}</h3>
                            <p className="text-muted-foreground">{artist.age}세 • {artist.location}</p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-4 h-4 text-primary fill-current" />
                            <span className="font-medium">{artist.followers}</span>
                          </div>
                        </div>

                        <p className="text-foreground/80 mb-4 line-clamp-2 leading-relaxed">{artist.bio}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {artist.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-secondary/80 text-foreground rounded-lg px-3 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
                            onClick={() => onViewArtistCommunity?.(artist.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            커뮤니티
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="아티스트 프로필 보기"
                            className="cursor-pointer border-border hover:bg-secondary/50 rounded-xl px-4"
                          >
                            <Users className="w-4 h-4" />
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 glass-morphism rounded-full p-3 shadow-apple hover:shadow-apple-lg transition-all z-10 cursor-pointer border-border/30"
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 glass-morphism rounded-full p-3 shadow-apple hover:shadow-apple-lg transition-all z-10 cursor-pointer border-border/30"
                  disabled={currentIndex >= filteredNewcomers.length - 3}
                >
                  <ChevronRight className="w-5 h-5 text-foreground" />
                </button>
              </>
            )}
          </div>

          {/* More Artists Button */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary/50 cursor-pointer font-medium px-8 py-4 rounded-2xl"
            >
              더 많은 신인 아티스트 보기
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}