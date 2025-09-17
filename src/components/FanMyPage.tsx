import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { Progress } from "@/shared/ui/Progress";
import { Separator } from "@/shared/ui/Separator";
import { Heart, TrendingUp, Wallet, DollarSign, BarChart3, Users, MessageCircle, ExternalLink, Eye } from "lucide-react";
import { getFirstChar } from "../utils/typeGuards";

const fanData = {
  name: "김팬심",
  email: "fankim@example.com",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=80&h=80&fit=crop&crop=face",
  joinDate: "2024년 3월",
  totalInvestment: 450000,
  totalReturns: 67500,
  activeInvestments: 5,
  followingArtists: 12,
  pointBalance: 15750
};

const investments = [
  {
    id: 1,
    projectTitle: "정규앨범 '도시의 밤' 제작",
    artistName: "김민수",
    artistAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    investmentAmount: 150000,
    investmentDate: "2025-07-15",
    status: "진행중",
    progress: 75,
    expectedReturn: 22500,
    currentReturn: 0,
    category: "음악",
    updates: [
      {
        date: "2025-08-10",
        title: "녹음 작업 완료",
        content: "총 10곡의 녹음 작업을 마쳤습니다. 현재 믹싱 단계에 있으며, 예상보다 빠른 진행을 보이고 있습니다.",
        usedAmount: 45000,
        totalBudget: 200000
      },
      {
        date: "2025-08-05",
        title: "뮤직비디오 촬영 완료",
        content: "타이틀곡 뮤직비디오 촬영을 완료했습니다. 편집 작업에 들어갑니다.",
        usedAmount: 80000,
        totalBudget: 200000
      }
    ]
  },
  {
    id: 2,
    projectTitle: "개인전 '기억의 조각들' 개최",
    artistName: "이지영",
    artistAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    investmentAmount: 100000,
    investmentDate: "2025-06-20",
    status: "완료",
    progress: 100,
    expectedReturn: 15000,
    currentReturn: 18750,
    category: "미술",
    updates: [
      {
        date: "2025-07-30",
        title: "전시회 성공적 마무리",
        content: "3주간의 전시회가 성공적으로 마무리되었습니다. 작품 6점이 판매되어 목표를 초과 달성했습니다.",
        usedAmount: 100000,
        totalBudget: 100000
      }
    ]
  },
  {
    id: 3,
    projectTitle: "단편소설집 '서울역 이야기' 출간",
    artistName: "박소영",
    artistAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    investmentAmount: 75000,
    investmentDate: "2025-08-01",
    status: "진행중",
    progress: 30,
    expectedReturn: 11250,
    currentReturn: 0,
    category: "문학",
    updates: [
      {
        date: "2025-08-08",
        title: "편집 작업 진행 중",
        content: "총 8편의 단편소설 편집 작업을 진행하고 있습니다. 표지 디자인도 함께 작업 중입니다.",
        usedAmount: 22000,
        totalBudget: 150000
      }
    ]
  }
];

const followingArtists = [
  {
    id: 1,
    name: "김민수",
    category: "싱어송라이터",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    followers: 1247,
    latestUpdate: "새로운 싱글 작업 중",
    isActive: true
  },
  {
    id: 2,
    name: "이지영",
    category: "현대미술가",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    followers: 892,
    latestUpdate: "다음 전시회 기획 중",
    isActive: false
  },
  {
    id: 3,
    name: "박소영",
    category: "소설가",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    followers: 634,
    latestUpdate: "장편소설 집필 시작",
    isActive: true
  }
];

export function FanMyPage() {
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "진행중": return "bg-blue-100 text-blue-800";
      case "완료": return "bg-green-100 text-green-800";
      case "보류": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "음악": return "bg-blue-500";
      case "미술": return "bg-purple-500";
      case "문학": return "bg-green-500";
      case "공연": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={fanData.avatar} alt={fanData.name} />
              <AvatarFallback className="text-xl">{getFirstChar(fanData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{fanData.name}</h1>
              <p className="text-gray-600 mb-2">{fanData.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>가입일: {fanData.joinDate}</span>
                <Badge className="bg-pink-100 text-pink-800">팬</Badge>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">₩{fanData.totalInvestment.toLocaleString()}</p>
                <p className="text-sm text-gray-600">총 투자금액</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">₩{fanData.totalReturns.toLocaleString()}</p>
                <p className="text-sm text-gray-600">총 수익</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{fanData.activeInvestments}</p>
                <p className="text-sm text-gray-600">진행중인 투자</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{fanData.followingArtists}</p>
                <p className="text-sm text-gray-600">팔로잉 아티스트</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Wallet className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">{fanData.pointBalance.toLocaleString()}P</p>
                <p className="text-sm text-gray-600">보유 포인트</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investments">투자 현황</TabsTrigger>
            <TabsTrigger value="following">팔로잉 아티스트</TabsTrigger>
            <TabsTrigger value="points">포인트 관리</TabsTrigger>
          </TabsList>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Investment List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">내 투자 목록</h2>
                {investments.map((investment) => (
                  <Card
                    key={investment.id}
                    className={`cursor-pointer transition-all ${selectedInvestment === investment.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                    onClick={() => setSelectedInvestment(investment.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={investment.artistAvatar} alt={investment.artistName} />
                            <AvatarFallback>{getFirstChar(investment.artistName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">{investment.projectTitle}</h3>
                            <p className="text-sm text-gray-600">by {investment.artistName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(investment.status)}>
                            {investment.status}
                          </Badge>
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(investment.category)} mt-2 ml-auto`} />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">투자 금액</p>
                          <p className="font-semibold">₩{investment.investmentAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">예상 수익</p>
                          <p className="font-semibold text-blue-600">₩{investment.expectedReturn.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">현재 수익</p>
                          <p className={`font-semibold ${investment.currentReturn > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            ₩{investment.currentReturn.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>프로젝트 진행률</span>
                          <span>{investment.progress}%</span>
                        </div>
                        <Progress value={investment.progress} className="h-2" />
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <span className="text-sm text-gray-600">투자일: {investment.investmentDate}</span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Investment Details */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">투자 세부사항</h2>
                {selectedInvestment ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {investments.find(inv => inv.id === selectedInvestment)?.projectTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {investments.find(inv => inv.id === selectedInvestment)?.updates.map((update, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{update.title}</h4>
                              <p className="text-sm text-gray-600">{update.date}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">{update.content}</p>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                              <span>예산 사용 현황</span>
                              <span>₩{update.usedAmount.toLocaleString()} / ₩{update.totalBudget.toLocaleString()}</span>
                            </div>
                            <Progress value={(update.usedAmount / update.totalBudget) * 100} className="h-2" />
                          </div>

                          {index < investments.find(inv => inv.id === selectedInvestment)!.updates.length - 1 && <Separator />}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>투자 항목을 선택하면 세부사항을 확인할 수 있습니다.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Following Artists Tab */}
          <TabsContent value="following" className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">팔로잉 아티스트</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followingArtists.map((artist) => (
                <Card key={artist.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={artist.avatar} alt={artist.name} />
                          <AvatarFallback>{getFirstChar(artist.name)}</AvatarFallback>
                        </Avatar>
                        {artist.isActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{artist.name}</h3>
                        <p className="text-sm text-gray-600">{artist.category}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{artist.latestUpdate}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{artist.followers}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>포인트 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-orange-50 rounded-lg">
                    <Wallet className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <p className="text-3xl font-bold text-orange-600 mb-2">
                      {fanData.pointBalance.toLocaleString()}P
                    </p>
                    <p className="text-gray-600">사용 가능한 포인트</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>이번 달 적립</span>
                      <span className="text-green-600">+2,500P</span>
                    </div>
                    <div className="flex justify-between">
                      <span>이번 달 사용</span>
                      <span className="text-red-600">-1,200P</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>순 증가</span>
                      <span className="text-green-600">+1,300P</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    포인트로 투자하기
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>포인트 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "2025-08-10", type: "적립", amount: 1875, desc: "이지영 개인전 수익 배분" },
                      { date: "2025-08-05", type: "사용", amount: -50000, desc: "박소영 단편소설집 투자" },
                      { date: "2025-08-01", type: "적립", amount: 625, desc: "김민수 앨범 진행 보너스" },
                      { date: "2025-07-28", type: "적립", amount: 2500, desc: "월간 활동 보너스" }
                    ].map((transaction, index) => (
                      <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.desc}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}P
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}