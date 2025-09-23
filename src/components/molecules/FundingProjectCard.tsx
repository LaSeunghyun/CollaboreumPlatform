import React from 'react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Progress } from '@/shared/ui/shadcn/progress';
import { Clock, Users } from 'lucide-react';
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback';
import { ShareButton } from '../atoms/ShareButton';

interface FundingProjectCardProps {
  id: string;
  title: string;
  artist: string;
  category: string;
  thumbnail: string;
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  onClick?: () => void;
}

export const FundingProjectCard: React.FC<FundingProjectCardProps> = ({
  id,
  title,
  artist,
  category,
  thumbnail,
  currentAmount,
  targetAmount,
  backers,
  daysLeft,
  onClick,
}) => {
  const progressPercentage = (currentAmount / targetAmount) * 100;

  return (
    <Card
      className='hover:shadow-apple-lg border-border/50 group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-300'
      onClick={onClick}
    >
      {/* Share button overlay */}
      <div className='absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100'>
        <ShareButton
          url={`/projects/${id}`}
          title={title}
          description={`${artist}의 ${title} 프로젝트를 응원해주세요!`}
          variant='secondary'
          size='icon'
          className='shadow-apple rounded-xl bg-white/90 backdrop-blur-sm'
        />
      </div>

      <div className='relative aspect-video overflow-hidden'>
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        {/* Status badges */}
        <div className='absolute left-3 top-3'>
          {daysLeft <= 7 && (
            <Badge className='bg-red-500/90 text-xs text-white backdrop-blur-sm'>
              마감임박
            </Badge>
          )}
          {progressPercentage >= 100 && (
            <Badge className='ml-2 bg-green-500/90 text-xs text-white backdrop-blur-sm'>
              목표달성
            </Badge>
          )}
        </div>
      </div>

      <CardContent className='space-y-4 p-5'>
        <div className='space-y-3'>
          <Badge
            variant='secondary'
            className='bg-indigo/10 hover:bg-indigo/20 text-indigo'
          >
            {category}
          </Badge>
          <div className='space-y-1'>
            <h3 className='line-clamp-2 font-medium leading-snug'>{title}</h3>
            <p className='text-sm text-muted-foreground'>{artist}</p>
          </div>
        </div>

        <div className='space-y-3'>
          <Progress value={progressPercentage} className='h-2.5' />
          <div className='flex justify-between text-sm'>
            <span className='font-medium tabular-nums'>
              {currentAmount.toLocaleString()}원
            </span>
            <span className='tabular-nums text-muted-foreground'>
              목표 {targetAmount.toLocaleString()}원
            </span>
          </div>
          <div className='text-xs text-muted-foreground'>
            <span className='tabular-nums'>
              {progressPercentage.toFixed(1)}%
            </span>{' '}
            달성
          </div>
        </div>

        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Users className='h-4 w-4' />
            <span className='tabular-nums'>{backers}명</span>
          </div>
          <div className='flex items-center gap-1'>
            <Clock className='h-4 w-4' />
            <span
              className={`tabular-nums ${daysLeft <= 7 ? 'font-medium text-red-600' : ''}`}
            >
              {daysLeft}일 남음
            </span>
          </div>
        </div>

        <Button
          className='hover-scale transition-button w-full shadow-sm'
          variant='indigo'
          onClick={e => {
            e.stopPropagation();
            // Handle backing logic
          }}
        >
          후원하기
        </Button>
      </CardContent>
    </Card>
  );
};
