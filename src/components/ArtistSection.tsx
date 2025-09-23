import { Card } from '@/shared/ui/shadcn/card';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '../shared/ui/Button';
import { Star, ExternalLink, Play, Users } from 'lucide-react';
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback';

const artists = [
  {
    id: 1,
    name: '김민수',
    category: '싱어송라이터',
    location: '서울',
    followers: 1247,
    rating: 4.8,
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    coverImage:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=150&fit=crop',
    bio: '10년간 길거리에서 시작한 음악 여행을 정규앨범으로 완성하고자 합니다.',
    tags: ['인디록', '포크', '발라드'],
    activeProjects: 1,
    completedProjects: 3,
    totalEarned: '₩45M',
  },
  {
    id: 2,
    name: '이지영',
    category: '현대미술가',
    location: '부산',
    followers: 892,
    rating: 4.9,
    profileImage:
      'https://images.unsplash.com/photo-1494790108755-2616b612b898?w=200&h=200&fit=crop&crop=face',
    coverImage:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=150&fit=crop',
    bio: '기억과 망각을 주제로 현대인의 내면을 그려내는 작업을 하고 있습니다.',
    tags: ['회화', '설치미술', '현대미술'],
    activeProjects: 1,
    completedProjects: 2,
    totalEarned: '₩32M',
  },
  {
    id: 3,
    name: '박소영',
    category: '소설가',
    location: '대구',
    followers: 1534,
    rating: 4.7,
    profileImage:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    coverImage:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=150&fit=crop',
    bio: '일상 속 작은 이야기들을 통해 현대인의 감정을 따뜻하게 그려냅니다.',
    tags: ['단편소설', '에세이', '일상'],
    activeProjects: 1,
    completedProjects: 4,
    totalEarned: '₩28M',
  },
];

export function ArtistSection() {
  return (
    <section id='artists' className='bg-secondary/30 py-12'>
      <div className='mx-auto max-w-6xl px-6 lg:px-8'>
        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-3xl font-bold tracking-tight text-foreground'>
            주목받는 아티스트
          </h2>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {artists.map(artist => (
            <Card
              key={artist.id}
              className='hover:shadow-apple-lg border-border/50 group overflow-hidden transition-all duration-300'
            >
              {/* Cover Image */}
              <div className='relative h-36'>
                <ImageWithFallback
                  src={artist.coverImage}
                  alt={`${artist.name} cover`}
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
              </div>

              {/* Profile Section */}
              <div className='relative px-6 pb-6'>
                {/* Profile Image */}
                <div className='absolute -top-12 left-6'>
                  <div className='shadow-apple h-24 w-24 overflow-hidden rounded-full border-4 border-background'>
                    <ImageWithFallback
                      src={artist.profileImage}
                      alt={artist.name}
                      className='h-full w-full object-cover'
                    />
                  </div>
                </div>

                {/* Artist Info */}
                <div className='pt-16'>
                  <div className='mb-3 flex items-start justify-between'>
                    <div>
                      <h3 className='text-xl font-bold text-foreground'>
                        {artist.name}
                      </h3>
                      <p className='font-medium text-muted-foreground'>
                        {artist.category}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {artist.location}
                      </p>
                    </div>
                    <div className='bg-primary/10 flex items-center rounded-full px-3 py-1'>
                      <Star className='mr-1 h-4 w-4 fill-current text-primary' />
                      <span className='text-sm font-medium text-primary'>
                        {artist.rating}
                      </span>
                    </div>
                  </div>

                  <p className='text-foreground/80 mb-4 line-clamp-2 text-sm leading-relaxed'>
                    {artist.bio}
                  </p>

                  {/* Tags */}
                  <div className='mb-5 flex flex-wrap gap-2'>
                    {artist.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='bg-secondary/60 rounded-lg px-2 py-1 text-xs text-foreground'
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className='border-border/50 mb-4 grid grid-cols-3 gap-4 border-t py-4 text-center'>
                    <div>
                      <div className='text-lg font-bold text-foreground'>
                        {artist.followers}
                      </div>
                      <div className='text-xs font-medium text-muted-foreground'>
                        팔로워
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-foreground'>
                        {artist.completedProjects}
                      </div>
                      <div className='text-xs font-medium text-muted-foreground'>
                        완료 프로젝트
                      </div>
                    </div>
                    <div>
                      <div className='text-lg font-bold text-foreground'>
                        {artist.totalEarned}
                      </div>
                      <div className='text-xs font-medium text-muted-foreground'>
                        총 펀딩
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex gap-3'>
                    <Button className='hover:bg-primary/90 flex-1 bg-primary font-medium text-primary-foreground'>
                      <Users className='mr-2 h-4 w-4' />
                      팔로우
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:bg-secondary/50 rounded-xl border-border px-3'
                    >
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='hover:bg-secondary/50 rounded-xl border-border px-3'
                    >
                      <Play className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Active Project Notice */}
                  {artist.activeProjects > 0 && (
                    <div className='bg-primary/10 border-primary/20 mt-4 rounded-2xl border p-3 text-center'>
                      <span className='text-sm font-medium text-primary'>
                        현재 진행 중인 프로젝트 {artist.activeProjects}개
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className='mt-8 text-center'>
          <Button
            variant='outline'
            size='lg'
            className='bg-background/80 hover:bg-secondary/50 border-border px-8 py-4 font-medium text-foreground backdrop-blur-sm'
          >
            더 많은 아티스트 보기
          </Button>
        </div>
      </div>
    </section>
  );
}
