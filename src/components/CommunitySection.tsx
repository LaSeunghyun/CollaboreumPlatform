import { Card, CardContent } from "../shared/ui/Card";
import { Badge } from "../shared/ui/Badge";
import { Button } from "../shared/ui/Button";
import { MessageCircle, Heart, Calendar, MapPin, Clock, Users } from "lucide-react";
import { useCommunityPosts } from "../lib/api/useCommunityPosts";
import { useUpcomingEvents } from "../lib/api/useEvents";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CommunitySectionProps {
  onViewAllCommunity?: () => void;
}

export function CommunitySection({ onViewAllCommunity }: CommunitySectionProps) {
  // 커뮤니티 포럼 데이터 조회
  const {
    data: forumData,
    isLoading: isForumLoading,
    error: forumError
  } = useCommunityPosts({ limit: 3, sortBy: 'likes', order: 'desc' });

  // 다가오는 이벤트 데이터 조회
  const {
    data: eventsData,
    isLoading: isEventsLoading,
    error: eventsError
  } = useUpcomingEvents(3);

  // 로딩 상태
  if (isForumLoading || isEventsLoading) {
    return (
      <section id="community" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 & 이벤트</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 에러 상태
  if (forumError || eventsError) {
    return (
      <section id="community" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 & 이벤트</h2>
          </div>
          <div className="text-center text-red-600">
            <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </div>
      </section>
    );
  }

  const forumPosts = forumData?.posts || [];
  const upcomingEvents = (eventsData as any)?.data || [];

  return (
    <section id="community" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 & 이벤트</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Forum Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">커뮤니티 포럼</h3>
              <Button variant="outline" onClick={onViewAllCommunity}>
                전체 보기
              </Button>
            </div>

            <div className="space-y-4">
              {forumPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">아직 게시글이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                forumPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              post.category === "음악" ? "bg-blue-100 text-blue-800" :
                                post.category === "미술" ? "bg-purple-100 text-purple-800" :
                                  "bg-green-100 text-green-800"
                            }
                          >
                            {post.category}
                          </Badge>
                          {post.isHot && (
                            <Badge className="bg-red-100 text-red-800">HOT</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: ko
                          })}
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {post.title}
                      </h4>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>by {post.author.name}</span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.replies}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Events Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">다가오는 이벤트</h3>
              <Button variant="outline">전체 일정</Button>
            </div>

            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">예정된 이벤트가 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                upcomingEvents.map((event: any) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge
                          className={
                            event.category === "음악" ? "bg-blue-100 text-blue-800" :
                              event.category === "미술" ? "bg-purple-100 text-purple-800" :
                                "bg-green-100 text-green-800"
                          }
                        >
                          {event.category}
                        </Badge>
                        <span className="text-lg font-bold text-primary">
                          {event.tickets?.[0]?.price ? `₩${event.tickets[0].price.toLocaleString()}` : '무료'}
                        </span>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-3 line-clamp-1">
                        {event.title}
                      </h4>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.startDate).toLocaleDateString('ko-KR')}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span>{event.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.currentAttendees}명 참석 예정</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button size="sm" className="w-full">
                          참석하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}