import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { User, Edit, Heart, TrendingUp, Gift, Bell, Shield, CreditCard, Settings, Camera } from "lucide-react";

const userData = {
  name: "김지현",
  email: "jihyun.kim@example.com",
  username: "@jihyunkim",
  bio: "음악과 예술을 사랑하는 후원자입니다. 젊은 아티스트들의 꿈을 응원합니다.",
  joinDate: "2024년 3월",
  location: "서울, 대한민국",
  website: "https://jihyunkim.blog",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=150&h=150&fit=crop&crop=face"
};

const investmentHistory = [
  {
    id: 1,
    project: "김민수 정규앨범",
    artist: "김민수",
    invested: 50000,
    returned: 12500,
    status: "active",
    date: "2025-07-15"
  },
  {
    id: 2,
    project: "이지영 개인전",
    artist: "이지영",
    invested: 30000,
    returned: 36000,
    status: "completed",
    date: "2025-06-10"
  },
  {
    id: 3,
    project: "박소영 소설집",
    artist: "박소영",
    invested: 25000,
    returned: 31250,
    status: "completed",
    date: "2025-05-20"
  }
];

const followingArtists = [
  {
    name: "김민수",
    category: "싱어송라이터",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
  },
  {
    name: "이지영",
    category: "현대미술가",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=50&h=50&fit=crop&crop=face"
  },
  {
    name: "박소영",
    category: "소설가",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
  }
];

const pointsData = {
  totalPoints: 125430,
  availablePoints: 89450,
  pendingPoints: 35980,
  monthlyEarnings: 23400
};

export function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{userData.name}</h1>
                  <Badge>인증 회원</Badge>
                </div>
                <p className="text-gray-600 mb-2">{userData.username}</p>
                <p className="text-gray-700 mb-4">{userData.bio}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <span>📍 {userData.location}</span>
                  <span>📅 가입일: {userData.joinDate}</span>
                  <span>🌐 <a href={userData.website} className="text-blue-600 hover:underline">블로그</a></span>
                </div>
                
                <div className="flex justify-center md:justify-start gap-3">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    프로필 수정
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    설정
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="investments">투자 내역</TabsTrigger>
            <TabsTrigger value="following">팔로잉</TabsTrigger>
            <TabsTrigger value="points">포인트</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-1">총 투자 금액</h3>
                  <p className="text-2xl font-bold text-blue-600">₩105,000</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-1">누적 수익</h3>
                  <p className="text-2xl font-bold text-green-600">+₩17,750</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-1">후원 프로젝트</h3>
                  <p className="text-2xl font-bold text-purple-600">3개</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">김민수의 정규앨범에 50,000원 후원</span>
                    <span className="text-xs text-gray-500 ml-auto">2일 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">이지영 개인전에서 6,000포인트 수익 발생</span>
                    <span className="text-xs text-gray-500 ml-auto">1주 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm">박소영 작가 새 팔로우</span>
                    <span className="text-xs text-gray-500 ml-auto">2주 전</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>투자 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentHistory.map((investment) => (
                    <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{investment.project}</h4>
                          <p className="text-sm text-gray-600">by {investment.artist}</p>
                        </div>
                        <Badge 
                          className={
                            investment.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {investment.status === 'completed' ? '완료' : '진행중'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">투자금:</span>
                          <p className="font-medium">₩{investment.invested.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">수익:</span>
                          <p className={`font-medium ${
                            investment.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {investment.status === 'completed' ? '+' : '예상 '}
                            ₩{investment.returned.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">투자일:</span>
                          <p className="font-medium">{investment.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>팔로잉 아티스트 ({followingArtists.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {followingArtists.map((artist, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={artist.avatar} alt={artist.name} />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{artist.name}</h4>
                          <p className="text-sm text-gray-600">{artist.category}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        언팔로우
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>포인트 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">사용 가능 포인트</p>
                    <p className="text-3xl font-bold text-blue-600">{pointsData.availablePoints.toLocaleString()}P</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-gray-600">총 적립</p>
                      <p className="font-bold">{pointsData.totalPoints.toLocaleString()}P</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-gray-600">대기 중</p>
                      <p className="font-bold">{pointsData.pendingPoints.toLocaleString()}P</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>포인트 활용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-3" />
                    새 프로젝트에 투자하기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="w-4 h-4 mr-3" />
                    굿즈샵에서 사용하기
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCard className="w-4 h-4 mr-3" />
                    현금으로 전환하기
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="funding-notifications">펀딩 프로젝트 알림</Label>
                    <p className="text-sm text-gray-600">새로운 펀딩 프로젝트 소식을 받습니다</p>
                  </div>
                  <Switch id="funding-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="artist-notifications">팔로잉 아티스트 알림</Label>
                    <p className="text-sm text-gray-600">팔로잉 아티스트의 새 소식을 받습니다</p>
                  </div>
                  <Switch id="artist-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="point-notifications">포인트 적립 알림</Label>
                    <p className="text-sm text-gray-600">포인트 적립 시 알림을 받습니다</p>
                  </div>
                  <Switch id="point-notifications" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>계정 정보 수정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" defaultValue={userData.name} />
                  </div>
                  <div>
                    <Label htmlFor="username">사용자명</Label>
                    <Input id="username" defaultValue={userData.username} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" defaultValue={userData.email} />
                </div>
                
                <div>
                  <Label htmlFor="bio">소개</Label>
                  <Textarea id="bio" defaultValue={userData.bio} rows={3} />
                </div>
                
                <Button>변경 사항 저장</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}