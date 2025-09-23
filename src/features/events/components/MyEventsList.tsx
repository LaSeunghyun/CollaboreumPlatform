import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Edit, Eye, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/shared/ui/Button';
import { Event } from '@/features/events/types/event';

interface MyEventsListProps {
  events: Event[];
  loading: boolean;
  onRefresh: () => void;
}

export const MyEventsList: React.FC<MyEventsListProps> = ({
  events,
  loading,
  onRefresh,
}) => {
  if (loading) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>참가한 이벤트가 없습니다.</p>
        <Button className='mt-4' onClick={onRefresh}>
          이벤트 목록 보기
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {events.map(event => (
        <Card key={event.id}>
          <CardContent className='p-6'>
            <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
              <div className='flex-1'>
                <h3 className='mb-2 text-lg font-semibold'>{event.title}</h3>
                <p className='mb-4 text-gray-600'>{event.description}</p>
                <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                  <div className='flex items-center gap-1'>
                    <CalendarIcon className='h-4 w-4' />
                    <span>
                      {format(event.startDate, 'yyyy-MM-dd HH:mm', {
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <MapPin className='h-4 w-4' />
                    <span>{event.location}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='h-4 w-4' />
                    <span>
                      {event.currentParticipants}/{event.maxParticipants}
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm'>
                  <Eye className='mr-2 h-4 w-4' />
                  보기
                </Button>
                <Button size='sm'>
                  <Edit className='mr-2 h-4 w-4' />
                  수정
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
