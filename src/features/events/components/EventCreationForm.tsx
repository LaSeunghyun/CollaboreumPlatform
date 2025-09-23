import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/shared/ui/Button';
import {
  EventCategoryOption,
  EventFormState,
} from '@/features/events/types/event';

interface EventCreationFormProps {
  formData: EventFormState;
  errors: Record<string, string>;
  categories: EventCategoryOption[];
  loading: boolean;
  loadingCategories: boolean;
  onInputChange: (
    field: keyof EventFormState,
    value: string | number | Date,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
}

export const EventCreationForm: React.FC<EventCreationFormProps> = ({
  formData,
  errors,
  categories,
  loading,
  loadingCategories,
  onInputChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className='mx-auto max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>새 이벤트 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className='space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium'>제목 *</label>
              <Input
                value={formData.title}
                onChange={e => onInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
                placeholder='이벤트 제목을 입력하세요'
              />
              {errors.title && (
                <p className='mt-1 text-sm text-red-500'>{errors.title}</p>
              )}
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>설명 *</label>
              <Textarea
                value={formData.description}
                onChange={e => onInputChange('description', e.target.value)}
                className={errors.description ? 'border-red-500' : ''}
                placeholder='이벤트에 대한 자세한 설명을 입력하세요'
                rows={4}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.description}
                </p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  카테고리 *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={value => onInputChange('category', value)}
                >
                  <SelectTrigger
                    className={`h-10 ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder='카테고리 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <SelectItem value='loading' disabled>
                        카테고리 로딩 중...
                      </SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className='mt-1 text-sm text-red-500'>{errors.category}</p>
                )}
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  최대 참가자 수 *
                </label>
                <Input
                  type='number'
                  value={formData.maxParticipants}
                  onChange={e => {
                    const parsedValue = parseInt(e.target.value, 10);
                    onInputChange(
                      'maxParticipants',
                      Number.isNaN(parsedValue) ? 0 : parsedValue,
                    );
                  }}
                  min={1}
                  className={errors.maxParticipants ? 'border-red-500' : ''}
                />
                {errors.maxParticipants && (
                  <p className='mt-1 text-sm text-red-500'>
                    {errors.maxParticipants}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>태그</label>
              <Input
                value={formData.tags}
                onChange={e => onInputChange('tags', e.target.value)}
                placeholder='태그를 쉼표로 구분하여 입력하세요 (예: 음악, 공연, 무료)'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>장소 *</label>
              <Input
                value={formData.location}
                onChange={e => onInputChange('location', e.target.value)}
                className={errors.location ? 'border-red-500' : ''}
                placeholder='이벤트 장소를 입력하세요'
              />
              {errors.location && (
                <p className='mt-1 text-sm text-red-500'>{errors.location}</p>
              )}
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  시작 날짜
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {format(formData.startDate, 'yyyy-MM-dd', { locale: ko })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={formData.startDate}
                      onSelect={date =>
                        date && onInputChange('startDate', date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium'>
                  종료 날짜
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {format(formData.endDate, 'yyyy-MM-dd', { locale: ko })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={formData.endDate}
                      onSelect={date => date && onInputChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='flex flex-col gap-2 md:flex-row'>
              <Button type='submit' disabled={loading} className='flex-1'>
                {loading ? '생성 중...' : '이벤트 생성'}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={onCancel}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
