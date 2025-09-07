import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle, Heart, Calendar, MapPin, Clock, Users } from "lucide-react";
import { communityAPI, categoryAPI } from "../services/api";
import { KOREAN_CATEGORIES, getCategoryColor } from "../constants/categories";
import { useAuth } from "../contexts/AuthContext";

interface CommunitySectionProps {
  onViewAllCommunity?: () => void;
  onPostClick?: (postId: string) => void;
  onCreatePost?: () => void;
  onNavigate?: (section: string) => void;
}

export function CommunitySection({ onViewAllCommunity, onPostClick, onCreatePost, onNavigate }: CommunitySectionProps) {
  const { isAuthenticated } = useAuth();
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]); // 초기값만 설정
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");

  // 숫자 포맷팅 함수
  const formatCount = (count: any): string => {
    if (count === null || count === undefined) return '0';
    if (typeof count === 'string') {
      const num = parseInt(count, 10);
      return isNaN(num) ? '0' : num.toString();
    }
    if (typeof count === 'number') {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return count.toString();
    }
    return '0';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const [postsResponse, eventsResponse, categoriesResponse] = await Promise.all([
            communityAPI.getForumPosts(selectedCategory === "전체" ? undefined : selectedCategory),
            communityAPI.getEvents(),
            communityAPI.getCategories()
          ]) as any[];



          if (postsResponse.success && postsResponse.data) {
            // 서버 응답 구조에 맞게 수정
            let posts = postsResponse.data || [];

            // 최신 순으로 정렬 (기본값)
            posts = posts.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

            setForumPosts(posts);
          } else {
            console.warn('Posts response structure:', postsResponse);
            setForumPosts([]);
          }

          if (eventsResponse.success && eventsResponse.data) {
            setUpcomingEvents(eventsResponse.data || []);
          } else {
            console.warn('Events response structure:', eventsResponse);
            setUpcomingEvents([]);
          }

          // 카테고리 설정 - API에서 동적으로 가져오기
          if (Array.isArray(categoriesResponse)) {
            const categoryLabels = categoriesResponse.map((cat: any) => cat.label || cat.name);
            setCategories(["전체", ...categoryLabels]);
          } else if (categoriesResponse?.success && Array.isArray((categoriesResponse as any).data)) {
            const categoryLabels = (categoriesResponse as any).data.map((cat: any) => cat.label || cat.name);
            setCategories(["전체", ...categoryLabels]);
          } else {
            console.warn('Categories response structure:', categoriesResponse);
            // API 실패 시 기본 카테고리 사용
            setCategories(KOREAN_CATEGORIES);
          }

        } catch (apiError) {
          console.error('API 호출 실패:', apiError);
          setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          // 더미 데이터로 기본 UI 표시
          setForumPosts([
            {
              id: '1',
              title: '샘플 게시글',
              content: '이것은 샘플 게시글입니다. 실제 데이터를 불러오려면 서버를 시작해주세요.',
              author: { name: '샘플 작성자' },
              category: '음악',
              likes: 10,
              replies: 3,
              views: 50,
              isHot: false,
              createdAt: new Date(),
              timeAgo: '방금 전'
            }
          ]);
          setUpcomingEvents([
            {
              id: '1',
              title: '샘플 이벤트',
              description: '이것은 샘플 이벤트입니다. 실제 데이터를 불러오려면 서버를 시작해주세요.',
              category: '음악',
              date: '2024년 12월 31일',
              time: '19:00',
              location: '서울',
              attendees: 0,
              price: '무료'
            }
          ]);
          // 기본 카테고리 설정
          setCategories(KOREAN_CATEGORIES);
          return;
        }

      } catch (error) {
        console.error('Failed to fetch community data:', error);
        setError('커뮤니티 데이터를 불러오는데 실패했습니다.');
        setForumPosts([]);
        setUpcomingEvents([]);
        // 기본 카테고리 설정
        setCategories(KOREAN_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  const handlePostClick = (postId: string) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewAllCommunity = () => {
    if (onViewAllCommunity) {
      onViewAllCommunity();
    }
  };

  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">커뮤니티 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

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
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleViewAllCommunity}>
                  전체 보기
                </Button>
                <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700">
                  새 글 작성하기
                </Button>
              </div>
            </div>



            <div className="space-y-4">
              {forumPosts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-3">아직 게시글이 없습니다.</p>
                  <p className="text-sm text-gray-400">첫 번째 게시글을 작성해보세요!</p>
                </div>
              ) : (
                forumPosts.map((post, index) => (
                  <Card key={post.id || `post-${index}`} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePostClick(post.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getCategoryColor(post.category)}
                          >
                            {post.category}
                          </Badge>
                          {post.isHot && (
                            <Badge className="bg-red-100 text-red-800">HOT</Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{post.timeAgo}</span>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {post.title}
                      </h4>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>by {post.author}</span>
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

            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">커뮤니티에 참여해보세요!</p>
              <p className="text-sm text-gray-400">위의 '새 글 작성하기' 버튼을 클릭하여 글을 작성해보세요!</p>
            </div>
          </div>

          {/* Events Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">다가오는 이벤트</h3>
              <Button variant="outline" onClick={() => onNavigate?.('events')}>전체 일정</Button>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <Card key={event.id || `event-${index}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        className={getCategoryColor(event.category)}
                      >
                        {event.category}
                      </Badge>
                      <span className="text-lg font-bold text-primary">{event.price}</span>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-3 line-clamp-1">
                      {event.title}
                    </h4>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{event.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees}명 참석 예정</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button size="sm" className="w-full min-h-[44px]" onClick={() => onNavigate?.('events')}>
                        참석하기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}