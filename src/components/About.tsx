import React from 'react';
import { Button } from '../shared/ui/Button';
import { Card, CardContent } from './ui/card';
import {
  TrendingUp,
  Award,
  Users,
  ChevronLeft,
  ArrowRight,
  Users2,
  Target,
  DollarSign,
  Heart,
} from 'lucide-react';
import { StatCard } from './ui/StatCard';
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api/stats';

interface AboutProps {
  onBack?: () => void;
}

export function About({ onBack }: AboutProps) {
  // 플랫폼 통계 조회
  const { data: platformStats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: statsAPI.getPlatformStats,
    staleTime: 5 * 60 * 1000, // 5분
  });

  return (
    <div className='via-secondary/10 to-muted/20 min-h-screen bg-gradient-to-br from-background'>
      {/* Header */}
      <div className='bg-background/80 border-border/50 sticky top-20 z-40 border-b backdrop-blur-sm'>
        <div className='mx-auto max-w-6xl px-6 py-6 lg:px-8'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={onBack}
              className='hover:bg-secondary/60 rounded-xl'
            >
              <ChevronLeft className='mr-2 h-4 w-4' />
              홈으로
            </Button>
            <div className='bg-border/50 h-6 w-px' />
            <h1 className='text-2xl font-semibold text-foreground'>
              콜라보리움 소개
            </h1>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-6 py-16 lg:px-8'>
        {/* Hero Section */}
        <div className='mb-20 text-center'>
          <div className='mb-8'>
            <h2 className='mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl'>
              <span className='text-primary'>
                창작자와 팬이
                <br />
                함께 성장하는
                <br />
                새로운 플랫폼
              </span>
            </h2>
            <p className='mx-auto max-w-4xl text-xl leading-relaxed text-muted-foreground lg:text-2xl'>
              Collaboreum은 독립 아티스트들에게 안정적인 창작 환경을 제공하고,
              <br />
              팬들에게는 아티스트와 함께 성장할 수 있는 기회를 선사합니다.
            </p>
          </div>
        </div>

        {/* Core Features */}
        <div className='mb-20 grid gap-8 md:grid-cols-3'>
          <Card className='border-border/50 group rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-lg'>
            <CardContent className='pt-8'>
              <div className='bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110'>
                <TrendingUp className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mb-4 text-2xl font-semibold text-foreground'>
                제작 지원 펀딩
              </h3>
              <p className='text-lg leading-relaxed text-muted-foreground'>
                신뢰할 수 있는 신탁 관리 시스템으로 안전한 프로젝트 펀딩을
                지원합니다. WBS(작업분해구조) 기반의 체계적인 프로젝트 관리로
                투명성을 보장합니다.
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 group rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-lg'>
            <CardContent className='pt-8'>
              <div className='bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110'>
                <Award className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mb-4 text-2xl font-semibold text-foreground'>
                수익 공유 포인트
              </h3>
              <p className='text-lg leading-relaxed text-muted-foreground'>
                성공한 프로젝트의 수익을 포인트로 받고, 새로운 투자로
                연결하세요. 참여한 팬들도 함께 성공의 기쁨을 나눌 수 있는
                혁신적인 시스템입니다.
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 group rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-lg'>
            <CardContent className='pt-8'>
              <div className='bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110'>
                <Users className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mb-4 text-2xl font-semibold text-foreground'>
                커뮤니티 생태계
              </h3>
              <p className='text-lg leading-relaxed text-muted-foreground'>
                장르별 포럼, 라이브 스트리밍, 이벤트로 아티스트와 깊이
                소통하세요. 진정한 창작 커뮤니티에서 서로 영감을 주고받을 수
                있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className='space-y-20'>
          {/* Vision */}
          <div className='text-center'>
            <h3 className='mb-8 text-3xl font-bold text-foreground lg:text-4xl'>
              우리의 비전
            </h3>
            <div className='mx-auto max-w-4xl'>
              <p className='mb-8 text-xl leading-relaxed text-muted-foreground'>
                독립 아티스트들이 자신의 창작에만 집중할 수 있는 환경을 만들고,
                팬들이 단순한 소비자가 아닌 창작 과정의 파트너가 될 수 있는
                생태계를 구축합니다.
              </p>
              <div className='grid gap-8 md:grid-cols-2'>
                <Card className='border-border/50 rounded-2xl p-6'>
                  <h4 className='mb-4 text-xl font-semibold text-foreground'>
                    아티스트를 위해
                  </h4>
                  <p className='leading-relaxed text-muted-foreground'>
                    안정적인 수익 구조와 체계적인 프로젝트 관리 시스템으로
                    창작자들이 오롯이 작품에 집중할 수 있도록 지원합니다.
                  </p>
                </Card>
                <Card className='border-border/50 rounded-2xl p-6'>
                  <h4 className='mb-4 text-xl font-semibold text-foreground'>
                    팬을 위해
                  </h4>
                  <p className='leading-relaxed text-muted-foreground'>
                    좋아하는 아티스트와 더 가까워지고, 창작 과정에 참여하며,
                    성공의 기쁨을 함께 나눌 수 있는 특별한 경험을 제공합니다.
                  </p>
                </Card>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className='mb-12 text-center text-3xl font-bold text-foreground lg:text-4xl'>
              어떻게 작동하나요?
            </h3>
            <div className='grid gap-8 md:grid-cols-3'>
              <div className='text-center'>
                <div className='mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground'>
                  1
                </div>
                <h4 className='mb-4 text-xl font-semibold text-foreground'>
                  프로젝트 등록
                </h4>
                <p className='leading-relaxed text-muted-foreground'>
                  아티스트가 WBS를 통해 체계적으로 프로젝트를 계획하고 펀딩을
                  신청합니다.
                </p>
              </div>
              <div className='text-center'>
                <div className='mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground'>
                  2
                </div>
                <h4 className='mb-4 text-xl font-semibold text-foreground'>
                  팬 참여
                </h4>
                <p className='leading-relaxed text-muted-foreground'>
                  팬들이 프로젝트에 펀딩하고, 창작 과정을 지켜보며 소통합니다.
                </p>
              </div>
              <div className='text-center'>
                <div className='mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground'>
                  3
                </div>
                <h4 className='mb-4 text-xl font-semibold text-foreground'>
                  수익 공유
                </h4>
                <p className='leading-relaxed text-muted-foreground'>
                  프로젝트 성공 시 참여한 팬들도 포인트 형태로 수익을
                  공유받습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className='text-center'>
            <h3 className='mb-12 text-3xl font-bold text-foreground lg:text-4xl'>
              성장하는 커뮤니티
            </h3>
            <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
              <StatCard
                label='등록 아티스트'
                value={
                  statsLoading
                    ? '...'
                    : (
                        (platformStats as any)?.data?.totalArtists || 0
                      ).toLocaleString()
                }
                icon={Users2}
                iconColor='text-indigo'
              />
              <StatCard
                label='성공 프로젝트'
                value={
                  statsLoading
                    ? '...'
                    : (
                        (platformStats as any)?.data?.totalProjects || 0
                      ).toLocaleString()
                }
                icon={Target}
                iconColor='text-sky'
              />
              <StatCard
                label='총 펀딩 금액'
                value={
                  statsLoading
                    ? '...'
                    : `₩${((platformStats as any)?.data?.totalFunding || 0).toLocaleString()}`
                }
                icon={DollarSign}
                iconColor='text-green-500'
              />
              <StatCard
                label='활성 후원자'
                value={
                  statsLoading
                    ? '...'
                    : (
                        (platformStats as any)?.data?.totalUsers || 0
                      ).toLocaleString()
                }
                icon={Heart}
                iconColor='text-red-500'
              />
            </div>
          </div>

          {/* CTA */}
          <div className='py-16 text-center'>
            <h3 className='mb-8 text-3xl font-bold text-foreground lg:text-4xl'>
              지금 Collaboreum과 함께하세요
            </h3>
            <p className='mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground'>
              창작자와 팬이 함께 만들어가는 새로운 문화 생태계의 일원이
              되어보세요.
            </p>
            <Button
              size='lg'
              onClick={onBack}
              className='hover:bg-primary/90 rounded-2xl bg-primary px-10 py-4 text-lg font-medium text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105'
            >
              플랫폼 둘러보기
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
