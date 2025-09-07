import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { DollarSign, TrendingUp, Users, BarChart3, Eye, Edit, Plus, MessageCircle, Heart, Target } from "lucide-react";
import { ImageWithFallback } from "./atoms/ImageWithFallback";
import { useAuth } from "../contexts/AuthContext";
import { userAPI, fundingAPI, communityAPI } from "../services/api";

export function ArtistMyPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // 아티스트 프로필 데이터 가져오기
        const profileResponse = await userAPI.getUserProfile(user.id) as any;
        if (profileResponse.success) {
          setArtistData(profileResponse.data);
        }

        // 프로젝트 데이터 가져오기
        const projectsResponse = await fundingAPI.getProjects({ artistId: user.id }) as any;
        if (projectsResponse.success) {
          setProjects(projectsResponse.data || []);
        }

        // 커뮤니티 통계 가져오기
        const statsResponse = await communityAPI.getForumPosts(undefined, { page: 1, limit: 10 }) as any;
        if (statsResponse.success) {
          setCommunityStats(statsResponse.data);
        }

        // 최근 활동 가져오기
        const activitiesResponse = await communityAPI.getForumPosts(undefined, { page: 1, limit: 5 }) as any;
        if (activitiesResponse.success) {
          setRecentActivities(activitiesResponse.data || []);
        }

      } catch (err) {
        console.error('Failed to fetch artist data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중": return "bg-blue-100 text-blue-800";
      case "완료": return "bg-green-100 text-green-800";
      case "준비중": return "bg-yellow-100 text-yellow-800";
      case "보류": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={artistData?.avatar || user?.avatar} alt={artistData?.name || user?.name} />
              <AvatarFallback className="text-xl">{(artistData?.name || user?.name || 'A').charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artistData?.name || user?.name || '아티스트'}</h1>
              <p className="text-gray-600 mb-2">{artistData?.email || user?.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>가입일: {artistData?.joinDate || user?.createdAt || '알 수 없음'}</span>
                <Badge className="bg-purple-100 text-purple-800">아티스트</Badge>
                <Badge variant="outline">{artistData?.category || '일반'}</Badge>
              </div>
            </div>
            <div className="ml-auto">
              <Button className="mb-2">
                <Edit className="w-4 h-4 mr-2" />
                프로필 편집
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">₩{(artistData?.totalFunding || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600">총 펀딩액</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData?.completedProjects || 0}</p>
                <p className="text-sm text-gray-600">완료 프로젝트</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData?.activeProjects || 0}</p>
                <p className="text-sm text-gray-600">진행중 프로젝트</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData?.followers || 0}</p>
                <p className="text-sm text-gray-600">팔로워</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData?.successRate || 0}%</p>
                <p className="text-sm text-gray-600">성공률</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">프로젝트 관리</TabsTrigger>
            <TabsTrigger value="community">커뮤니티</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">내 프로젝트</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 프로젝트
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="lg:col-span-2 space-y-4">
                {projects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 mb-4">
                        <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>아직 등록된 프로젝트가 없습니다.</p>
                      </div>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        첫 프로젝트 만들기
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-all ${selectedProject === project.id ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md'
                        }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback
                              src={project.image}
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-1">{project.title}</h3>
                                <p className="text-sm text-gray-600">{project.description}</p>
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>

                            {project.status === "진행중" && (
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span>₩{project.currentAmount.toLocaleString()} / ₩{project.targetAmount.toLocaleString()}</span>
                                  <span>{Math.round((project.currentAmount / project.targetAmount) * 100)}%</span>
                                </div>
                                <Progress value={(project.currentAmount / project.targetAmount) * 100} className="h-2" />
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>{project.backers}명 후원</span>
                                  <span>{project.daysLeft}일 남음</span>
                                </div>
                              </div>
                            )}

                            {project.status === "완료" && project.finalReport && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">총 수익:</span>
                                  <span className="font-semibold ml-2">₩{project.finalReport.totalRevenue.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">투자자 배분:</span>
                                  <span className="font-semibold ml-2">₩{project.finalReport.distributedAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center mt-3 pt-3 border-t">
                              <span className="text-sm text-gray-600">{project.startDate} - {project.endDate}</span>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  보기
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  편집
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">프로젝트 세부사항</h3>
                {selectedProject ? (
                  <div className="space-y-4">
                    {(() => {
                      const project = projects.find(p => p.id === selectedProject);
                      if (!project) return <div>프로젝트를 찾을 수 없습니다.</div>;
                      return (
                        <>
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">{project.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {project.status === "진행중" && project.expenses && (
                                <div>
                                  <h4 className="font-medium mb-3">예산 사용 현황</h4>
                                  <div className="space-y-3">
                                    {project.expenses.map((expense: any, index: number) => (
                                      <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span>{expense.category}</span>
                                          <span>₩{expense.amount.toLocaleString()} / ₩{expense.planned.toLocaleString()}</span>
                                        </div>
                                        <Progress value={(expense.amount / expense.planned) * 100} className="h-1" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {project.updates && project.updates.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">최근 업데이트</h4>
                                  {project.updates.map((update: any) => (
                                    <div key={update.id} className="space-y-2">
                                      <div className="flex justify-between items-start">
                                        <h5 className="font-medium text-sm">{update.title}</h5>
                                        <span className="text-xs text-gray-500">{update.date}</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{update.content}</p>
                                      {update.image && (
                                        <div className="w-full h-32 rounded-lg overflow-hidden">
                                          <ImageWithFallback
                                            src={update.image}
                                            alt="업데이트 이미지"
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <Button className="w-full" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                새 업데이트 작성
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">활동 현황</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {(recentActivities.length > 0 ? recentActivities : []).map((activity: any) => (
                                  <div key={activity.id} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'funding' ? 'bg-green-500' :
                                      activity.type === 'comment' ? 'bg-blue-500' : 'bg-purple-500'
                                      }`} />
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">{activity.message}</p>
                                      <p className="text-xs text-gray-600">{activity.time}</p>
                                      {activity.amount && (
                                        <p className="text-sm font-semibold text-green-600">
                                          +₩{activity.amount.toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>프로젝트를 선택하면 세부사항을 확인할 수 있습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{communityStats?.totalPosts || 0}</p>
                  <p className="text-sm text-gray-600">총 게시물</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{communityStats?.totalLikes || 0}</p>
                  <p className="text-sm text-gray-600">받은 좋아요</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{communityStats?.totalComments || 0}</p>
                  <p className="text-sm text-gray-600">댓글 수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">+{communityStats?.monthlyGrowth || 0}%</p>
                  <p className="text-sm text-gray-600">월 성장률</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 활동</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>최근 활동이 없습니다.</p>
                      <Button className="mt-4">새 게시물 작성</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className={`w-2 h-2 rounded-full ${activity.type === 'post' ? 'bg-blue-500' :
                            activity.type === 'comment' ? 'bg-green-500' :
                              activity.type === 'like' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>팬 소통 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>응답 대기 중인 댓글</span>
                      <Badge>3개</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>이번 주 새 팔로워</span>
                      <span className="text-green-600">+23명</span>
                    </div>
                    <div className="flex justify-between">
                      <span>평균 응답 시간</span>
                      <span>2.5시간</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 조회수</p>
                      <p className="text-2xl font-bold text-gray-900">12,847</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12.5% 이번 달
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">팬 참여도</p>
                      <p className="text-2xl font-bold text-gray-900">89%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +5.2% 이번 주
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 후원금</p>
                      <p className="text-2xl font-bold text-gray-900">₩45,200</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +8.1% 이번 달
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">성공률</p>
                      <p className="text-2xl font-bold text-gray-900">94%</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +2.3% 이번 달
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    월별 수익 추이
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>차트 데이터 준비 중</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    팬 참여 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">댓글 참여도</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-20" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">공유 참여도</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60} className="w-20" />
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">후원 참여도</span>
                      <div className="flex items-center gap-2">
                        <Progress value={45} className="w-20" />
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">이벤트 참여도</span>
                      <div className="flex items-center gap-2">
                        <Progress value={30} className="w-20" />
                        <span className="text-sm font-medium">30%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12 text-gray-500">
              <h3 className="text-lg font-medium mb-2">설정 페이지 준비 중</h3>
              <p>프로필 설정, 알림 설정 등의 기능이 곧 추가됩니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}