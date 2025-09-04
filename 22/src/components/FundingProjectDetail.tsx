import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Calendar, 
  Target, 
  Users, 
  Clock,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Receipt
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { PaymentModal } from "./PaymentModal";
import { 
  FundingProject, 
  calculateFundingProgress, 
  calculateDaysLeft,
  getFundingStatus 
} from "../utils/funding";

interface FundingProjectDetailProps {
  projectId: number;
  onBack: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

// 모의 프로젝트 데이터
const mockProject: FundingProject = {
  id: 1,
  title: "정규앨범 '도시의 밤' 제작",
  description: "10년간의 길거리 공연 경험을 담은 첫 정규앨범입니다. 도시의 외로움과 희망을 노래로 전달하고 싶습니다. 이번 앨범은 총 10곡으로 구성되며, 각각의 곡은 도시에서 살아가는 사람들의 다양한 이야기를 담고 있습니다.",
  artistId: 1,
  artistName: "김민수",
  artistAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  targetAmount: 3000000,
  currentAmount: 2250000,
  backers: 45,
  startDate: "2025-07-01",
  endDate: "2025-08-31",
  status: "active",
  category: "음악",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
  rewards: [
    {
      id: 1,
      amount: 10000,
      title: "디지털 앨범",
      description: "완성된 디지털 앨범 (MP3, FLAC 파일)",
      backers: 15,
      estimatedDelivery: "2025-09-30"
    },
    {
      id: 2,
      amount: 30000,
      title: "CD + 포토북",
      description: "피지컬 CD + 32페이지 아티스트 포토북",
      backers: 20,
      estimatedDelivery: "2025-10-15"
    },
    {
      id: 3,
      amount: 50000,
      title: "한정판 바이닐",
      description: "한정판 바이닐 LP + 작가 사인",
      backers: 8,
      estimatedDelivery: "2025-11-30",
      isLimited: true,
      limitCount: 50
    },
    {
      id: 4,
      amount: 100000,
      title: "VIP 콘서트 티켓",
      description: "완성 기념 콘서트 VIP석 + 만남의 시간",
      backers: 2,
      estimatedDelivery: "2025-12-20",
      isLimited: true,
      limitCount: 10
    }
  ],
  executionPlan: [
    {
      id: 1,
      phase: "녹음 작업",
      description: "스튜디오 대여 및 녹음 엔지니어 비용",
      plannedAmount: 800000,
      usedAmount: 800000,
      status: "completed",
      startDate: "2025-07-01",
      endDate: "2025-07-31"
    },
    {
      id: 2,
      phase: "믹싱/마스터링",
      description: "전문 믹싱 엔지니어 및 마스터링 비용",
      plannedAmount: 500000,
      usedAmount: 400000,
      status: "in-progress",
      startDate: "2025-08-01"
    },
    {
      id: 3,
      phase: "뮤직비디오 제작",
      description: "타이틀곡 뮤직비디오 촬영 및 편집",
      plannedAmount: 700000,
      usedAmount: 600000,
      status: "in-progress",
      startDate: "2025-08-05"
    },
    {
      id: 4,
      phase: "마케팅/홍보",
      description: "온라인 광고 및 홍보물 제작",
      plannedAmount: 400000,
      usedAmount: 0,
      status: "pending"
    },
    {
      id: 5,
      phase: "앨범 제작",
      description: "CD/바이닐 제작 및 포장",
      plannedAmount: 600000,
      usedAmount: 0,
      status: "pending"
    }
  ],
  updates: [
    {
      id: 1,
      date: "2025-08-10",
      title: "녹음 작업 완료!",
      content: "드디어 모든 곡의 녹음이 끝났습니다. 총 10곡으로 구성되며, 믹싱 작업에 들어갑니다. 예상보다 빠른 진행을 보이고 있어 후원자분들께 좋은 소식을 전할 수 있을 것 같습니다.",
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=300&fit=crop",
      likes: 23,
      comments: 8,
      type: "milestone"
    },
    {
      id: 2,
      date: "2025-08-05",
      title: "뮤직비디오 촬영 완료",
      content: "타이틀곡 '도시의 밤' 뮤직비디오 촬영을 마쳤습니다. 서울 시내 야경을 배경으로 촬영했으며, 편집 작업을 시작합니다.",
      likes: 31,
      comments: 12,
      type: "general"
    },
    {
      id: 3,
      date: "2025-08-01",
      title: "예산 사용 보고",
      content: "녹음 작업에 80만원을 사용했습니다. 계획된 예산 내에서 진행되었으며, 상세한 영수증은 첨부 파일을 확인해주세요.",
      likes: 15,
      comments: 4,
      type: "expense"
    }
  ],
  expenses: [
    {
      id: 1,
      date: "2025-07-15",
      category: "녹음비",
      description: "스튜디오 A 대여 (7일)",
      amount: 500000,
      status: "paid"
    },
    {
      id: 2,
      date: "2025-07-20",
      category: "녹음비",
      description: "녹음 엔지니어 비용",
      amount: 300000,
      status: "paid"
    },
    {
      id: 3,
      date: "2025-08-05",
      category: "뮤직비디오",
      description: "촬영 장비 대여",
      amount: 400000,
      status: "paid"
    },
    {
      id: 4,
      date: "2025-08-10",
      category: "뮤직비디오",
      description: "촬영팀 인건비",
      amount: 200000,
      status: "paid"
    }
  ]
};

export function FundingProjectDetail({ 
  projectId, 
  onBack, 
  isLoggedIn, 
  onLoginRequired 
}: FundingProjectDetailProps) {
  const [project] = useState<FundingProject>(mockProject);
  const [selectedReward, setSelectedReward] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const progress = calculateFundingProgress(project.currentAmount, project.targetAmount);
  const daysLeft = calculateDaysLeft(project.endDate);
  const fundingStatus = getFundingStatus(project.currentAmount, project.targetAmount, project.endDate);

  const handleSupportClick = (rewardId?: number) => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    
    setSelectedReward(rewardId || null);
    setShowPaymentModal(true);
  };

  const getStatusBadge = () => {
    switch (fundingStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />펀딩 성공</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />펀딩 실패</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />진행중</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="cursor-pointer">
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsLiked(!isLiked)}
            className={`cursor-pointer ${isLiked ? 'text-red-500' : ''}`}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            관심
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Header */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-80 rounded-t-lg overflow-hidden">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-500">{project.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusBadge()}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={project.artistAvatar} alt={project.artistName} />
                      <AvatarFallback>{project.artistName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                      <p className="text-gray-600">by {project.artistName}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{project.description}</p>
                  
                  {/* Funding Progress */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900">
                        ₩{project.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-600">
                        목표 ₩{project.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
                        <p className="text-sm text-gray-600">달성률</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{project.backers}</p>
                        <p className="text-sm text-gray-600">후원자</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{daysLeft}</p>
                        <p className="text-sm text-gray-600">일 남음</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="updates" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="updates">프로젝트 소식</TabsTrigger>
                <TabsTrigger value="execution">집행 현황</TabsTrigger>
                <TabsTrigger value="expenses">비용 내역</TabsTrigger>
              </TabsList>

              <TabsContent value="updates" className="space-y-4">
                {project.updates.map((update) => (
                  <Card key={update.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{update.title}</h3>
                          <p className="text-sm text-gray-600">{update.date}</p>
                        </div>
                        <Badge variant={
                          update.type === 'milestone' ? 'default' :
                          update.type === 'expense' ? 'secondary' : 'outline'
                        }>
                          {update.type === 'milestone' ? '마일스톤' :
                           update.type === 'expense' ? '비용 보고' : '일반'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4">{update.content}</p>
                      {update.image && (
                        <div className="mb-4">
                          <ImageWithFallback
                            src={update.image}
                            alt="업데이트 이미지"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
                          <Heart className="w-4 h-4" />
                          {update.likes}
                        </button>
                        <span>댓글 {update.comments}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="execution" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>집행 계획</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.executionPlan.map((plan) => (
                      <div key={plan.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{plan.phase}</h4>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                          </div>
                          <Badge className={
                            plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                            plan.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {plan.status === 'completed' ? '완료' :
                             plan.status === 'in-progress' ? '진행중' : '대기'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>예산 사용</span>
                            <span>₩{plan.usedAmount.toLocaleString()} / ₩{plan.plannedAmount.toLocaleString()}</span>
                          </div>
                          <Progress value={(plan.usedAmount / plan.plannedAmount) * 100} className="h-2" />
                        </div>
                        {plan.startDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            {plan.startDate} {plan.endDate && `- ${plan.endDate}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      비용 사용 내역
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.expenses.map((expense) => (
                        <div key={expense.id} className="flex justify-between items-center py-3 border-b last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{expense.description}</h4>
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{expense.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₩{expense.amount.toLocaleString()}
                            </p>
                            <Badge className={
                              expense.status === 'paid' ? 'bg-green-100 text-green-800' :
                              expense.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {expense.status === 'paid' ? '지출완료' :
                               expense.status === 'approved' ? '승인됨' : '대기중'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>총 사용 금액</span>
                      <span>₩{project.expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Support */}
            {fundingStatus === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle>빠른 후원</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full h-12 cursor-pointer"
                    onClick={() => handleSupportClick()}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    지금 후원하기
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSupportClick()}
                      className="cursor-pointer"
                    >
                      ₩10,000
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSupportClick()}
                      className="cursor-pointer"
                    >
                      ₩30,000
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSupportClick()}
                      className="cursor-pointer"
                    >
                      ₩50,000
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rewards */}
            <Card>
              <CardHeader>
                <CardTitle>후원 리워드</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.rewards.map((reward) => (
                  <div 
                    key={reward.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSupportClick(reward.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-blue-600">
                        ₩{reward.amount.toLocaleString()}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{reward.backers}명 선택</div>
                        {reward.isLimited && (
                          <Badge variant="secondary" className="text-xs">
                            한정 {reward.limitCount}개
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{reward.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>예상 전달: {reward.estimatedDelivery}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>프로젝트 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span>목표 금액: ₩{project.targetAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>후원자: {project.backers}명</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>기간: {project.startDate} ~ {project.endDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                  <span>카테고리: {project.category}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          project={project}
          selectedReward={selectedReward ? project.rewards.find(r => r.id === selectedReward) : undefined}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            // 결제 성공 후 페이지 새로고침 또는 상태 업데이트
          }}
        />
      )}
    </div>
  );
}