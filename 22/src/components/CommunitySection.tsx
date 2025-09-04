import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MessageCircle, Heart, Calendar, MapPin, Clock, Users } from "lucide-react";

const forumPosts = [
  {
    id: 1,
    title: "인디음악 페스티벌 추천해주세요!",
    author: "음악러버",
    category: "음악",
    replies: 23,
    likes: 45,
    timeAgo: "2시간 전",
    isHot: true
  },
  {
    id: 2,
    title: "젊은 작가들의 현대미술 트렌드",
    author: "아트크리틱",
    category: "미술",
    replies: 12,
    likes: 28,
    timeAgo: "4시간 전",
    isHot: false
  },
  {
    id: 3,
    title: "독립 출판의 새로운 방향성에 대해",
    author: "북워커",
    category: "문학",
    replies: 8,
    likes: 19,
    timeAgo: "6시간 전",
    isHot: false
  }
];

const upcomingEvents = [
  {
    id: 1,
    title: "홍대 인디밴드 합동공연",
    date: "2025-08-15",
    time: "19:00",
    location: "홍대 클럽 에반스",
    attendees: 89,
    category: "음악",
    price: "₩15,000"
  },
  {
    id: 2,
    title: "신진작가 그룹전 '새로운 시선'",
    date: "2025-08-18",
    time: "14:00",
    location: "서울시립미술관",
    attendees: 156,
    category: "미술",
    price: "무료"
  },
  {
    id: 3,
    title: "독립서점 작가와의 만남",
    date: "2025-08-22",
    time: "16:00",
    location: "북카페 문학동네",
    attendees: 34,
    category: "문학",
    price: "₩10,000"
  }
];

interface CommunitySectionProps {
  onViewAllCommunity?: () => void;
}

export function CommunitySection({ onViewAllCommunity }: CommunitySectionProps) {
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
              {forumPosts.map((post) => (
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
              ))}
            </div>


          </div>

          {/* Events Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">다가오는 이벤트</h3>
              <Button variant="outline">전체 일정</Button>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((event) => (
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
                      <Button size="sm" className="w-full">
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