import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Heart, Calendar, MapPin, Search, Filter, Star, Target, Eye, MessageCircle } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { fundingAPI, communityAPI } from '../services/api';
import { PaymentModal } from './PaymentModal';
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
  const [sortBy, setSortBy] = useState("최신순");
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

        try {
          const [projectsResponse, categoriesResponse] = await Promise.all([
            fundingAPI.getProjects(),
            communityAPI.getCategories()
          ]) as any[];

          if (projectsResponse.success && projectsResponse.data?.projects) {
            setProjects(projectsResponse.data.projects);
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
            setCategories(KOREAN_CATEGORIES);
          }
        } catch (apiError) {
          console.error('API 호출 실패:', apiError);
          setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          setProjects([]);
          return;
        }

      } catch (error) {
        console.error('Failed to fetch funding projects:', error);
        setError('펀딩 프로젝트를 불러오는데 실패했습니다.');
        setProjects([]);
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
      console.error('후원 처리 실패:', error);
    }
  };

  // 동적으로 정렬 옵션 생성
  const sortOptions = useMemo(() => {
    const baseOptions = ["인기순", "최신순"];

    // 프로젝트가 있을 때만 관련 옵션 추가
    if (projects && projects.length > 0) {
      const hasDeadline = projects.some((p: any) => p.deadline || p.endDate);
      const hasTarget = projects.some((p: any) => p.targetAmount && p.currentAmount);

      if (hasDeadline) baseOptions.push("마감임박");
      if (hasTarget) baseOptions.push("달성률");
    }

    // 카테고리가 2개 이상일 때만 카테고리별 옵션 추가
    if (categories && categories.length > 2) {
      baseOptions.push("카테고리별");
    }

    return baseOptions;
  }, [projects, categories]);

  const filteredProjects = projects ? projects.filter((project: any) => {
    const categoryMatch = selectedCategory === "전체" || project.category === selectedCategory;
    const searchMatch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.artist?.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  }) : [];

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
              <span>₩{(project.currentAmount || 0).toLocaleString()}</span>
              <span>{getProgressPercentage(project.currentAmount || 0, project.targetAmount).toFixed(1)}%</span>
            </div>
            <Progress
              value={getProgressPercentage(project.currentAmount || 0, project.targetAmount)}
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
          {(project.tags || []).map((tag: string, index: number) => (
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
            <p className="font-semibold text-gray-900">
              {calculateSuccessRate(project.currentAmount, project.targetAmount)}%
            </p>
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
            className="flex-1"
            onClick={() => handleBackProject(project)}
          >
            후원하기
          </Button>
          <Button
            variant="outline"
            size="sm"
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
                console.error('프로젝트 선택 실패:', error);
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
                console.error('좋아요 처리 실패:', error);
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
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">펀딩 프로젝트</h2>
          <p className="text-xl text-gray-600">창의적인 프로젝트를 후원하고 함께 성공의 기쁨을 나누세요</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
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
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">카테고리</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort" className="text-sm font-medium">정렬</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option: string) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                // 고급 필터 모달 또는 패널 표시
                console.log('고급 필터 열기');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Project Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {filteredProjects.length === 0 && !loading && (
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
                    const project = projects.find((p: any) => p.id === selectedProject);
                    if (!project) return null;
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
                          {project.budgetBreakdown?.map((item: any, index: number) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{item.category}</span>
                                <span>₩{item.amount.toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">후원 옵션</h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {project.rewards?.map((reward: any, index: number) => (
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

                        {project.updates && project.updates.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium">최근 업데이트</h4>
                            {project.updates?.slice(0, 2).map((update: any) => (
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
                          className="w-full"
                          onClick={() => {
                            // 프로젝트 상세 페이지로 이동
                            if (onViewProject) {
                              onViewProject(project.id);
                            }
                          }}
                        >
                          프로젝트 상세보기
                        </Button>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-8">
                <CardContent className="p-8 text-center text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>프로젝트를 선택하면 상세정보를 확인할 수 있습니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={async () => {
              try {
                // 페이지네이션 또는 더 많은 프로젝트 로드
                const currentPage = Math.ceil(projects.length / 8) + 1;
                const response = await fundingAPI.getProjects({ page: currentPage, limit: 8 }) as any;
                if (response.success && response.data?.projects) {
                  setProjects(prev => [...prev, ...response.data.projects]);
                }
              } catch (error) {
                console.error('더 많은 프로젝트 로드 실패:', error);
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
                          <p>프로젝트를 더 불러오는데 실패했습니다.</p>
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