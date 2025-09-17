import React, { useState } from "react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Edit, Settings, Camera } from "lucide-react";
import { getFirstChar } from "../utils/typeGuards";
import { useAuth } from "../contexts/AuthContext";
import {
  useUserProfile,
  useUserBackings,
  useFollowingArtists,
  useNotifications,
  useUpdateUserProfile
} from "../lib/api/useUser";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { OverviewTab } from "./MyPage/OverviewTab";
import { InvestmentsTab } from "./MyPage/InvestmentsTab";
import { FollowingTab } from "./MyPage/FollowingTab";
import { PointsTab } from "./MyPage/PointsTab";
import { SettingsTab } from "./MyPage/SettingsTab";
import {
  UserProfile,
  BackingsResponse,
  FollowingResponse,
  NotificationsResponse,
  EditData
} from "./MyPage/types";

export function MyPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    name: '',
    username: '',
    email: '',
    bio: ''
  });

  // API 훅들
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError
  } = useUserProfile(user?.id || '');

  const {
    data: backingsData,
    isLoading: backingsLoading,
    error: backingsError
  } = useUserBackings(user?.id || '');

  const {
    data: followingData,
    isLoading: followingLoading,
    error: followingError
  } = useFollowingArtists(user?.id || '');

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError
  } = useNotifications();

  const updateProfileMutation = useUpdateUserProfile();

  // 로딩 상태
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage
            error={profileError}
          />
        </div>
      </div>
    );
  }

  const userData: UserProfile = (userProfile as UserProfile) || {
    id: user?.id || '',
    name: user?.name || '',
    username: user?.email?.split('@')[0] || '', // email에서 username 추출
    email: user?.email || '',
    avatar: user?.avatar,
    bio: user?.bio,
    createdAt: user?.createdAt || new Date().toISOString(),
    points: {
      available: 0,
      total: 0,
      pending: 0
    },
    notificationSettings: {
      funding: true,
      artist: true,
      points: false
    }
  };

  // 프로필 수정 핸들러
  const handleEditProfile = () => {
    if (isEditing) {
      updateProfileMutation.mutate({
        userId: user?.id || '',
        data: editData
      });
      setIsEditing(false);
    } else {
      setEditData({
        name: userData?.name || '',
        username: userData?.username || '',
        email: userData?.email || '',
        bio: userData?.bio || ''
      });
      setIsEditing(true);
    }
  };

  // 언팔로우 핸들러
  const handleUnfollow = (artistId: string) => {
    // TODO: 언팔로우 API 호출 구현
    console.log('언팔로우:', artistId);
  };

  // 편집 데이터 변경 핸들러
  const handleEditDataChange = (data: Partial<EditData>) => {
    setEditData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={userData?.avatar} alt={userData?.name} />
                  <AvatarFallback className="text-2xl">{getFirstChar(userData?.name || '')}</AvatarFallback>
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
                  <h1 className="text-3xl font-bold">{userData?.name || '사용자'}</h1>
                  <Badge>인증 회원</Badge>
                </div>
                <p className="text-gray-600 mb-2">@{userData?.username || 'username'}</p>
                <p className="text-gray-700 mb-4">{userData?.bio || '소개를 작성해주세요.'}</p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <span>📍 {userData?.location || '위치 미설정'}</span>
                  <span>📅 가입일: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '알 수 없음'}</span>
                  {userData?.website && (
                    <span>🌐 <a href={userData.website} className="text-blue-600 hover:underline">블로그</a></span>
                  )}
                </div>

                <div className="flex justify-center md:justify-start gap-3">
                  <Button onClick={handleEditProfile} disabled={updateProfileMutation.isPending}>
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? '저장' : '프로필 수정'}
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
          <TabsContent value="overview">
            <OverviewTab
              backingsData={backingsData as BackingsResponse}
              backingsLoading={backingsLoading}
              backingsError={backingsError}
              notificationsData={notificationsData as NotificationsResponse}
              notificationsLoading={notificationsLoading}
              notificationsError={notificationsError}
            />
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <InvestmentsTab
              backingsData={backingsData as BackingsResponse}
              backingsLoading={backingsLoading}
              backingsError={backingsError}
            />
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following">
            <FollowingTab
              followingData={followingData as FollowingResponse}
              followingLoading={followingLoading}
              followingError={followingError}
              onUnfollow={handleUnfollow}
            />
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points">
            <PointsTab userData={userData} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab
              userData={userData}
              isEditing={isEditing}
              editData={editData}
              onEditDataChange={handleEditDataChange}
              onSaveProfile={handleEditProfile}
              onCancelEdit={() => setIsEditing(false)}
              isSaving={updateProfileMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}