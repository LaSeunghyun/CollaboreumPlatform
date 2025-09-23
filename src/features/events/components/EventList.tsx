import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Eye, MapPin, Search, UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/Button';
import { Event, EventCategoryOption } from '@/features/events/types/event';

interface EventListProps {
  events: Event[];
  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: EventCategoryOption[];
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  if (loading) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='이벤트 검색...'
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className='w-full md:w-48'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-4'>
        {events.map(event => (
          <Card key={event.id}>
            <CardContent className='p-6'>
              <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='text-lg font-semibold'>{event.title}</h3>
                    <Badge variant='outline'>{event.category}</Badge>
                  </div>
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
                        {event.participants.length}/{event.maxParticipants}
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
                    <UserPlus className='mr-2 h-4 w-4' />
                    참가
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className='py-8 text-center'>
          <p className='text-gray-500'>등록된 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
};
