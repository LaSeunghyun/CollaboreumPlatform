import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, MessageSquare, Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";

// Mock Data
const inquiries = [
  {
    id: 1,
    artist: "김민수",
    artistAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "펀딩",
    subject: "프로젝트 승인 지연 문의",
    content: "제출한 정규앨범 프로젝트가 일주일째 검토 중 상태입니다. 언제 승인 결과를 받을 수 있을까요?",
    status: "대기",
    priority: "높음",
    date: "2025-08-09",
    assignedTo: null
  },
  {
    id: 2,
    artist: "이지영",
    artistAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=40&h=40&fit=crop&crop=face",
    category: "기술지원",
    subject: "파일 업로드 오류",
    content: "포트폴리오 이미지를 업로드할 때 계속 오류가 발생합니다. 5MB 이하인데도 업로드가 안됩니다.",
    status: "진행중",
    priority: "중간",
    date: "2025-08-08",
    assignedTo: "김관리자"
  },
  {
    id: 3,
    artist: "박소영",
    artistAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    category: "정산",
    subject: "수익 분배 일정 문의",
    content: "완료된 프로젝트의 수익 분배가 언제 이루어지는지 궁금합니다.",
    status: "완료",
    priority: "낮음",
    date: "2025-08-07",
    assignedTo: "이관리자"
  }
];

const matchingRequests = [
  {
    id: 1,
    requester: "김민수",
    requesterCategory: "싱어송라이터",
    requestType: "협업",
    description: "정규앨범 작업 중 피아노 세션을 도와줄 연주자를 찾고 있습니다.",
    preferredCategory: "음악",
    budget: "200,000원",
    timeline: "2주",
    status: "매칭중",
    applications: 3,
    date: "2025-08-08"
  },
  {
    id: 2,
    requester: "이지영",
    requesterCategory: "현대미술가",
    requestType: "멘토링",
    description: "개인전 기획과 마케팅에 대해 조언을 구하고 있습니다.",
    preferredCategory: "미술",
    budget: "협의",
    timeline: "1개월",
    status: "대기",
    applications: 0,
    date: "2025-08-09"
  }
];

const financialData = [
  {
    month: "2025-07",
    totalRevenue: 15420000,
    platformFee: 1542000,
    artistPayouts: 10794000,
    investorReturns: 3084000,
    pendingPayments: 2100000
  },
  {
    month: "2025-06",
    totalRevenue: 12380000,
    platformFee: 1238000,
    artistPayouts: 8666000,
    investorReturns: 2476000,
    pendingPayments: 1650000
  }
];

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [inquiryFilter, setInquiryFilter] = useState("전체");

  const filteredInquiries = inquiries.filter(inquiry => 
    inquiryFilter === "전체" || inquiry.status === inquiryFilter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600">플랫폼 운영 현황을 관리하고 모니터링하세요</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="inquiries">문의사항</TabsTrigger>
            <TabsTrigger value="matching">매칭관리</TabsTrigger>
            <TabsTrigger value="finance">재정관리</TabsTrigger>
            <TabsTrigger value="users">사용자관리</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">미처리 문의</p>
                      <p className="text-2xl font-bold text-red-600">
                        {inquiries.filter(i => i.status === "대기").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">매칭 대기</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {matchingRequests.filter(r => r.status === "대기").length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">이번 달 매출</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₩{(financialData[0].totalRevenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">플랫폼 수수료</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₩{(financialData[0].platformFee / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 문의사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inquiries.slice(0, 3).map(inquiry => (
                      <div key={inquiry.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={inquiry.artistAvatar} alt={inquiry.artist} />
                          <AvatarFallback>{inquiry.artist.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{inquiry.subject}</p>
                          <p className="text-xs text-gray-600">by {inquiry.artist}</p>
                        </div>
                        <Badge 
                          className={
                            inquiry.status === "대기" ? "bg-red-100 text-red-800" :
                            inquiry.status === "진행중" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }
                        >
                          {inquiry.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>매칭 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {matchingRequests.map(request => (
                      <div key={request.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{request.requestType}</h4>
                          <Badge 
                            className={
                              request.status === "대기" ? "bg-red-100 text-red-800" :
                              "bg-blue-100 text-blue-800"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{request.requester} • {request.applications}개 지원</p>
                        <p className="text-sm">{request.description.substring(0, 60)}...</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">문의사항 관리</h2>
              <div className="flex gap-3">
                <Select value={inquiryFilter} onValueChange={setInquiryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="전체">전체</SelectItem>
                    <SelectItem value="대기">대기</SelectItem>
                    <SelectItem value="진행중">진행중</SelectItem>
                    <SelectItem value="완료">완료</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>아티스트</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>우선순위</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={inquiry.artistAvatar} alt={inquiry.artist} />
                              <AvatarFallback>{inquiry.artist.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{inquiry.artist}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{inquiry.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{inquiry.subject}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            inquiry.priority === "높음" ? "bg-red-100 text-red-800" :
                            inquiry.priority === "중간" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {inquiry.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            inquiry.status === "대기" ? "bg-red-100 text-red-800" :
                            inquiry.status === "진행중" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {inquiry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {inquiry.assignedTo || <span className="text-gray-400">미배정</span>}
                        </TableCell>
                        <TableCell>{inquiry.date}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matching Tab */}
          <TabsContent value="matching" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">아티스트 매칭 관리</h2>
              <Button>
                새 매칭 생성
              </Button>
            </div>

            <div className="space-y-6">
              {matchingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">{request.requestType}</h3>
                          <Badge className={
                            request.status === "대기" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">
                          요청자: <strong>{request.requester}</strong> ({request.requesterCategory})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{request.date}</p>
                        <p className="text-sm text-blue-600">{request.applications}개 지원</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{request.description}</p>

                    <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">희망 분야:</span>
                        <p className="text-gray-600">{request.preferredCategory}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">예산:</span>
                        <p className="text-gray-600">{request.budget}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">기간:</span>
                        <p className="text-gray-600">{request.timeline}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">지원자 보기</Button>
                        <Button size="sm" variant="outline">매칭 제안</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">승인</Button>
                        <Button size="sm" variant="outline">보류</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Finance Tab */}
          <TabsContent value="finance" className="space-y-6">
            <h2 className="text-2xl font-bold">재정 관리</h2>
            
            <div className="space-y-6">
              {financialData.map((data, index) => (
                <Card key={data.month}>
                  <CardHeader>
                    <CardTitle>{data.month} 재정 현황</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">총 매출</p>
                        <p className="text-xl font-bold text-blue-600">
                          ₩{(data.totalRevenue / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
                        <p className="text-xl font-bold text-green-600">
                          ₩{(data.platformFee / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">아티스트 정산</p>
                        <p className="text-xl font-bold text-purple-600">
                          ₩{(data.artistPayouts / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">투자자 수익</p>
                        <p className="text-xl font-bold text-yellow-600">
                          ₩{(data.investorReturns / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">보류 결제</p>
                        <p className="text-xl font-bold text-red-600">
                          ₩{(data.pendingPayments / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-500">사용자 관리 기능을 준비 중입니다...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}