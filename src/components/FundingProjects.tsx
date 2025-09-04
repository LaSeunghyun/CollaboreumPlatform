import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Heart, Calendar, MapPin, Search, Filter, Star, Target, Eye, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { fundingAPI, communityAPI } from '../services/api';
import { PaymentModal } from './PaymentModal';
import { dynamicConstantsService } from '../services/constantsService';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getCategoryColor,
  KOREAN_CATEGORIES
} from '../constants/categories';

interface FundingProjectsProps {
  onViewProject?: (projectId: number) => void;
}

export function FundingProjects({ onViewProject }: FundingProjectsProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["전체"]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("인기순");
  const [sortOptions, setSortOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState<any>(null);

  // API 응답 구조에 맞춰 프로젝트 데이터 정규화
  const normalizeProjectData = (project: any) => {
    return {
      ...project,
      currentAmount: project.currentAmount || project.raisedAmount || 0,
      targetAmount: project.targetAmount || project.goalAmount || project.fundingGoal || 0,
      backers: project.backers || project.supporters || 0,
      daysLeft: project.daysLeft || project.remainingDays || 0,
      endDate: project.endDate || project.deadline || project.fundingEndDate || '',
      artist: project.artist || project.creator || project.artistName || '',
      category: project.category || project.genre || '',
      tags: project.tags || project.keywords || [],
      budgetBreakdown: project.budgetBreakdown || project.budget || [],
      rewards: project.rewards || project.fundingTiers || [],
      updates: project.updates || project.posts || [],
      // 기본값 보장
      title: project.title || '제목 없음',
      description: project.description || '설명 없음',
      image: project.image || 'https://via.placeholder.com/400/300?text=이미지+없음'
    };
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectsResponse, categoriesResponse, sortOptionsResponse] = await Promise.all([
          fundingAPI.getProjects(),
          communityAPI.getCategories(),
          dynamicConstantsService.getSortOptions()
        ]) as any[];

        // 프로젝트 데이터 처리
        if (projectsResponse.success && projectsResponse.data?.projects) {
          setProjects(projectsResponse.data.projects);
        } else {
          setProjects([]);
        }

        // 카테고리 데이터 처리
        if (Array.isArray(categoriesResponse)) {
          const categoryLabels = categoriesResponse.map((cat: any) => cat.label || cat.name);
          setCategories(["전체", ...categoryLabels]);
        } else if (categoriesResponse?.success && Array.isArray(categoriesResponse.data)) {
          const categoryLabels = categoriesResponse.data.map((cat: any) => cat.label || cat.name);
          setCategories(["전체", ...categoryLabels]);
        } else {
          setCategories(KOREAN_CATEGORIES);
        }

        // 정렬 옵션 데이터 처리
        if (sortOptionsResponse && Array.isArray(sortOptionsResponse)) {
          setSortOptions(sortOptionsResponse);
        } else {
          setSortOptions([
            { value: 'popular', label: '인기순' },
            { value: 'latest', label: '최신순' },
            { value: 'deadline', label: '마감임박' },
            { value: 'progress', label: '달성률' }
          ]);
        }

      } catch (error) {
        console.error('Failed to fetch funding data:', error);
        setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        setProjects([]);
        setCategories(KOREAN_CATEGORIES);
        setSortOptions([
          { value: 'popular', label: '인기순' },
          { value: 'latest', label: '최신순' },
          { value: 'deadline', label: '마감임박' },
          { value: 'progress', label: '달성률' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBackProject = (project: any) => {
    setSelectedProjectForPayment(project);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      const response = await fundingAPI.backProject(selectedProjectForPayment.id.toString(), {
        amount: paymentData.amount,
        message: paymentData.message || '',
        rewardId: paymentData.rewardId
      }) as any;

      if (response.success) {
        // 프로젝트 목록 새로고침
        const updatedResponse = await fundingAPI.getProjects() as any;
        if (updatedResponse.success && updatedResponse.data?.projects) {
          setProjects(updatedResponse.data.projects);
        }
        setShowPaymentModal(false);
        setSelectedProjectForPayment(null);
      }
    } catch (error) {
      // 후원 처리 실패
    }
  };

  // 정렬 옵션은 API에서 가져옴

  const filteredProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    let filtered = projects.filter((project: any) => {
      const categoryMatch = selectedCategory === "전체" || project.category === selectedCategory;
      const searchMatch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.artist?.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // 정렬 적용
    switch (sortBy) {
      case "인기순":
        filtered.sort((a: any, b: any) => (b.backers || 0) - (a.backers || 0));
        break;
      case "최신순":
        filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case "마감임박":
        filtered.sort((a: any, b: any) => (a.daysLeft || 0) - (b.daysLeft || 0));
        break;
      case "달성률":
        filtered.sort((a: any, b: any) => {
          const aRate = getProgressPercentage(a.currentAmount || 0, a.targetAmount || 1);
          const bRate = getProgressPercentage(b.currentAmount || 0, b.targetAmount || 1);
          return bRate - aRate;
        });
        break;
    }

    return filtered;
  }, [projects, selectedCategory, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">펀딩 프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  const getProgressPercentage = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    if (typeof current !== 'number' || typeof target !== 'number') return 0;
    if (isNaN(current) || isNaN(target)) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const calculateSuccessRate = (current: number, target: number) => {
    if (!current || !target || target <= 0) return 0;
    if (typeof current !== 'number' || typeof target !== 'number') return 0;
    if (isNaN(current) || isNaN(target)) return 0;
    return Math.round((current / target) * 100);
  };



  const ProjectCard = ({ project }: { project: any }) => (
    <Card className="overflow-hidden hover:shadow-apple-lg transition-all duration-300 group cursor-pointer border-border/50 rounded-3xl">
      <div className="relative aspect-video">
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {project.featured && (
          <Badge className="absolute top-4 left-4 bg-yellow-500 text-white rounded-xl font-medium">
            주목 프로젝트
          </Badge>
        )}
        <Badge className={`absolute top-4 right-4 rounded-xl font-medium ${project.category === "음악" ? "bg-primary text-primary-foreground" :
          project.category === "미술" ? "bg-chart-5 text-white" :
            project.category === "문학" ? "bg-chart-2 text-white" : "bg-destructive text-white"
          }`}>
          {project.category}
        </Badge>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-morphism rounded-2xl p-4 text-white border border-white/20">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">₩{(project.currentAmount || 0).toLocaleString()}</span>
              <span className="font-medium">{getProgressPercentage(project.currentAmount || 0, project.targetAmount).toFixed(1)}%</span>
            </div>
            <Progress
              value={getProgressPercentage(project.currentAmount || 0, project.targetAmount)}
              className="h-2 bg-white/20"
            />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={project.artistAvatar} alt={project.artist} />
            <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg line-clamp-1">{project.title}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">by {project.artist}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-primary fill-current" />
                <span className="text-xs text-muted-foreground">{project.artistRating}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-foreground/80 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {(project.tags || []).map((tag: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs bg-secondary/80 text-foreground rounded-lg px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm mb-6">
          <div>
            <p className="font-bold text-foreground text-lg">{project.backers}</p>
            <p className="text-muted-foreground font-medium">후원자</p>
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">{project.daysLeft}</p>
            <p className="text-muted-foreground font-medium">일 남음</p>
          </div>
          <div>
            <p className="font-bold text-foreground text-lg">
              {calculateSuccessRate(project.currentAmount, project.targetAmount)}%
            </p>
            <p className="text-muted-foreground font-medium">성공률</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{project.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>~{project.endDate}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
            onClick={() => handleBackProject(project)}
          >
            후원하기
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer border-border hover:bg-secondary/50 rounded-xl px-4"
            onClick={() => {
              try {
                // 팝업창으로 프로젝트 상세 정보 표시
                const popup = window.open('', '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
                if (popup) {
                  popup.document.write(`
                    <html>
                      <head>
                        <title>${project.title} - 상세 정보</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; }
                          .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                          .info { margin: 10px 0; }
                          .close-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <h1>${project.title}</h1>
                          <p><strong>아티스트:</strong> ${project.artist || '정보 없음'}</p>
                        </div>
                        <div class="info">
                          <p><strong>설명:</strong> ${project.description || '설명 없음'}</p>
                          <p><strong>목표 금액:</strong> ₩${(project.targetAmount || 0).toLocaleString()}</p>
                          <p><strong>현재 금액:</strong> ₩${(project.currentAmount || 0).toLocaleString()}</p>
                          <p><strong>후원자 수:</strong> ${project.backers || 0}명</p>
                        </div>
                        <button class="close-btn" onclick="window.close()">닫기</button>
                      </body>
                    </html>
                  `);
                  popup.document.close();
                }
                setSelectedProject(project.id);
              } catch (error) {
                // 에러 시에도 팝업창으로 표시
                const errorPopup = window.open('', '_blank', 'width=400,height=200');
                if (errorPopup) {
                  errorPopup.document.write(`
                    <html>
                      <head>
                        <title>오류</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                          .error { color: #dc3545; }
                          .close-btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                        </style>
                      </head>
                      <body>
                        <div class="error">
                          <h3>오류 발생</h3>
                          <p>프로젝트를 선택하는데 실패했습니다.</p>
                        </div>
                        <button class="close-btn" onclick="window.close()">닫기</button>
                      </body>
                    </html>
                  `);
                  errorPopup.document.close();
                }
              }
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer border-border hover:bg-secondary/50 rounded-xl px-4"
            onClick={async () => {
              try {
                const response = await fundingAPI.likeProject(project.id.toString()) as any;
                if (response.success) {
                  // 프로젝트 목록 새로고침
                  const updatedResponse = await fundingAPI.getProjects() as any;
                  if (updatedResponse.success && updatedResponse.data?.projects) {
                    setProjects(updatedResponse.data.projects);
                  }
                }
              } catch (error) {
                // 에러 시 팝업창으로 표시
                const errorPopup = window.open('', '_blank', 'width=400,height=200');
                if (errorPopup) {
                  errorPopup.document.write(`
                    <html>
                      <head>
                        <title>오류</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                          .error { color: #dc3545; }
                          .close-btn { background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                        </style>
                      </head>
                      <body>
                        <div class="error">
                          <h3>오류 발생</h3>
                          <p>좋아요 처리에 실패했습니다.</p>
                        </div>
                        <button class="close-btn" onclick="window.close()">닫기</button>
                      </body>
                    </html>
                  `);
                  errorPopup.document.close();
                }
              }
            }}
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="projects" className="py-24 lg:py-32 bg-gradient-to-b from-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-primary/20">
            <span className="text-lg">🎯</span>
            활발한 펀딩 프로젝트
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">
            창의적인 <span className="text-primary">프로젝트</span>를 후원하세요
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            독립 아티스트들의 꿈을 현실로 만들어가는 프로젝트들을 만나보세요
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="프로젝트나 아티스트 이름으로 검색..."
                className="pl-12 h-12 rounded-2xl border-border/50 bg-input-background/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 h-12 rounded-2xl border-border/50 bg-input-background/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-12 rounded-2xl border-border/50 bg-input-background/80 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-12 px-6 rounded-2xl border-border/50 bg-input-background/80 backdrop-blur-sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="glass-morphism rounded-3xl p-12 border border-border/30">
              <Target className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground text-lg">다른 검색어나 카테고리를 시도해보세요</p>
            </div>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary/50 cursor-pointer font-medium px-8 py-4 rounded-2xl"
          >
            더 많은 프로젝트 보기
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedProjectForPayment && (
        <PaymentModal
          project={selectedProjectForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedProjectForPayment(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
}