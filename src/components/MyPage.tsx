import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { User, Edit, Heart, TrendingUp, Gift, Bell, Shield, CreditCard, Settings, Camera, BarChart3, Palette, Users, DollarSign, Calendar, Star } from "lucide-react";
import { userAPI } from '../services/api';
import { User as UserType, Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from './AdminDashboard';

export function MyPage() {
  const { user } = useAuth();
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [investmentHistory, setInvestmentHistory] = useState<any[]>([]);
  const [followingArtists, setFollowingArtists] = useState<any[]>([]);
  const [pointsData, setPointsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // 사용자 프로필 데이터 가져오기
        const profileResponse = await userAPI.getUserProfile(user.id) as any;
        if (profileResponse.success) {
          setUserData(profileResponse.data);
        }

        // 투자 내역 가져오기
        const investmentResponse = await userAPI.getInvestments(user.id) as any;
        if (investmentResponse.success) {
          setInvestmentHistory(investmentResponse.data || []);
        }

        // 팔로우 아티스트 가져오기
        const followingResponse = await userAPI.getFollowingArtists(user.id) as any;
        if (followingResponse.success) {
          setFollowingArtists(followingResponse.data || []);
        }

        // 포인트 데이터 가져오기
        const pointsResponse = await userAPI.getPoints(user.id) as any;
        if (pointsResponse.success) {
          setPointsData(pointsResponse.data);
        }

      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 타입 가드 함수
  const isAdmin = (role: string | undefined): role is 'admin' => role === 'admin';
  const isArtist = (role: string | undefined): role is 'artist' => role === 'artist';
  const isFan = (role: string | undefined): role is 'fan' => role === 'fan';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 데이터를 불러오는 중...</p>
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

  // AdminDashboard로 돌아가기
  const handleBackFromAdmin = () => {
    setShowAdminDashboard(false);
  };

  // AdminDashboard 표시
  if (showAdminDashboard) {
    return <AdminDashboard onBack={handleBackFromAdmin} />;
  }

  // 사용자 역할에 따른 탭 구성
  const getTabsForRole = () => {
    if (isAdmin(user?.role)) {
      return [
        { value: 'profile', label: '프로필', icon: User },
        { value: 'admin', label: '관리자', icon: Shield },
        { value: 'settings', label: '설정', icon: Settings }
      ];
    } else if (isArtist(user?.role)) {
      return [
        { value: 'profile', label: '프로필', icon: User },
        { value: 'portfolio', label: '포트폴리오', icon: Palette },
        { value: 'analytics', label: '분석', icon: BarChart3 },
        { value: 'settings', label: '설정', icon: Settings }
      ];
    } else {
      return [
        { value: 'profile', label: '프로필', icon: User },
        { value: 'investments', label: '투자 내역', icon: DollarSign },
        { value: 'following', label: '팔로우', icon: Heart },
        { value: 'points', label: '포인트', icon: Gift },
        { value: 'settings', label: '설정', icon: Settings }
      ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={userData?.avatar || user?.avatar} alt={userData?.name || user?.name} />
              <AvatarFallback className="text-xl">{(userData?.name || user?.name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{userData?.name || user?.name || '사용자'}</h1>
              <p className="text-gray-600 mb-2">{userData?.email || user?.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>가입일: {userData?.joinDate || user?.createdAt}</span>
                <Badge className="bg-purple-100 text-purple-800">{user?.role || 'fan'}</Badge>
              </div>
            </div>
            <div className="ml-auto">
              <Button className="mb-2">
                <Edit className="w-4 h-4 mr-2" />
                프로필 편집
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue={tabs[0].value} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">이름</Label>
                    <Input id="name" value={userData?.name || user?.name || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" value={userData?.email || user?.email || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="bio">소개</Label>
                    <Textarea id="bio" value={userData?.bio || ''} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>연락처 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="location">위치</Label>
                    <Input id="location" value={userData?.location || ''} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="website">웹사이트</Label>
                    <Input id="website" value={userData?.website || ''} readOnly />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Tab */}
          {isAdmin(user?.role) && (
            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-semibold mb-4">관리자 대시보드</h3>
                  <p className="text-gray-600 mb-6">시스템 관리 및 통계를 확인하세요.</p>
                  <Button onClick={() => setShowAdminDashboard(true)}>
                    관리자 대시보드 열기
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Investments Tab (Fan only) */}
          {isFan(user?.role) && (
            <TabsContent value="investments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>투자 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  {investmentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>아직 투자 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {investmentHistory.map((investment, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{investment.projectName}</h4>
                            <p className="text-sm text-gray-600">{investment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₩{investment.amount.toLocaleString()}</p>
                            <Badge className={investment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {investment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Following Tab (Fan only) */}
          {isFan(user?.role) && (
            <TabsContent value="following" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>팔로우 중인 아티스트</CardTitle>
                </CardHeader>
                <CardContent>
                  {followingArtists.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>아직 팔로우 중인 아티스트가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followingArtists.map((artist, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={artist.avatar} alt={artist.name} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{artist.name}</h4>
                            <p className="text-sm text-gray-600">{artist.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Points Tab (Fan only) */}
          {isFan(user?.role) && (
            <TabsContent value="points" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{pointsData?.totalPoints || 0}</p>
                    <p className="text-sm text-gray-600">총 포인트</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{pointsData?.availablePoints || 0}</p>
                    <p className="text-sm text-gray-600">사용 가능</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{pointsData?.pendingPoints || 0}</p>
                    <p className="text-sm text-gray-600">대기 중</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">₩{(pointsData?.monthlyEarnings || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">이번 달 수익</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <Label>이메일 알림</Label>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <Label>팔로우 알림</Label>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <Label>투자 알림</Label>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}