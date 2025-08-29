import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Heart, TrendingUp, Wallet, Star, Calendar, DollarSign, BarChart3, Users, MessageCircle, ExternalLink, Eye, Target } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { userAPI, fundingAPI } from '../services/api';
import { fundingService } from '../services/fundingService';

// 모듈화된 컴포넌트들 import
import { FundingHistoryFilter } from './ui/FundingHistoryFilter';
import { FundingStatsCards } from './ui/FundingStatsCards';
import { ArtistFundingSection } from './ui/ArtistFundingSection';
import { ProjectDetailModal } from './ui/ProjectDetailModal';
import { LoadingSkeleton } from './ui/LoadingSkeleton';

// 타입들 import
import {
  ArtistFundingHistory,
  FundingHistoryFilter as FilterType
} from '../types/funding';

// 유틸리티 함수들 import
import { getFilteredFundingHistory } from '../utils/fundingUtils';
import { getCurrentUserId, isAuthenticated } from '../utils/auth';

// 타입 정의
interface FanData {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  totalInvestment: number;
  totalReturns: number;
  activeInvestments: number;
  followingArtists: number;
  pointBalance: number;
}

interface Investment {
  id: number;
  projectTitle: string;
  artistName: string;
  artistAvatar?: string;
  status: string;
  category: string;
  investmentAmount: number;
  expectedReturn: number;
  currentReturn: number;
  progress: number;
  investmentDate: string;
  updates: Array<{
    title: string;
    date: string;
    content: string;
    usedAmount: number;
    totalBudget: number;
  }>;
}

interface FollowingArtist {
  id: number;
  name: string;
  avatar?: string;
  category: string;
  latestUpdate: string;
  isActive: boolean;
  followers: number;
}

export function FanMyPage() {
  const [fanData, setFanData] = useState<FanData | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [followingArtists, setFollowingArtists] = useState<FollowingArtist[]>([]);
  const [artistFundingHistory, setArtistFundingHistory] = useState<ArtistFundingHistory[]>([]);
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvestment, setSelectedInvestment] = useState<number | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null);

  // 펀딩 히스토리 필터링 상태
  const [fundingHistoryFilter, setFundingHistoryFilter] = useState<FilterType>({
    status: 'all',
    category: 'all',
    sortBy: 'date'
  });

  // 프로젝트 상세보기 모달 상태
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // 메모이제이션된 값들
  const filteredFundingHistory = useMemo(() =>
    getFilteredFundingHistory(artistFundingHistory, fundingHistoryFilter),
    [artistFundingHistory, fundingHistoryFilter]
  );

  const selectedInvestmentData = useMemo(() =>
    investments.find(inv => inv.id === selectedInvestment),
    [investments, selectedInvestment]
  );

  // 콜백 함수들
  const fetchArtistFundingHistory = useCallback(async (userId: string) => {
    try {
      const response = await fundingService.getFollowingArtistsFundingHistory(userId, fundingHistoryFilter);
      setArtistFundingHistory(response);
    } catch (error) {
      console.error('Failed to fetch artist funding history:', error);
      setError('펀딩 히스토리를 불러오는데 실패했습니다.');
    }
  }, [fundingHistoryFilter]);

  const handleViewProjectDetails = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setIsProjectModalOpen(true);
  }, []);

  const handleCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
    setSelectedProjectId(null);
  }, []);

  const handleInvestmentSelect = useCallback((investmentId: number) => {
    setSelectedInvestment(investmentId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 인증 확인
        if (!isAuthenticated()) {
          setError('로그인이 필요합니다.');
          setLoading(false);
          return;
        }

        const userId = getCurrentUserId();
        if (!userId) {
          setError('사용자 정보를 가져올 수 없습니다.');
          setLoading(false);
          return;
        }

        // API에서 데이터 가져오기
        const [fanDataRes, investmentsRes, followingArtistsRes] = await Promise.all([
          userAPI.getUserProfile(userId),
          userAPI.getInvestments(userId),
          userAPI.getFollowingArtists(userId)
        ]);

        setFanData(fanDataRes as any);
        setInvestments(investmentsRes as any[]);
        setFollowingArtists(followingArtistsRes as any[]);

        // 아티스트 펀딩 히스토리 데이터 가져오기
        await fetchArtistFundingHistory(userId);
      } catch (error) {
        console.error('Failed to fetch fan data:', error);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchArtistFundingHistory]);

  // 필터 변경 시 데이터 다시 가져오기
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId && isAuthenticated()) {
      fetchArtistFundingHistory(userId);
    }
  }, [fundingHistoryFilter, fetchArtistFundingHistory]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "진행중": return "bg-blue-100 text-blue-800";
      case "완료": return "bg-green-100 text-green-800";
      case "보류": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case "음악": return "bg-blue-500";
      case "미술": return "bg-purple-500";
      case "문학": return "bg-green-500";
      case "공연": return "bg-red-500";
      default: return "bg-gray-500";
    }
  }, []);

  // 에러 상태 표시
  if (error && !fanData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton type="profile" />
          <LoadingSkeleton type="stats" count={5} />
          <div className="mt-8">
            <LoadingSkeleton type="list" count={3} />
          </div>
        </div>
      </div>
    );
  }

  // fanData가 없으면 로딩 상태 유지
  if (!fanData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={fanData.avatar} alt={fanData.name} />
                <AvatarFallback className="text-xl">{fanData.name?.charAt(0) || 'U'}</AvatarFallback>
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
                  <p className="text-2xl font-bold text-gray-900">₩{fanData.totalInvestment?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-600">총 투자금액</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">₩{fanData.totalReturns?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-600">총 수익</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{fanData.activeInvestments || 0}</p>
                  <p className="text-sm text-gray-600">진행중인 투자</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{fanData.followingArtists || 0}</p>
                  <p className="text-sm text-gray-600">팔로잉 아티스트</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Wallet className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{fanData.pointBalance?.toLocaleString() || '0'}P</p>
                  <p className="text-sm text-gray-600">보유 포인트</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="investments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="investments">투자 현황</TabsTrigger>
              <TabsTrigger value="following">팔로잉 아티스트</TabsTrigger>
              <TabsTrigger value="funding-history">펀딩 히스토리</TabsTrigger>
              <TabsTrigger value="points">포인트 관리</TabsTrigger>
            </TabsList>

            {/* Investments Tab */}
            <TabsContent value="investments" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Investment List */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">내 투자 목록</h2>
                  {investments.length > 0 ? (
                    investments.map((investment) => (
                      <Card
                        key={investment.id}
                        className={`cursor-pointer transition-all ${selectedInvestment === investment.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
                          }`}
                        onClick={() => handleInvestmentSelect(investment.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={investment.artistAvatar} alt={investment.artistName} />
                                <AvatarFallback>{investment.artistName?.charAt(0) || 'A'}</AvatarFallback>
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
                              <p className="font-semibold">₩{investment.investmentAmount?.toLocaleString() || '0'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">예상 수익</p>
                              <p className="font-semibold text-blue-600">₩{investment.expectedReturn?.toLocaleString() || '0'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">현재 수익</p>
                              <p className={`font-semibold ${(investment.currentReturn || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                ₩{(investment.currentReturn || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>프로젝트 진행률</span>
                              <span>{investment.progress || 0}%</span>
                            </div>
                            <Progress value={investment.progress || 0} className="h-2" />
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
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>아직 투자한 프로젝트가 없습니다.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Investment Details */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">투자 세부사항</h2>
                  {selectedInvestmentData ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {selectedInvestmentData.projectTitle}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedInvestmentData.updates?.map((update, index) => (
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
                                <span>₩{(update.usedAmount || 0).toLocaleString()} / ₩{(update.totalBudget || 0).toLocaleString()}</span>
                              </div>
                              <Progress value={((update.usedAmount || 0) / (update.totalBudget || 1)) * 100} className="h-2" />
                            </div>

                            {index < (selectedInvestmentData.updates?.length || 0) - 1 && <Separator />}
                          </div>
                        )) || []}
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
              {followingArtists.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followingArtists.map((artist) => (
                    <Card key={artist.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={artist.avatar} alt={artist.name} />
                              <AvatarFallback>{artist.name?.charAt(0) || 'A'}</AvatarFallback>
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
                            <span>{artist.followers || 0}</span>
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
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>아직 팔로잉하는 아티스트가 없습니다.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Funding History Tab - 모듈화된 컴포넌트 사용 */}
            <TabsContent value="funding-history" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">팔로잉 아티스트 펀딩 히스토리</h2>

                {/* 필터 UI */}
                <FundingHistoryFilter
                  filter={fundingHistoryFilter}
                  onFilterChange={setFundingHistoryFilter}
                />
              </div>

              {/* 통계 정보 */}
              <FundingStatsCards filteredHistory={filteredFundingHistory} />

              {filteredFundingHistory.length > 0 ? (
                <div className="space-y-6">
                  {filteredFundingHistory.map((artist) => (
                    <ArtistFundingSection
                      key={artist.artistId}
                      artist={artist}
                      onViewProjectDetails={handleViewProjectDetails}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>팔로잉하는 아티스트의 펀딩 프로젝트가 없습니다.</p>
                    <p className="text-sm mt-2">아티스트를 팔로우하고 그들의 프로젝트를 응원해보세요!</p>
                  </CardContent>
                </Card>
              )}
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
                        {(fanData.pointBalance || 0).toLocaleString()}P
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
                        ...(pointsHistory || [])
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

      {/* 프로젝트 상세보기 모달 */}
      <ProjectDetailModal
        projectId={selectedProjectId}
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
      />
    </>
  );
}