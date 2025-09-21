import React from 'react';
import { Card, CardContent } from './ui/card';
import { Calendar, Image, Trophy, Headphones, ArrowRight } from 'lucide-react';

interface QuickLinksSectionProps {
  onNavigate?: (section: string) => void;
}

export function QuickLinksSection({ onNavigate }: QuickLinksSectionProps) {
  const quickLinks = [
    {
      id: 'events',
      title: '이벤트',
      description: '진행 중인 특별 이벤트와 공모전을 확인하세요',
      icon: Calendar,
      color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      stats: '15개 진행중',
    },
    {
      id: 'gallery',
      title: '작품 갤러리',
      description: '아티스트들의 다양한 작품을 감상해보세요',
      icon: Image,
      color: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
      stats: '2,341개 작품',
    },
    {
      id: 'achievements',
      title: '성공 스토리',
      description: '펀딩에 성공한 프로젝트들의 이야기를 만나보세요',
      icon: Trophy,
      color: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      stats: '89개 성공',
    },
    {
      id: 'podcasts',
      title: '크리에이터 토크',
      description: '아티스트들의 창작 이야기와 인사이트를 들어보세요',
      icon: Headphones,
      color: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      stats: '새 에피소드',
    },
  ];

  return (
    <section className='to-secondary/20 bg-gradient-to-b from-background py-12'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-3xl font-bold tracking-tight text-foreground'>
            더 많은 <span className='text-primary'>창작 콘텐츠</span>
          </h2>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {quickLinks.map(link => {
            const IconComponent = link.icon;
            return (
              <Card
                key={link.id}
                className='hover:shadow-apple-lg to-secondary/30 group cursor-pointer overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-background transition-all duration-300'
                onClick={() => onNavigate?.(link.id)}
              >
                <CardContent className='p-6 text-center'>
                  <div
                    className={`h-16 w-16 ${link.color} mx-auto mb-6 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110`}
                  >
                    <IconComponent className='h-8 w-8' />
                  </div>

                  <h3 className='mb-3 text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary'>
                    {link.title}
                  </h3>

                  <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
                    {link.description}
                  </p>

                  <div className='flex items-center justify-between'>
                    <span className='bg-primary/10 rounded-full px-3 py-1 text-xs font-medium text-primary'>
                      {link.stats}
                    </span>
                    <ArrowRight className='h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary' />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
