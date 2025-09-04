import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Heart, TrendingUp, Users, Calendar, MapPin, Clock, Search, Filter, Star, Target, DollarSign, Eye, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const projects = [
  {
    id: 1,
    title: "정규앨범 '도시의 밤' 제작",
    artist: "김민수",
    artistAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "음악",
    description: "10년간의 길거리 공연 경험을 담은 첫 정규앨범입니다. 도시의 외로움과 희망을 노래로 전달하고 싶습니다.",
    targetAmount: 3000000,
    currentAmount: 2250000,
    backers: 45,
    daysLeft: 12,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    location: "서울",
    status: "진행중",
    startDate: "2025-07-01",
    endDate: "2025-08-31",
    featured: true,
    tags: ["인디", "싱어송라이터", "감성"],
    artistRating: 4.8,
    previousProjects: 2,
    successRate: 100,
    rewards: [
      { amount: 10000, title: "디지털 앨범", backers: 15, description: "완성된 디지털 앨범 (MP3, FLAC)" },
      { amount: 30000, title: "CD + 포토북", backers: 20, description: "피지컬 CD + 아티스트 포토북" },
      { amount: 50000, title: "한정판 바이닐", backers: 8, description: "한정판 바이닐 LP + 사인" },
      { amount: 100000, title: "VIP 콘서트 티켓", backers: 2, description: "완성 기념 콘서트 VIP석 + 만남의 시간" }
    ],
    budgetBreakdown: [
      { category: "녹음/믹싱", amount: 1200000, percentage: 40 },
      { category: "뮤직비디오", amount: 900000, percentage: 30 },
      { category: "마케팅/홍보", amount: 600000, percentage: 20 },
      { category: "플랫폼 수수료", amount: 300000, percentage: 10 }
    ],
    updates: [
      {
        id: 1,
        date: "2025-08-10",
        title: "녹음 작업 완료!",
        content: "드디어 모든 곡의 녹음이 끝났습니다. 총 10곡으로 구성되며, 믹싱 작업에 들어갑니다.",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=200&fit=crop",
        likes: 23,
        comments: 8
      },
      {
        id: 2,
        date: "2025-08-05",
        title: "뮤직비디오 촬영 완료",
        content: "타이틀곡 '도시의 밤' 뮤직비디오 촬영을 마쳤습니다. 편집 작업을 시작합니다.",
        likes: 31,
        comments: 12
      }
    ]
  },
  {
    id: 2,
    title: "개인전 '기억의 조각들' 개최",
    artist: "이지영",
    artistAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    category: "미술",
    description: "현대인의 파편화된 기억을 주제로 한 설치미술 개인전을 준비하고 있습니다.",
    targetAmount: 2000000,
    currentAmount: 1650000,
    backers: 28,
    daysLeft: 18,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    location: "부산",
    status: "진행중",
    startDate: "2025-07-15",
    endDate: "2025-09-15",
    featured: false,
    tags: ["현대미술", "설치미술", "개인전"],
    artistRating: 4.6,
    previousProjects: 1,
    successRate: 100,
    rewards: [
      { amount: 20000, title: "전시 도록", backers: 10, description: "작품 해설이 담긴 전시 도록" },
      { amount: 50000, title: "작품 엽서 ��트", backers: 12, description: "한정판 작품 엽서 10매 세트" },
      { amount: 100000, title: "작은 작품", backers: 5, description: "전시 연계 소품 작품 1점" },
      { amount: 300000, title: "프라이빗 투어", backers: 1, description: "작가와 함께하는 프라이빗 전시 투어" }
    ],
    budgetBreakdown: [
      { category: "전시장 대관료", amount: 800000, percentage: 40 },
      { category: "작품 제작비", amount: 600000, percentage: 30 },
      { category: "설치/운송비", amount: 400000, percentage: 20 },
      { category: "홍보/마케팅", amount: 200000, percentage: 10 }
    ],
    updates: [
      {
        id: 1,
        date: "2025-08-08",
        title: "작품 제작 진행 상황",
        content: "주요 설치 작품 3점의 제작이 70% 완료되었습니다. 곧 전시장에서 만나실 수 있습니다.",
        likes: 18,
        comments: 5
      }
    ]
  },
  {
    id: 3,
    title: "단편소설집 '서울역 이야기' 출간",
    artist: "박소영",
    artistAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    category: "문학",
    description: "서울역을 배경으로 한 8편의 단편소설을 엮은 소설집 출간 프로젝트입니다.",
    targetAmount: 1500000,
    currentAmount: 890000,
    backers: 19,
    daysLeft: 25,
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    location: "서울",
    status: "진행중",
    startDate: "2025-08-01",
    endDate: "2025-09-30",
    featured: false,
    tags: ["소설", "단편", "도시문학"],
    artistRating: 4.5,
    previousProjects: 0,
    successRate: 0,
    rewards: [
      { amount: 15000, title: "전자책", backers: 8, description: "완성된 전자책 (ePub, PDF)" },
      { amount: 25000, title: "종이책", backers: 7, description: "완성된 종이책 + 작가 사인" },
      { amount: 50000, title: "한정판 책", backers: 3, description: "양장본 한정판 + 책갈피" },
      { amount: 100000, title: "작가와의 만남", backers: 1, description: "북토크 이벤트 + 개인 사인회" }
    ],
    budgetBreakdown: [
      { category: "편집/교정", amount: 450000, percentage: 30 },
      { category: "디자인/인쇄", amount: 600000, percentage: 40 },
      { category: "마케팅", amount: 300000, percentage: 20 },
      { category: "유통비용", amount: 150000, percentage: 10 }
    ],
    updates: [
      {
        id: 1,
        date: "2025-08-08",
        title: "편집 작업 진행 중",
        content: "8편의 단편소설 중 5편의 편집이 완료되었습니다. 책 표지 디자인도 함께 진행하고 있습니다.",
        likes: 12,
        comments: 4
      }
    ]
  }
];

const categories = ["전체", "음악", "미술", "문학", "공연"];
const sortOptions = ["인기순", "최신순", "마감임박", "달성률"];

interface FundingProjectsProps {
  onViewProject?: (projectId: number) => void;
}

export function FundingProjects({ onViewProject }: FundingProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("인기순");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const filteredProjects = projects.filter(project => {
    const categoryMatch = selectedCategory === "전체" || project.category === selectedCategory;
    const searchMatch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       project.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "음악": return "bg-blue-100 text-blue-800";
      case "미술": return "bg-purple-100 text-purple-800";
      case "문학": return "bg-green-100 text-green-800";
      case "공연": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <div className="relative aspect-video">
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {project.featured && (
          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
            주목 프로젝트
          </Badge>
        )}
        <Badge className={`absolute top-3 right-3 ${getCategoryColor(project.category)}`}>
          {project.category}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            <div className="flex justify-between text-sm mb-2">
              <span>₩{project.currentAmount.toLocaleString()}</span>
              <span>{Math.round(getProgressPercentage(project.currentAmount, project.targetAmount))}%</span>
            </div>
            <Progress 
              value={getProgressPercentage(project.currentAmount, project.targetAmount)} 
              className="h-2 bg-white/20"
            />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={project.artistAvatar} alt={project.artist} />
            <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-1">{project.title}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">by {project.artist}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-gray-600">{project.artistRating}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-4 line-clamp-2">{project.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-4">
          <div>
            <p className="font-semibold text-gray-900">{project.backers}</p>
            <p className="text-gray-600">후원자</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{project.daysLeft}</p>
            <p className="text-gray-600">일 남음</p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{project.successRate}%</p>
            <p className="text-gray-600">성공률</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>~{project.endDate}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            className="flex-1 cursor-pointer"
            onClick={() => onViewProject?.(project.id)}
          >
            후원하기
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="cursor-pointer"
            onClick={() => setSelectedProject(project.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="projects" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">펀딩 프로젝트</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="프로젝트나 아티스트 이름으로 검색..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="cursor-pointer">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600">다른 검색어나 카테고리를 시도해보세요</p>
              </div>
            )}
          </div>

          {/* Project Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedProject ? (
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">프로젝트 상세정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const project = projects.find(p => p.id === selectedProject)!;
                    return (
                      <>
                        <div className="text-center">
                          <h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={project.artistAvatar} alt={project.artist} />
                              <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">{project.artist}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">예산 구성</h4>
                          {project.budgetBreakdown.map((item, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{item.category}</span>
                                <span>₩{item.amount.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{width: `${item.percentage}%`}}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">후원 옵션</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {project.rewards.map((reward, index) => (
                              <div key={index} className="p-3 border rounded-lg text-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">₩{reward.amount.toLocaleString()}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {reward.backers}명
                                  </Badge>
                                </div>
                                <h5 className="font-medium text-gray-900 mb-1">{reward.title}</h5>
                                <p className="text-gray-600">{reward.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {project.updates.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">최근 업데이트</h4>
                            {project.updates.slice(0, 2).map((update) => (
                              <div key={update.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-gray-900">{update.title}</h5>
                                  <span className="text-xs text-gray-500">{update.date}</span>
                                </div>
                                <p className="text-gray-600 mb-2 line-clamp-2">{update.content}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    <span>{update.likes}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    <span>{update.comments}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <Button 
                          className="w-full cursor-pointer"
                          onClick={() => onViewProject?.(project.id)}
                        >
                          프로젝트 상세보기
                        </Button>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : (
              <div className="sticky top-8 hidden lg:block" />
            )}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="cursor-pointer">
            더 많은 프로젝트 보기
          </Button>
        </div>
      </div>
    </section>
  );
}