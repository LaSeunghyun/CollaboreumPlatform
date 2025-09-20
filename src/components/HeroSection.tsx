import React from 'react';
import { Button } from '../shared/ui/Button';
import { Card, CardContent } from '../shared/ui/Card';
import { Badge } from '../shared/ui/Badge';
import {
  Users,
  Star,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users2,
  Target,
  DollarSign,
  Heart,
} from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import { StatCard } from './ui/StatCard';
import { useState } from 'react';
import { usePlatformStats } from '../lib/api/useStats';
import { useArtists } from '../lib/api/useArtists';
import { useCategories } from '../lib/api/useCategories';

interface HeroSectionProps {
  onViewArtistCommunity?: (artistId: number) => void;
}

export function HeroSection({ onViewArtistCommunity }: HeroSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [currentIndex, setCurrentIndex] = useState(0);

  // React Query 훅 사용
  const { data: platformStatsData, isLoading: statsLoading } =
    usePlatformStats();
  const { data: artistsData, isLoading: artistsLoading } = useArtists({
    limit: 20,
  });
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();

  const platformStats = (platformStatsData as any)?.data || {
    totalArtists: 0,
    totalProjects: 0,
    totalFunding: 0,
    totalUsers: 0,
  };

  const weeklyNewcomers =
    (artistsData as any)?.data?.artists || (artistsData as any)?.artists || [];

  // API에서 카테고리 데이터 가져오기
  const categories = (categoriesData as any)?.data || [];
  const categoryLabels = categories.map((cat: any) => cat.label || cat.name);

  const isLoading = statsLoading || artistsLoading || categoriesLoading;

  const filteredNewcomers =
    selectedCategory === '전체'
      ? weeklyNewcomers
      : weeklyNewcomers.filter(
          (artist: any) => artist.category === selectedCategory,
        );

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % filteredNewcomers.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      prev => (prev - 1 + filteredNewcomers.length) % filteredNewcomers.length,
    );
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>히어로 섹션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 카테고리가 로드되지 않은 경우 기본값 사용
  if (categoryLabels.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>카테고리 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Hero Section */}
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden'>
        {/* Sophisticated Background */}
        <div className='absolute inset-0'>
          <div className='via-secondary/20 to-muted/30 absolute inset-0 bg-gradient-to-br from-background'></div>
          {/* Animated Background Elements */}
          <div className='bg-primary/10 animate-float absolute left-1/4 top-1/4 h-72 w-72 rounded-full blur-3xl'></div>
          <div
            className='bg-primary/5 animate-float absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full blur-3xl'
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className='bg-primary/8 animate-float absolute left-1/2 top-3/4 h-48 w-48 rounded-full blur-2xl'
            style={{ animationDelay: '2s' }}
          ></div>
          {/* Yellow gradient highlight behind hero text */}
          <div className='bg-gradient-radial absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full from-yellow-400/30 via-yellow-300/15 to-transparent opacity-60 blur-3xl'></div>
        </div>

        <div className='relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8'>
          {/* Main Content */}
          <div className='mb-16'>
            <div className='bg-primary/10 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-primary'></span>
              새로운 창작 생태계가 시작됩니다
            </div>

            <h1 className='mb-8 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl'>
              <span className='mb-2 block'>아티스트와 팬이</span>
              <span className='mb-2 block'>함께 만드는</span>
              <span className='to-primary/70 block bg-gradient-to-r from-primary bg-clip-text font-extrabold text-transparent'>
                크리에이티브 생태계
              </span>
            </h1>

            <p className='mx-auto mb-12 max-w-4xl text-lg leading-relaxed text-muted-foreground md:text-xl lg:text-2xl'>
              독립 아티스트의 꿈을 현실로 만들고, 팬들과 함께 성장하는 새로운
              플랫폼.
              <br />
              <span className='font-medium text-foreground'>신뢰와 투명성</span>
              을 바탕으로 건강한 예술 생태계를 구축합니다.
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className='mx-auto grid max-w-5xl grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8'>
            <StatCard
              label='등록 아티스트'
              value={platformStats.totalArtists.toLocaleString()}
              icon={Users2}
              iconColor='text-indigo'
            />
            <StatCard
              label='성공 프로젝트'
              value={platformStats.totalProjects.toLocaleString()}
              icon={Target}
              iconColor='text-sky'
            />
            <StatCard
              label='총 펀딩 금액'
              value={`₩${(platformStats.totalFunding / 100000000).toFixed(1)}억`}
              icon={DollarSign}
              iconColor='text-green-500'
            />
            <StatCard
              label='활성 후원자'
              value={platformStats.totalUsers.toLocaleString()}
              icon={Heart}
              iconColor='text-red-500'
            />
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className='to-secondary/10 relative bg-gradient-to-b from-background py-24 lg:py-32'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-20 text-center'>
            <div className='from-primary/10 to-primary/5 border-primary/20 mb-8 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-6 py-3 text-sm font-semibold text-primary'>
              <span className='text-lg'>⭐</span>
              이번주 주목받는 신인 아티스트
            </div>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
              새롭게 합류한 <span className='text-primary'>창작자들</span>
            </h2>
            <p className='mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              창의적인 아이디어와 열정으로 가득한 신인 아티스트들과 함께하세요
            </p>
          </div>

          {/* Category Filter */}
          <div className='mb-12 flex justify-center'>
            <div className='glass-morphism border-border/30 flex gap-1 rounded-2xl p-2'>
              {categoryLabels.map((category: string) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentIndex(0);
                  }}
                  className={`cursor-pointer rounded-xl px-6 py-3 font-medium transition-all ${
                    selectedCategory === category
                      ? 'shadow-apple bg-primary text-primary-foreground'
                      : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Artists Carousel */}
          <div className='relative'>
            <div className='overflow-hidden'>
              <div
                className='flex gap-6 transition-transform duration-300 ease-in-out'
                style={{
                  transform: `translateX(-${currentIndex * (100 / Math.min(filteredNewcomers.length, 3))}%)`,
                }}
              >
                {filteredNewcomers.map((artist: any) => (
                  <div
                    key={artist.id}
                    className='w-full flex-shrink-0 md:w-1/2 lg:w-1/3'
                  >
                    <Card className='hover:shadow-apple-lg border-border/50 group cursor-pointer overflow-hidden rounded-3xl transition-all duration-300'>
                      <div className='relative h-48'>
                        <ImageWithFallback
                          src={artist.coverImage}
                          alt={`${artist.name} cover`}
                          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                        <Badge
                          className={`absolute left-4 top-4 rounded-xl font-medium ${
                            artist.category === '음악'
                              ? 'bg-primary text-primary-foreground'
                              : artist.category === '미술'
                                ? 'bg-chart-5 text-white'
                                : artist.category === '문학'
                                  ? 'bg-chart-2 text-white'
                                  : 'bg-destructive text-white'
                          }`}
                        >
                          {artist.category}
                        </Badge>
                      </div>

                      <CardContent className='p-6'>
                        <div className='mb-4 flex items-center gap-4'>
                          <div className='border-3 shadow-apple relative -mt-10 h-14 w-14 overflow-hidden rounded-full border-background bg-background'>
                            <ImageWithFallback
                              src={artist.profileImage}
                              alt={artist.name}
                              className='h-full w-full object-cover'
                            />
                          </div>
                          <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-foreground'>
                              {artist.name}
                            </h3>
                            <p className='text-muted-foreground'>
                              {artist.age}세 • {artist.location}
                            </p>
                          </div>
                          <div className='flex items-center gap-1 text-muted-foreground'>
                            <Star className='h-4 w-4 fill-current text-primary' />
                            <span className='font-medium'>
                              {artist.followers}
                            </span>
                          </div>
                        </div>

                        <p className='text-foreground/80 mb-4 line-clamp-2 leading-relaxed'>
                          {artist.bio}
                        </p>

                        <div className='mb-6 flex flex-wrap gap-2'>
                          {artist.tags.map((tag: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='bg-secondary/80 rounded-lg px-3 py-1 text-xs text-foreground'
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className='flex gap-3'>
                          <Button
                            size='sm'
                            className='hover:bg-primary/90 flex-1 rounded-xl bg-primary font-medium text-primary-foreground'
                            onClick={() => onViewArtistCommunity?.(artist.id)}
                          >
                            <MessageCircle className='mr-2 h-4 w-4' />
                            커뮤니티
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            title='아티스트 프로필 보기'
                            className='hover:bg-secondary/50 cursor-pointer rounded-xl border-border px-4'
                          >
                            <Users className='h-4 w-4' />
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
                  className='glass-morphism shadow-apple hover:shadow-apple-lg border-border/30 absolute left-0 top-1/2 z-10 -translate-x-4 -translate-y-1/2 cursor-pointer rounded-full p-3 transition-all'
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className='h-5 w-5 text-foreground' />
                </button>
                <button
                  onClick={nextSlide}
                  className='glass-morphism shadow-apple hover:shadow-apple-lg border-border/30 absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 cursor-pointer rounded-full p-3 transition-all'
                  disabled={currentIndex >= filteredNewcomers.length - 3}
                >
                  <ChevronRight className='h-5 w-5 text-foreground' />
                </button>
              </>
            )}
          </div>

          {/* More Artists Button */}
          <div className='mt-12 text-center'>
            <Button
              variant='outline'
              size='lg'
              className='bg-background/80 hover:bg-secondary/50 cursor-pointer rounded-2xl border-border px-8 py-4 font-medium text-foreground backdrop-blur-sm'
            >
              더 많은 신인 아티스트 보기
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
