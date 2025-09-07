import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MapPin, Clock, Users, Star, Heart, Share2, Bookmark } from 'lucide-react';
import { ImageWithFallback } from './atoms/ImageWithFallback';
import { eventManagementAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EventDetailProps {
  eventId: string;
  onBack: () => void;
}

export function EventDetail({ eventId, onBack }: EventDetailProps) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventManagementAPI.getEvent(eventId) as any;

        if (response.success && response.data) {
          setEvent(response.data);
          // 사용자가 이미 참가하고 있는지 확인
          if (isAuthenticated && user) {
            const isParticipant = response.data.participants?.some(
              (p: any) => p.id === user.id
            );
            setIsParticipating(isParticipant);
          }
        } else {
          setError('이벤트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('이벤트 로드 실패:', error);
        setError('이벤트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, isAuthenticated, user]);

  const handleParticipate = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const response = await eventManagementAPI.joinEvent(eventId) as any;

      if (response.success) {
        setIsParticipating(true);
        // 이벤트 정보 새로고침
        const updatedResponse = await eventManagementAPI.getEvent(eventId) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setEvent(updatedResponse.data);
        }
        alert('이벤트 참가 신청이 완료되었습니다!');
      }
    } catch (error) {
      console.error('참가 신청 실패:', error);
      alert('참가 신청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelParticipation = async () => {
    try {
      const response = await eventManagementAPI.leaveEvent(eventId) as any;

      if (response.success) {
        setIsParticipating(false);
        // 이벤트 정보 새로고침
        const updatedResponse = await eventManagementAPI.getEvent(eventId) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setEvent(updatedResponse.data);
        }
        alert('참가 신청이 취소되었습니다.');
      }
    } catch (error) {
      console.error('참가 취소 실패:', error);
      alert('참가 취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleLike = async () => {
    try {
      const response = await eventManagementAPI.likeEvent(eventId) as any;
      if (response.success) {
        setIsLiked(!isLiked);
        // 이벤트 정보 새로고침
        const updatedResponse = await eventManagementAPI.getEvent(eventId) as any;
        if (updatedResponse.success && updatedResponse.data) {
          setEvent(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await eventManagementAPI.bookmarkEvent(eventId) as any;
      if (response.success) {
        setIsBookmarked(!isBookmarked);
        // 이벤트 정보 새로고침
        const updatedResponse = await eventManagementAPI.getEvent(eventId) as any;
        if (updatedResponse.data) {
          setEvent(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error('북마크 처리 실패:', error);
      alert('북마크 처리에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 클립보드에 복사되었습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'upcoming': 'bg-blue-100 text-blue-800',
      'ongoing': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const textMap: { [key: string]: string } = {
      'upcoming': '예정',
      'ongoing': '진행중',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return textMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">이벤트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          ← 이벤트 목록으로
        </Button>

        {/* Event Header */}
        <Card className="mb-8">
          <div className="relative aspect-video">
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <Badge className={`absolute top-4 left-4 ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </Badge>
            <Badge className="absolute top-4 right-4 bg-purple-100 text-purple-800">
              {event.category}
            </Badge>
          </div>

          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={event.organizer.avatar} alt={event.organizer.username} />
                    <AvatarFallback>{event.organizer.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">주최자: {event.organizer.username}</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-6">{event.description}</p>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">일시</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('ko-KR')} ~ {new Date(event.endDate).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">시간</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ~ {new Date(event.endDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">장소</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">참가자</p>
                  <p className="text-sm text-gray-600">{event.currentParticipants}/{event.maxParticipants}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isParticipating ? (
                <Button variant="outline" size="lg" onClick={handleCancelParticipation}>
                  참가 취소
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleParticipate}
                  disabled={event.currentParticipants >= event.maxParticipants || event.status !== 'upcoming'}
                >
                  {event.currentParticipants >= event.maxParticipants ? '정원 마감' : '이벤트 참가하기'}
                </Button>
              )}
              <Button variant="outline" size="lg">
                주최자에게 문의
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Details Tabs */}
        <Tabs defaultValue="details" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">상세정보</TabsTrigger>
            <TabsTrigger value="participants">참가자</TabsTrigger>
            <TabsTrigger value="schedule">일정</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-4">이벤트 상세정보</h3>
                  <div dangerouslySetInnerHTML={{ __html: event.details || event.description }} />

                  {event.tags && event.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">태그</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">참가자 목록</h3>
                <div className="space-y-3">
                  {event.participants?.map((participant: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} alt={participant.username} />
                          <AvatarFallback>{participant.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{participant.username}</p>
                          <p className="text-xs text-gray-500">{participant.role}</p>
                        </div>
                      </div>
                      <Badge variant={participant.status === 'confirmed' ? 'default' : 'secondary'}>
                        {participant.status === 'confirmed' ? '확정' : '대기중'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">이벤트 일정</h3>
                <div className="space-y-4">
                  {event.schedule?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-3 border rounded-lg">
                      <div className="text-center min-w-[80px]">
                        <p className="font-medium text-sm">{item.time}</p>
                        <p className="text-xs text-gray-500">{item.duration}</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{item.title}</h5>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">댓글</h3>
                <div className="space-y-4">
                  {event.comments?.map((comment: any, index: number) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
                        <AvatarFallback>{comment.author.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author.username}</span>
                          <span className="text-xs text-gray-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
