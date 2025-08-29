import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle, Heart, Calendar, MapPin, Clock, Users } from "lucide-react";
import { communityAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface CommunitySectionProps {
  onViewAllCommunity?: () => void;
  onPostClick?: (postId: string) => void;
  onCreatePost?: () => void;
}

export function CommunitySection({ onViewAllCommunity, onPostClick, onCreatePost }: CommunitySectionProps) {
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

          console.log('Posts response:', postsResponse);
          console.log('Events response:', eventsResponse);
          console.log('Categories response:', categoriesResponse);

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
          } else if (categoriesResponse?.success && Array.isArray(categoriesResponse.data)) {
            const categoryLabels = categoriesResponse.data.map((cat: any) => cat.label || cat.name);
            setCategories(["전체", ...categoryLabels]);
          } else {
            console.warn('Categories response structure:', categoriesResponse);
            // API 실패 시 기본 카테고리 사용
            setCategories(["전체", "음악", "미술", "문학", "공연", "사진", "기타"]);
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
          setCategories(["전체", "음악", "미술", "문학", "공연", "사진", "기타"]);
          return;
        }

      } catch (error) {
        console.error('Failed to fetch community data:', error);
        setError('커뮤니티 데이터를 불러오는데 실패했습니다.');
        setForumPosts([]);
        setUpcomingEvents([]);
        // 기본 카테고리 설정
        setCategories(["전체", "음악", "미술", "문학", "공연", "사진", "기타"]);
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
    <section id="community" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">커뮤니티 & 이벤트</h2>
          <p className="text-xl text-gray-600">아티스트와 팬들이 함께 소통하는 공간</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Forum Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">커뮤니티 포럼</h3>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <Button onClick={handleCreatePost}>새 글 작성하기</Button>
                )}
                <Button variant="outline" onClick={handleViewAllCommunity}>
                  전체 보기
                </Button>
              </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category, index) => (
                <button
                  key={category || `category-${index}`}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {forumPosts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-3">아직 게시글이 없습니다.</p>
                  <p className="text-sm text-gray-400">첫 번째 게시글을 작성해보세요!</p>
                </div>
              ) : (
                forumPosts.map((post, index) => (
                  <Card
                    key={post.id || `post-${index}`}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              post.category === "음악" ? "bg-blue-100 text-blue-800" :
                                post.category === "미술" ? "bg-purple-100 text-purple-800" :
                                  post.category === "문학" ? "bg-green-100 text-green-800" :
                                    post.category === "공연" ? "bg-orange-100 text-orange-800" :
                                      post.category === "사진" ? "bg-pink-100 text-pink-800" :
                                        "bg-gray-100 text-gray-800"
                            }
                          >
                            {post.category || '기타'}
                          </Badge>
                          {post.isHot && (
                            <Badge className="bg-red-100 text-red-800">HOT</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{post.timeAgo}</div>
                          {post.createdAt && (
                            <div className="text-xs text-gray-400">
                              {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {post.title || '제목 없음'}
                      </h4>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span className="font-medium text-gray-700">
                          by {post.author?.name || post.author?.username || '알 수 없음'}
                        </span>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-medium">
                              {formatCount(post.replies || post.commentCount || post.replyCount || 0)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-medium">
                              {formatCount(post.likes || post.likeCount || post.favorites || 0)}
                            </span>
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
          <div className="space-y-8">
            {/* 이벤트 헤더 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h3 className="text-3xl font-bold text-gray-900">다가오는 이벤트</h3>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
              >
                전체 일정
              </Button>
            </div>

            {/* 이벤트 목록 */}
            <div className="space-y-6">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg text-gray-600 mb-2">예정된 이벤트가 없습니다</p>
                  <p className="text-sm text-gray-400">새로운 이벤트를 기다려보세요!</p>
                </div>
              ) : (
                upcomingEvents.map((event, index) => (
                  <Card
                    key={event.id || `event-${index}`}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white shadow-sm hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      {/* 이벤트 헤더 */}
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          className={`px-3 py-1 text-xs font-medium rounded-full ${event.category === "음악" ? "bg-blue-100 text-blue-800" :
                            event.category === "미술" ? "bg-purple-100 text-purple-800" :
                              event.category === "문학" ? "bg-green-100 text-green-800" :
                                event.category === "공연" ? "bg-orange-100 text-orange-800" :
                                  event.category === "사진" ? "bg-pink-100 text-pink-800" :
                                    "bg-green-100 text-green-800"
                            }`}
                        >
                          {event.category || '기타'}
                        </Badge>
                        <span className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {event.price || '무료'}
                        </span>
                      </div>

                      {/* 이벤트 제목 */}
                      <h4 className="font-semibold text-lg text-gray-900 mb-4 line-clamp-2 leading-tight">
                        {event.title || '제목 없음'}
                      </h4>

                      {/* 이벤트 상세 정보 */}
                      <div className="space-y-3 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">{event.date || '날짜 미정'}</span>
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">{event.time || '시간 미정'}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-700">{event.location || '장소 미정'}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-orange-600" />
                          </div>
                          <span className="font-medium text-gray-700">{event.attendees || 0}명 참석 예정</span>
                        </div>
                      </div>

                      {/* 참석 버튼 */}
                      <div className="pt-4 border-t border-gray-100">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                          onClick={() => {
                            alert(`"${event.title}" 이벤트에 참석 신청했습니다!`);
                          }}
                        >
                          참석하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* 이벤트 안내 메시지 */}
            <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-200 text-center">
              <p className="text-purple-800 text-lg font-medium mb-2">이벤트에 참여해보세요!</p>
              <p className="text-purple-600 text-sm">다양한 아티스트의 이벤트에 참여하여 특별한 경험을 만들어보세요!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}