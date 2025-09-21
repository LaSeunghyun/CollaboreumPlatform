import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from '../shared/ui/Button';
import { Play, Radio, Eye, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const liveStreams = [
  {
    id: 1,
    title: '김민수의 작업실 라이브',
    artist: '김민수',
    viewers: 234,
    category: '음악',
    status: 'live',
    thumbnail:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
  },
  {
    id: 2,
    title: '새 앨범 레코딩 현장 공개',
    artist: '이하나',
    viewers: 156,
    category: '음악',
    status: 'live',
    thumbnail:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=200&fit=crop',
  },
  {
    id: 3,
    title: '수채화 풍경화 그리기',
    artist: '박예진',
    viewers: 89,
    category: '미술',
    status: 'scheduled',
    scheduledTime: '20:00',
    thumbnail:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
  },
];

export function LiveAndPointsSection() {
  return (
    <section
      id='live'
      className='from-secondary/10 bg-gradient-to-b to-background py-12'
    >
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mb-8 text-center'>
          <div className='bg-primary/10 border-primary/20 mb-8 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-primary'>
            <Radio className='h-4 w-4' />
            실시간 창작 스튜디오
          </div>
          <h2 className='mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
            아티스트와 함께하는{' '}
            <span className='text-primary'>라이브 스트리밍</span>
          </h2>
          <p className='mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
            창작 과정을 실시간으로 공유하고, 팬들과 소통하며 영감을 나누세요
          </p>
        </div>

        <div className='mx-auto max-w-5xl'>
          {/* Featured Live Stream */}
          <div className='mb-8'>
            <Card className='shadow-apple-lg from-primary/5 to-primary/10 overflow-hidden rounded-3xl border-0 bg-gradient-to-br'>
              <CardContent className='p-8'>
                <div className='grid items-center gap-8 lg:grid-cols-2'>
                  <div className='relative'>
                    <ImageWithFallback
                      src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop'
                      alt='Featured Live Stream'
                      className='h-64 w-full rounded-2xl object-cover'
                    />
                    <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>
                    <Badge className='absolute left-4 top-4 animate-pulse rounded-full bg-red-500 px-3 py-1 text-white'>
                      <div className='mr-2 h-2 w-2 animate-pulse rounded-full bg-white'></div>
                      LIVE
                    </Badge>
                    <div className='absolute bottom-4 left-4 right-4'>
                      <div className='flex items-center gap-2 text-white'>
                        <Eye className='h-4 w-4' />
                        <span className='font-medium'>1,234명 시청 중</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Badge className='bg-chart-1/10 text-chart-1 border-chart-1/20 mb-4 border'>
                      음악
                    </Badge>
                    <h3 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
                      김민수의 작업실 라이브
                    </h3>
                    <p className='mb-6 text-lg leading-relaxed text-muted-foreground'>
                      새 앨범의 타이틀곡 레코딩 과정을 실시간으로 공유합니다.
                      창작 과정의 고민과 영감을 함께 나눠보세요.
                    </p>
                    <div className='flex gap-4'>
                      <Button
                        size='lg'
                        className='hover:bg-primary/90 rounded-xl bg-primary font-semibold text-primary-foreground'
                      >
                        <Play className='mr-2 h-5 w-5' />
                        시청하기
                      </Button>
                      <Button
                        variant='outline'
                        size='lg'
                        className='rounded-xl'
                      >
                        <Users className='mr-2 h-5 w-5' />
                        채팅 참여
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Stream List */}
          <div>
            <div className='mb-6 flex items-center justify-between'>
              <h3 className='text-2xl font-bold text-foreground'>
                진행 중인 라이브
              </h3>
              <Button variant='outline' className='rounded-xl'>
                <Radio className='mr-2 h-4 w-4' />
                라이브 시작하기
              </Button>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {liveStreams.map(stream => (
                <Card
                  key={stream.id}
                  className='hover:shadow-apple-lg group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300'
                >
                  <div className='relative'>
                    <ImageWithFallback
                      src={stream.thumbnail}
                      alt={stream.title}
                      className='h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent'></div>

                    {stream.status === 'live' ? (
                      <Badge className='absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-white'>
                        <div className='mr-2 h-2 w-2 animate-pulse rounded-full bg-white'></div>
                        LIVE
                      </Badge>
                    ) : (
                      <Badge className='bg-primary/80 absolute left-4 top-4 rounded-full px-3 py-1 text-white'>
                        <Calendar className='mr-1 h-3 w-3' />
                        {stream.scheduledTime}
                      </Badge>
                    )}

                    <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                        <Play className='h-8 w-8 fill-current text-white' />
                      </div>
                    </div>

                    {stream.status === 'live' && (
                      <div className='absolute bottom-4 left-4 right-4'>
                        <div className='flex items-center gap-2 text-white'>
                          <Eye className='h-4 w-4' />
                          <span className='font-medium'>
                            {stream.viewers}명 시청 중
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className='p-6'>
                    <Badge
                      className={`mb-3 ${
                        stream.category === '음악'
                          ? 'bg-chart-1/10 text-chart-1 border-chart-1/20 border'
                          : 'bg-chart-5/10 text-chart-5 border-chart-5/20 border'
                      }`}
                    >
                      {stream.category}
                    </Badge>

                    <h4 className='mb-2 line-clamp-2 font-bold text-foreground transition-colors duration-300 group-hover:text-primary'>
                      {stream.title}
                    </h4>

                    <p className='text-sm text-muted-foreground'>
                      by {stream.artist}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
