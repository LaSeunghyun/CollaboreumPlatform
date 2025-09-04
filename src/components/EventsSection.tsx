import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Calendar, MapPin, Clock, Users, Filter, Search } from "lucide-react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { communityAPI, categoryAPI } from '../services/api';
import { getCategoryBadgeColor, KOREAN_CATEGORIES } from '../constants/categories';

export function EventsSection() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(KOREAN_CATEGORIES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 카테고리 데이터 가져오기
        try {
          const categoriesResponse = await categoryAPI.getAllCategories() as any;
          if (categoriesResponse.success) {
            const categoryLabels = ["전체", ...categoriesResponse.data.map((cat: any) => cat.label || cat.name)];
            setCategories(categoryLabels);
          } else {
            setCategories(KOREAN_CATEGORIES);
          }
        } catch (categoryError) {
          console.warn("Failed to fetch categories:", categoryError);
          setCategories(KOREAN_CATEGORIES);
        }

        // 이벤트 데이터 가져오기
        try {
          const response = await communityAPI.getEvents() as any;
          if (response.success && response.data?.events) {
            setEvents(response.data.events);
          }
        } catch (apiError) {
          console.error('API 호출 실패:', apiError);
          setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          setEvents([]);
          return;
        }

      } catch (error) {
        console.error('Failed to fetch events:', error);
        setError('이벤트 데이터를 불러오는데 실패했습니다.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">이벤트 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">다가오는 이벤트</h2>
          <p className="text-xl text-gray-600">독립 예술계의 모든 이벤트를 한눈에 확인하세요</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="이벤트명, 장소, 주최자 검색..."
                className="pl-10"
              />
            </div>
          </div>
          <Select>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category === "전체" ? "all" : category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="md:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            필터
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge
                  className={`absolute top-3 left-3 ${getCategoryBadgeColor(event.category)}`}
                >
                  {event.category}
                </Badge>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white text-gray-900 font-medium">
                    {event.price}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees}명 참석 예정</span>
                    </div>
                    <span className="text-xs text-gray-500">by {event.organizer}</span>
                  </div>
                </div>

                <Button className="w-full">
                  참석하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            더 많은 이벤트 보기
          </Button>
        </div>

        {/* Event Registration CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">이벤트를 등록하고 싶으신가요?</h3>
            <p className="text-gray-600 mb-6">
              당신의 창작 이벤트를 Collaboreum에서 홍보하고 더 많은 관객을 만나보세요.
              무료로 이벤트를 등록하고 통합 스케줄러의 혜택을 누리세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                이벤트 등록하기
              </Button>
              <Button variant="outline" size="lg">
                등록 가이드 보기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}