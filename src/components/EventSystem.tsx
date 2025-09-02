import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { eventManagementAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, Users, MapPin, Clock, Tag, Search, Filter, Plus, UserPlus, UserMinus } from 'lucide-react';
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
    maxParticipants: 50,
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = '종료일은 시작일보다 늦어야 합니다';
    }
    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // API 호출하여 이벤트 생성
      try {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          alert('이벤트가 성공적으로 생성되었습니다.');
          setFormData({
            title: '',
            description: '',
            category: '',
            tags: '',
            startDate: new Date(),
            endDate: new Date(),
            location: '',
            maxParticipants: 0,
            image: ''
          });
        } else {
          const errorData = await response.json();
          alert(`이벤트 생성 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      } catch (error) {
        console.error('이벤트 생성 실패:', error);
        alert('이벤트 생성 중 오류가 발생했습니다.');
      }
      console.log('이벤트 생성:', formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          새 이벤트 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이벤트 제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="이벤트 제목을 입력하세요"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명 *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="이벤트에 대한 상세 설명을 입력하세요"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">카테고리 *</label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">음악</SelectItem>
                  <SelectItem value="art">예술</SelectItem>
                  <SelectItem value="technology">기술</SelectItem>
                  <SelectItem value="culture">문화</SelectItem>
                  <SelectItem value="sports">스포츠</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">최대 참가자 수 *</label>
              <Input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                min="1"
                className={errors.maxParticipants ? 'border-red-500' : ''}
              />
              {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">태그</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="태그를 쉼표로 구분하여 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">장소 *</label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="이벤트 장소를 입력하세요"
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">시작일 *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && handleInputChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">종료일 *</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : '날짜 선택'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && handleInputChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">이미지 URL</label>
            <Input
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="이벤트 이미지 URL을 입력하세요"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              이벤트 생성
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Event List Component
export const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
          setFilteredEvents(data.data || []);
        } else {
          console.error('이벤트 목록 조회 실패');
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (error) {
        console.error('이벤트 목록 조회 실패:', error);
        setEvents([]);
        setFilteredEvents([]);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (selectedStatus) {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory, selectedStatus]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { label: '예정', variant: 'default' as const },
      ongoing: { label: '진행중', variant: 'secondary' as const },
      completed: { label: '완료', variant: 'outline' as const },
      cancelled: { label: '취소', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      music: '음악',
      art: '예술',
      technology: '기술',
      culture: '문화',
      sports: '스포츠',
      other: '기타'
    };
    return categoryLabels[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="이벤트 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="music">음악</SelectItem>
              <SelectItem value="art">예술</SelectItem>
              <SelectItem value="technology">기술</SelectItem>
              <SelectItem value="culture">문화</SelectItem>
              <SelectItem value="sports">스포츠</SelectItem>
              <SelectItem value="other">기타</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              <SelectItem value="upcoming">예정</SelectItem>
              <SelectItem value="ongoing">진행중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="cancelled">취소</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="grid gap-4">
        {filteredEvents.map(event => (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {event.image && (
                  <div className="w-full lg:w-48 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-lg" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <p className="text-gray-600 mt-1">{event.description}</p>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{getCategoryLabel(event.category)}</Badge>
                    {event.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {format(event.startDate, 'MM/dd', { locale: ko })} - {format(event.endDate, 'MM/dd', { locale: ko })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.currentParticipants}/{event.maxParticipants}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-500">
                      주최: {event.organizer.username}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                      <Button size="sm">
                        참가하기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

// Event Detail Component
export const EventDetail: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 이벤트 상세 정보 조회
        const eventResponse = await eventManagementAPI.getEventById(eventId);
        const eventData = (eventResponse as any)?.data || eventResponse;
        setEvent(eventData);

        // 이벤트 참가자 목록 조회
        const participantsResponse = await eventManagementAPI.getEventParticipants(eventId);
        const participantsData = (participantsResponse as any)?.data || participantsResponse;
        setParticipants(participantsData);

        // 현재 사용자가 참가자인지 확인
        if (user?.id) {
          const isUserJoined = participantsData.some((p: any) => p.id === user.id);
          setIsJoined(isUserJoined);

          // 현재 사용자가 주최자인지 확인
          setIsOrganizer(eventData.organizer.id === user.id);
        }

      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, user?.id]);

  const handleJoinEvent = async () => {
    if (!user?.id) return;

    try {
      await eventManagementAPI.joinEvent(eventId);
      setIsJoined(true);

      // 참가자 목록 새로고침
      const updatedParticipantsResponse = await eventManagementAPI.getEventParticipants(eventId);
      const updatedParticipants = (updatedParticipantsResponse as any)?.data || updatedParticipantsResponse;
      setParticipants(updatedParticipants);

    } catch (err) {
      console.error('이벤트 참가 실패:', err);
      setError('이벤트 참가에 실패했습니다.');
    }
  };

  const handleLeaveEvent = async () => {
    if (!user?.id) return;

    try {
      await eventManagementAPI.leaveEvent(eventId);
      setIsJoined(false);

      // 참가자 목록 새로고침
      const updatedParticipantsResponse = await eventManagementAPI.getEventParticipants(eventId);
      const updatedParticipants = (updatedParticipantsResponse as any)?.data || updatedParticipantsResponse;
      setParticipants(updatedParticipants);

    } catch (err) {
      console.error('이벤트 참가 취소 실패:', err);
      setError('이벤트 참가 취소에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-gray-600">이벤트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 이벤트 헤더 */}
      <div className="relative">
        {event.image && (
          <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          {getStatusBadge(event.status)}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">{getCategoryLabel(event.category)}</Badge>
              {event.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">이벤트 소개</h2>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">장소</p>
                <p className="text-gray-600">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">일정</p>
                <p className="text-gray-600">
                  {format(event.startDate, 'PPP', { locale: ko })} - {format(event.endDate, 'PPP', { locale: ko })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">참가자</p>
                <p className="text-gray-600">{event.currentParticipants}/{event.maxParticipants}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">생성일</p>
                <p className="text-gray-600">{format(event.createdAt, 'PPP', { locale: ko })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>참가하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {event.currentParticipants}/{event.maxParticipants}
                </div>
                <p className="text-sm text-gray-600">참가자</p>
              </div>

              {event.status === 'upcoming' && (
                <div>
                  {isJoined ? (
                    <Button onClick={handleLeaveEvent} variant="outline" className="w-full">
                      참가 취소
                    </Button>
                  ) : (
                    <Button onClick={handleJoinEvent} className="w-full">
                      참가하기
                    </Button>
                  )}
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>• 무료 이벤트입니다</p>
                <p>• 참가 신청 후 승인을 기다려주세요</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>주최자</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {event.organizer.username.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{event.organizer.username}</p>
                  <p className="text-sm text-gray-600">{event.organizer.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 참가자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>참가자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">
                      {participant.username.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{participant.username}</p>
                    <p className="text-sm text-gray-600">{participant.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={participant.status === 'confirmed' ? 'default' : 'secondary'}>
                    {participant.status === 'confirmed' ? '확정' : '대기중'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {format(participant.joinedAt, 'MM/dd', { locale: ko })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for status badge
const getStatusBadge = (status: string) => {
  const statusConfig = {
    upcoming: { label: '예정', variant: 'default' as const },
    ongoing: { label: '진행중', variant: 'secondary' as const },
    completed: { label: '완료', variant: 'outline' as const },
    cancelled: { label: '취소', variant: 'destructive' as const }
  };

  const config = statusConfig[status as keyof typeof statusConfig];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

// Helper function for category label
const getCategoryLabel = (category: string) => {
  const categoryLabels: Record<string, string> = {
    music: '음악',
    art: '예술',
    technology: '기술',
    culture: '문화',
    sports: '스포츠',
    other: '기타'
  };
  return categoryLabels[category] || category;
};

// Main Event System Component
export const EventSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">이벤트 시스템</h1>
        <p className="text-gray-600">다양한 이벤트를 탐색하고 참여해보세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">이벤트 목록</TabsTrigger>
          <TabsTrigger value="create">이벤트 생성</TabsTrigger>
          <TabsTrigger value="my-events">내 이벤트</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <EventList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <EventCreationForm />
        </TabsContent>

        <TabsContent value="my-events" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">내 이벤트 기능은 곧 추가될 예정입니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventSystem;
