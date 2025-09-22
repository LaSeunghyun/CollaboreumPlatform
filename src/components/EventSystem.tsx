import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from '../shared/ui/Button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { eventManagementAPI } from '../services/api/events';
import { useAuth } from '../contexts/AuthContext';
import { dynamicConstantsService } from '../services/constantsService';
import {
  CalendarIcon,
  Users,
  MapPin,
  Search,
  UserPlus,
  Eye,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// Types
interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  location: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  organizer: {
    id: string;
    username: string;
    role: string;
  };
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Participant {
  id: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  role: string;
  joinedAt: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Event Creation Form Component
export const EventCreationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    maxParticipants: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const enums = await dynamicConstantsService.getEnums();
        const eventCategories = Object.entries(
          enums.EVENT_CATEGORIES || {},
        ).map(([key, value]) => ({
          id: key,
          label: value,
        }));
        setCategories(eventCategories);
      } catch (error) {
        console.error('카테고리를 가져오는 중 오류 발생:', error);
        // API 실패 시 빈 배열로 설정 (하드코딩된 데이터 사용 금지)
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }
    if (!formData.location.trim()) {
      newErrors.location = '장소를 입력해주세요';
    }
    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const eventData = {
        ...formData,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        organizer: user,
      };

      await eventManagementAPI.createEvent(eventData);

      // 폼 초기화
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        location: '',
        startDate: new Date(),
        endDate: new Date(),
        maxParticipants: 10,
      });

      alert('이벤트가 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('이벤트 생성 중 오류 발생:', error);
      alert('이벤트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-2xl'>
      <Card>
        <CardHeader>
          <CardTitle>새 이벤트 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='mb-2 block text-sm font-medium'>제목 *</label>
              <Input
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
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
                onChange={e => handleInputChange('description', e.target.value)}
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

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-2 block text-sm font-medium'>
                  카테고리 *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={value => handleInputChange('category', value)}
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
                  onChange={e =>
                    handleInputChange(
                      'maxParticipants',
                      parseInt(e.target.value),
                    )
                  }
                  min='1'
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
                onChange={e => handleInputChange('tags', e.target.value)}
                placeholder='태그를 쉼표로 구분하여 입력하세요 (예: 음악, 공연, 무료)'
              />
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>장소 *</label>
              <Input
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                className={errors.location ? 'border-red-500' : ''}
                placeholder='이벤트 장소를 입력하세요'
              />
              {errors.location && (
                <p className='mt-1 text-sm text-red-500'>{errors.location}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
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
                        date && handleInputChange('startDate', date)
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
                      onSelect={date =>
                        date && handleInputChange('endDate', date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='flex gap-4'>
              <Button type='submit' disabled={loading} className='flex-1'>
                {loading ? '생성 중...' : '이벤트 생성'}
              </Button>
              <Button type='button' variant='outline' className='flex-1'>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Event List Component
const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<
    Array<{ id: string; label: string }>
  >([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await eventManagementAPI.getEvents();
        setEvents(eventsData as Event[]);
      } catch (error) {
        console.error('이벤트를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const enums = await dynamicConstantsService.getEnums();
        const eventCategories = Object.entries(
          enums.EVENT_CATEGORIES || {},
        ).map(([key, value]) => ({
          id: key,
          label: value,
        }));
        setCategories([{ id: 'all', label: '전체' }, ...eventCategories]);
      } catch (error) {
        console.error('카테고리를 가져오는 중 오류 발생:', error);
        setCategories([
          { id: 'all', label: '전체' },
          { id: 'festival', label: '축제' },
          { id: 'performance', label: '공연' },
          { id: 'competition', label: '경연' },
          { id: 'workshop', label: '워크샵' },
          { id: 'seminar', label: '세미나' },
          { id: 'other', label: '기타' },
        ]);
      }
    };

    fetchEvents();
    fetchCategories();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* 검색 및 필터 */}
      <div className='flex gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='이벤트 검색...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className='w-48'>
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

      {/* 이벤트 목록 */}
      <div className='grid gap-4'>
        {filteredEvents.map(event => (
          <Card key={event.id}>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <h3 className='text-lg font-semibold'>{event.title}</h3>
                    <Badge variant='outline'>{event.category}</Badge>
                  </div>
                  <p className='mb-4 text-gray-600'>{event.description}</p>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
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

      {filteredEvents.length === 0 && (
        <div className='py-8 text-center'>
          <p className='text-gray-500'>등록된 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

// My Events List Component
const MyEventsList: React.FC = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const events = await eventManagementAPI.getEvents();
        setMyEvents(events as Event[]);
      } catch (error) {
        console.error('내 이벤트를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyEvents();
    }
  }, [user]);

  if (loading) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>이벤트를 불러오는 중...</p>
      </div>
    );
  }

  if (myEvents.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-gray-500'>참가한 이벤트가 없습니다.</p>
        <Button className='mt-4' onClick={() => window.location.reload()}>
          이벤트 목록 보기
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {myEvents.map(event => (
        <Card key={event.id}>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='mb-2 text-lg font-semibold'>{event.title}</h3>
                <p className='mb-4 text-gray-600'>{event.description}</p>
                <div className='flex items-center gap-4 text-sm text-gray-500'>
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

// Main Event System Component
const EventSystem: React.FC = () => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold'>이벤트 관리</h1>
        <p className='text-gray-600'>다양한 이벤트를 생성하고 참가하세요</p>
      </div>

      <Tabs defaultValue='list' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='list'>이벤트 목록</TabsTrigger>
          <TabsTrigger value='create'>이벤트 생성</TabsTrigger>
          <TabsTrigger value='my-events'>내 이벤트</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='mt-6'>
          <EventList />
        </TabsContent>

        <TabsContent value='create' className='mt-6'>
          <EventCreationForm />
        </TabsContent>

        <TabsContent value='my-events' className='mt-6'>
          <MyEventsList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventSystem;
