import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/shared/ui/Badge";
import { Separator } from "@/shared/ui/Separator";
import {
  Bell,
  User,
  Shield,
  Mail,
  Smartphone,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { UserProfile, EditData } from './types';
import { useUpdateUserProfile } from '../../lib/api/useUser';

interface SettingsTabProps {
  userData: UserProfile;
  isEditing: boolean;
  editData: EditData;
  onEditDataChange: (data: Partial<EditData>) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
  isSaving: boolean;
}

export function SettingsTab({
  userData,
  isEditing,
  editData,
  onEditDataChange,
  onSaveProfile,
  onCancelEdit,
  isSaving
}: SettingsTabProps) {
  const [notificationSettings, setNotificationSettings] = useState({
    funding: userData?.notificationSettings?.funding ?? true,
    artist: userData?.notificationSettings?.artist ?? true,
    points: userData?.notificationSettings?.points ?? false,
    email: true,
    push: false
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const updateProfileMutation = useUpdateUserProfile();

  // 알림 설정 변경 핸들러
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 알림 설정 저장
  const handleSaveNotificationSettings = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        userId: userData?.id || '',
        data: {
          notificationSettings
        }
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
        } catch {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 성공/에러 메시지 */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">설정이 저장되었습니다.</span>
        </div>
      )}

      {showError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">설정 저장에 실패했습니다.</span>
        </div>
      )}

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 알림 채널 */}
          <div>
            <h4 className="font-medium mb-4">알림 채널</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <Label htmlFor="email-notifications">이메일 알림</Label>
                    <p className="text-sm text-gray-600">이메일로 알림을 받습니다</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.email}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <Label htmlFor="push-notifications">푸시 알림</Label>
                    <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.push}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('push', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* 알림 유형 */}
          <div>
            <h4 className="font-medium mb-4">알림 유형</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <Label htmlFor="funding-notifications">펀딩 프로젝트 알림</Label>
                    <p className="text-sm text-gray-600">새로운 펀딩 프로젝트 소식을 받습니다</p>
                  </div>
                </div>
                <Switch
                  id="funding-notifications"
                  checked={notificationSettings.funding}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('funding', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div>
                    <Label htmlFor="artist-notifications">팔로잉 아티스트 알림</Label>
                    <p className="text-sm text-gray-600">팔로잉 아티스트의 새 소식을 받습니다</p>
                  </div>
                </div>
                <Switch
                  id="artist-notifications"
                  checked={notificationSettings.artist}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('artist', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div>
                    <Label htmlFor="point-notifications">포인트 적립 알림</Label>
                    <p className="text-sm text-gray-600">포인트 적립 시 알림을 받습니다</p>
                  </div>
                </div>
                <Switch
                  id="point-notifications"
                  checked={notificationSettings.points}
                  onCheckedChange={(checked: boolean) => handleNotificationChange('points', checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveNotificationSettings}
              disabled={updateProfileMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? '저장 중...' : '알림 설정 저장'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 계정 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            계정 정보 수정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={isEditing ? editData.name : userData?.name || ''}
                onChange={(e) => isEditing && onEditDataChange({ name: e.target.value })}
                disabled={!isEditing}
                placeholder="실명을 입력해주세요"
              />
            </div>
            <div>
              <Label htmlFor="username">사용자명 *</Label>
              <Input
                id="username"
                value={isEditing ? editData.username : userData?.username || ''}
                onChange={(e) => isEditing && onEditDataChange({ username: e.target.value })}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              value={isEditing ? editData.email : userData?.email || ''}
              onChange={(e) => isEditing && onEditDataChange({ email: e.target.value })}
              disabled={!isEditing}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={isEditing ? editData.bio : userData?.bio || ''}
              onChange={(e) => isEditing && onEditDataChange({ bio: e.target.value })}
              rows={3}
              disabled={!isEditing}
              placeholder="자신을 소개해주세요"
            />
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={onSaveProfile} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? '저장 중...' : '변경 사항 저장'}
              </Button>
              <Button
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 보안 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            보안 설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>비밀번호 변경</Label>
              <p className="text-sm text-gray-600">계정 보안을 위해 정기적으로 비밀번호를 변경하세요</p>
            </div>
            <Button variant="outline" size="sm">
              변경하기
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label>2단계 인증</Label>
              <p className="text-sm text-gray-600">계정 보안을 강화하세요</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">비활성화</Badge>
              <Button variant="outline" size="sm">
                설정하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
