import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { Progress } from "@/shared/ui/Progress";
// import { Separator } from "@/shared/ui/Separator";
import { DollarSign, TrendingUp, Users, BarChart3, Eye, Edit, Plus, MessageCircle, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getFirstChar } from "../utils/typeGuards";

const artistData = {
  name: "김민수",
  email: "artist.kim@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  category: "싱어송라이터",
  joinDate: "2024년 3월",
  followers: 1247,
  totalFunding: 2350000,
  completedProjects: 3,
  activeProjects: 2,
  successRate: 87
};

const projects = [
  {
    id: 1,
    title: "정규앨범 '도시의 밤' 제작",
    description: "10년간의 음악 여정을 담은 첫 정규앨범",
    category: "음악",
    status: "진행중",
    targetAmount: 3000000,
    currentAmount: 2250000,
    backers: 45,
    daysLeft: 12,
    startDate: "2025-07-01",
    endDate: "2025-08-31",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    updates: [
      {
        id: 1,
        date: "2025-08-10",
        title: "녹음 작업 완료!",
        content: "드디어 모든 곡의 녹음이 끝났습니다. 믹싱 작업에 들어갑니다.",
        image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=200&fit=crop"
      }
    ],
    expenses: [
      { category: "녹음비", amount: 800000, planned: 800000 },
      { category: "믹싱/마스터링", amount: 400000, planned: 500000 },
      { category: "뮤직비디오", amount: 600000, planned: 700000 },
      { category: "마케팅", amount: 200000, planned: 400000 }
    ]
  },
  {
    id: 2,
    title: "EP '새벽의 선율' 발매",
    description: "감성적인 새벽을 담은 4곡의 EP",
    category: "음악",
    status: "완료",
    targetAmount: 1500000,
    currentAmount: 1750000,
    backers: 32,
    daysLeft: 0,
    startDate: "2025-04-01",
    endDate: "2025-05-31",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop",
    finalReport: {
      totalRevenue: 2100000,
      investorShare: 1575000,
      artistShare: 525000,
      distributedAmount: 1575000
    }
  }
];

const communityStats = {
  totalPosts: 23,
  totalLikes: 1456,
  totalComments: 234,
  monthlyGrowth: 12
};

const recentActivities = [
  {
    id: 1,
    type: "funding",
    message: "새로운 후원자가 프로젝트를 지원했습니다",
    time: "2시간 전",
    amount: 50000
  },
  {
    id: 2,
    type: "comment",
    message: "작업 업데이트에 새로운 댓글이 달렸습니다",
    time: "4시간 전"
  },
  {
    id: 3,
    type: "follow",
    message: "새로운 팔로워가 추가되었습니다",
    time: "6시간 전"
  }
];

export function ArtistMyPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중": return "bg-blue-100 text-blue-800";
      case "완료": return "bg-green-100 text-green-800";
      case "준비중": return "bg-yellow-100 text-yellow-800";
      case "보류": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={artistData.avatar} alt={artistData.name} />
              <AvatarFallback className="text-xl">{getFirstChar(artistData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artistData.name}</h1>
              <p className="text-gray-600 mb-2">{artistData.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>가입일: {artistData.joinDate}</span>
                <Badge className="bg-purple-100 text-purple-800">아티스트</Badge>
                <Badge variant="outline">{artistData.category}</Badge>
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
                <p className="text-2xl font-bold text-gray-900">₩{artistData.totalFunding.toLocaleString()}</p>
                <p className="text-sm text-gray-600">총 펀딩액</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData.completedProjects}</p>
                <p className="text-sm text-gray-600">완료 프로젝트</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData.activeProjects}</p>
                <p className="text-sm text-gray-600">진행중 프로젝트</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData.followers}</p>
                <p className="text-sm text-gray-600">팔로워</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{artistData.successRate}%</p>
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
                {projects.map((project) => (
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
                ))}
              </div>

              {/* Project Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">프로젝트 세부사항</h3>
                {selectedProject ? (
                  <div className="space-y-4">
                    {(() => {
                      const project = projects.find(p => p.id === selectedProject)!;
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
                                    {project.expenses.map((expense, index) => (
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
                                  {project.updates.map((update) => (
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
                                {recentActivities.map((activity) => (
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
                  <p className="text-2xl font-bold text-gray-900">{communityStats.totalPosts}</p>
                  <p className="text-sm text-gray-600">총 게시물</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{communityStats.totalLikes}</p>
                  <p className="text-sm text-gray-600">받은 좋아요</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{communityStats.totalComments}</p>
                  <p className="text-sm text-gray-600">댓글 수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">+{communityStats.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-600">월 성장률</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 게시물</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>최근 게시물이 없습니다.</p>
                    <Button className="mt-4">새 게시물 작성</Button>
                  </div>
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
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">상세 분석 기능 준비 중</h3>
              <p>프로젝트 성과와 팬 참여도 분석 기능이 곧 추가됩니다.</p>
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