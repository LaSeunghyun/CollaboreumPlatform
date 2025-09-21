import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { ImageWithFallback } from '../atoms/ImageWithFallback';

interface EventCardProps {
  id: string;
  title: string;
  type: 'campaign' | 'collaboration' | 'promotion';
  image: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: string;
  participants?: number;
  maxParticipants?: number;
  status: 'upcoming' | 'ongoing' | 'ended';
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  type,
  image,
  description,
  startDate,
  endDate,
  location,
  participants,
  maxParticipants,
  status,
  onClick,
}) => {
  const getTypeLabel = () => {
    switch (type) {
      case 'campaign':
        return '특별 캠페인';
      case 'collaboration':
        return '콜라보 이벤트';
      case 'promotion':
        return '프로모션';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'ended':
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'upcoming':
        return '진행 예정';
      case 'ongoing':
        return '진행 중';
      case 'ended':
        return '종료';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      className='group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg'
      onClick={onClick}
    >
      <div className='relative aspect-[16/9] overflow-hidden'>
        <ImageWithFallback
          src={image}
          alt={title}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute left-3 top-3'>
          <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
        </div>
      </div>

      <CardContent className='space-y-3 p-4'>
        <div className='space-y-2'>
          <Badge variant='secondary' className='bg-sky/10 text-sky'>
            {getTypeLabel()}
          </Badge>
          <h3 className='line-clamp-2 font-medium'>{title}</h3>
          <p className='line-clamp-2 text-sm text-muted-foreground'>
            {description}
          </p>
        </div>

        <div className='space-y-2 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            <span>
              {formatDate(startDate)}
              {endDate && ` - ${formatDate(endDate)}`}
            </span>
          </div>

          {location && (
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4' />
              <span>{location}</span>
            </div>
          )}

          {participants !== undefined && (
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              <span>
                {participants}명 참여
                {maxParticipants && ` / ${maxParticipants}명`}
              </span>
            </div>
          )}
        </div>

        {status === 'ongoing' && (
          <Button className='hover:bg-sky/90 w-full bg-sky'>참여하기</Button>
        )}

        {status === 'upcoming' && (
          <Button variant='outline' className='w-full'>
            <Clock className='mr-2 h-4 w-4' />
            알림 받기
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
