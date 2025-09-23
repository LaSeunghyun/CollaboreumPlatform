import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '../shared/ui/Button';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Filter,
  Search,
  ChevronLeft,
} from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback';

const events = [
  {
    id: 1,
    title: '홍대 인디밴드 합동공연',
    date: '2025-08-15',
    time: '19:00',
    location: '홍대 클럽 에반스',
    attendees: 89,
    category: '음악',
    price: '₩15,000',
    organizer: '홍대음악협회',
    description:
      '홍대 지역 신진 인디밴드들의 합동 공연으로, 다양한 장르의 음악을 만나볼 수 있습니다.',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
  },
  {
    id: 2,
    title: "신진작가 그룹전 '새로운 시선'",
    date: '2025-08-18',
    time: '14:00',
    location: '서울시립미술관',
    attendees: 156,
    category: '미술',
    price: '무료',
    organizer: '서울시립미술관',
    description:
      '젊은 작가들의 현대적 시각이 담긴 회화, 조각, 설치 작품들을 전시합니다.',
    image:
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop',
  },
  {
    id: 3,
    title: '독립서점 작가와의 만남',
    date: '2025-08-22',
    time: '16:00',
    location: '북카페 문학동네',
    attendees: 34,
    category: '문학',
    price: '₩10,000',
    organizer: '문학동네',
    description:
      '신인 작가들과 함께하는 북토크 시간. 창작 과정과 영감에 대한 이야기를 나눕니다.',
    image:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
  },
  {
    id: 4,
    title: '젊은 연극인 페스티벌',
    date: '2025-08-25',
    time: '18:30',
    location: '대학로 소극장',
    attendees: 78,
    category: '공연',
    price: '₩20,000',
    organizer: '대학로연극협회',
    description:
      '신진 연극배우들의 창작극과 즉흥연기를 볼 수 있는 페스티벌입니다.',
    image:
      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=300&h=200&fit=crop',
  },
  {
    id: 5,
    title: '아마추어 사진작가 전시회',
    date: '2025-08-28',
    time: '10:00',
    location: '갤러리 아트스페이스',
    attendees: 45,
    category: '사진',
    price: '₩8,000',
    organizer: '사진작가협회',
    description:
      '일상의 순간들을 포착한 아마추어 사진작가들의 작품을 만나보세요.',
    image:
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=200&fit=crop',
  },
  {
    id: 6,
    title: '청년 창작자 네트워킹 데이',
    date: '2025-08-30',
    time: '15:00',
    location: '코워킹 스페이스 크리에이티브',
    attendees: 67,
    category: '네트워킹',
    price: '₩12,000',
    organizer: '청년창작자협회',
    description:
      '다양한 분야의 청년 창작자들이 만나 네트워킹하고 협업 기회를 모색합니다.',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
  },
];

interface EventsSectionProps {
  onBack?: () => void;
}

export function EventsSection({ onBack }: EventsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className='via-secondary/10 to-muted/20 min-h-screen bg-gradient-to-br from-background'>
      {/* Header */}
      {onBack && (
        <div className='bg-background/80 backdrop-blur-apple border-border/50 sticky top-20 z-40 border-b'>
          <div className='mx-auto max-w-7xl px-6 py-6 lg:px-8'>
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
              <h1 className='text-2xl font-semibold text-foreground'>이벤트</h1>
            </div>
          </div>
        </div>
      )}

      <section className='py-20 lg:py-24'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mb-16 text-center'>
            <div className='bg-primary/10 border-primary/20 mb-8 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-primary'>
              <Calendar className='h-4 w-4' />
              창작자들의 만남의 장
            </div>
            <h2 className='mb-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'>
              다가오는 <span className='text-primary'>이벤트</span>
            </h2>
            <p className='mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              독립 예술계의 모든 이벤트를 한눈에 확인하고 새로운 영감을
              만나보세요
            </p>
          </div>

          {/* Search and Filter */}
          <div className='mb-8 flex flex-col gap-4 md:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                <Input
                  placeholder='이벤트명, 장소, 주최자 검색...'
                  className='bg-input-background/80 rounded-2xl border-border pl-10'
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className='w-full rounded-xl md:w-48'>
                <SelectValue placeholder='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>전체</SelectItem>
                <SelectItem value='music'>음악</SelectItem>
                <SelectItem value='art'>미술</SelectItem>
                <SelectItem value='literature'>문학</SelectItem>
                <SelectItem value='performance'>공연</SelectItem>
                <SelectItem value='photography'>사진</SelectItem>
                <SelectItem value='networking'>네트워킹</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' className='rounded-xl md:w-auto'>
              <Filter className='mr-2 h-4 w-4' />
              필터
            </Button>
          </div>

          {/* Events Grid */}
          <div className='mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {events.map(event => (
              <Card
                key={event.id}
                className='hover:shadow-apple-lg group cursor-pointer overflow-hidden rounded-2xl border-0 transition-all duration-300'
              >
                <div className='relative'>
                  <div className='bg-secondary/20 h-48 overflow-hidden'>
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                  <Badge
                    className={`absolute left-4 top-4 font-medium text-white ${
                      event.category === '음악'
                        ? 'bg-chart-1'
                        : event.category === '미술'
                          ? 'bg-chart-5'
                          : event.category === '문학'
                            ? 'bg-chart-2'
                            : event.category === '공연'
                              ? 'bg-chart-4'
                              : event.category === '사진'
                                ? 'bg-chart-3'
                                : 'bg-muted-foreground'
                    }`}
                  >
                    {event.category}
                  </Badge>
                  <div className='absolute right-4 top-4'>
                    <Badge className='bg-background/90 border-0 font-medium text-foreground'>
                      {event.price}
                    </Badge>
                  </div>
                  <div className='absolute bottom-4 left-4 right-4'>
                    <div className='flex items-center gap-2 text-white'>
                      <Users className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        {event.attendees}명 참석 예정
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className='p-6'>
                  <h3 className='mb-2 line-clamp-2 font-bold text-foreground transition-colors duration-300 group-hover:text-primary'>
                    {event.title}
                  </h3>

                  <p className='mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground'>
                    {event.description}
                  </p>

                  <div className='mb-4 space-y-2 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-primary' />
                      <span>{event.date}</span>
                      <Clock className='ml-2 h-4 w-4 text-primary' />
                      <span>{event.time}</span>
                    </div>

                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-primary' />
                      <span className='line-clamp-1'>{event.location}</span>
                    </div>

                    <div className='flex items-center justify-between pt-2'>
                      <span className='text-xs text-muted-foreground'>
                        주최: {event.organizer}
                      </span>
                    </div>
                  </div>

                  <Button className='hover:bg-primary/90 w-full rounded-xl bg-primary font-semibold text-primary-foreground'>
                    참석하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className='mb-16 text-center'>
            <Button variant='outline' size='lg' className='rounded-xl'>
              더 많은 이벤트 보기
            </Button>
          </div>

          {/* Event Registration CTA */}
          <div className='text-center'>
            <Card className='glass-morphism border-border/30 mx-auto max-w-2xl rounded-3xl border p-8'>
              <div className='bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl'>
                <Calendar className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mb-4 text-2xl font-bold text-foreground'>
                이벤트를 등록하고 싶으신가요?
              </h3>
              <p className='mb-6 leading-relaxed text-muted-foreground'>
                당신의 창작 이벤트를 Collaboreum에서 홍보하고 더 많은 관객을
                만나보세요. 무료로 이벤트를 등록하고 통합 스케줄러의 혜택을
                누리세요.
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Button
                  size='lg'
                  className='hover:bg-primary/90 rounded-xl bg-primary font-semibold text-white'
                  onClick={() => navigate('/events/create')}
                >
                  이벤트 등록하기
                </Button>
                <Button variant='outline' size='lg' className='rounded-xl'>
                  등록 가이드 보기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
