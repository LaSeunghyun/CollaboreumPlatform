import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import {
  User,
  Settings,
  Edit,
  Lock,
  Trash2,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Shield,
  LogOut,
  Camera,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { userProfileAPI } from '../services/api';

// Types
interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'artist' | 'fan';
  avatar?: string;
  bio?: string;
  createdAt: Date;
  lastLoginAt: Date;
  status: 'active' | 'suspended' | 'banned';
}

interface Project {
  id: string;
  title: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  endDate: Date;
}

interface Backing {
  id: string;
  projectTitle: string;
  amount: number;
  reward?: string;
  backedAt: Date;
  projectStatus: string;
}

interface Revenue {
  id: string;
  projectTitle: string;
  amount: number;
  distributedAt: Date;
  status: 'pending' | 'completed';
}

// Common Profile Edit Component
export const ProfileEditForm: React.FC<{ profile: UserProfile; onSave: (data: Partial<UserProfile>) => void }> = ({
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState({
    username: profile.username,
    bio: profile.bio || '',
    avatar: profile.avatar || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    }
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = '자기소개는 500자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">프로필 이미지</label>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.avatar} />
            <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="이미지 URL을 입력하세요"
            />
            <p className="text-sm text-gray-500 mt-1">프로필 이미지 URL을 입력하세요</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">사용자명 *</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          className={errors.username ? 'border-red-500' : ''}
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">자기소개</label>
        <Textarea
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="자기소개를 입력하세요"
          rows={4}
          maxLength={500}
          className={errors.bio ? 'border-red-500' : ''}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
          <span className="text-sm text-gray-500">
            {formData.bio.length}/500
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          저장
        </Button>
        <Button type="button" variant="outline" className="flex-1">
          취소
        </Button>
      </div>
    </form>
  );
};

// Password Change Component
export const PasswordChangeForm: React.FC = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // API 호출하여 비밀번호 변경
      try {
        const response = await fetch('/api/users/change-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          })
        });

        if (response.ok) {
          alert('비밀번호가 성공적으로 변경되었습니다.');
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } else {
          const errorData = await response.json();
          alert(`비밀번호 변경 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
      } catch (error) {
        console.error('비밀번호 변경 실패:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
      }
      console.log('비밀번호 변경:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">현재 비밀번호 *</label>
        <Input
          type="password"
          value={formData.currentPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
          className={errors.currentPassword ? 'border-red-500' : ''}
        />
        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">새 비밀번호 *</label>
        <Input
          type="password"
          value={formData.newPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
          className={errors.newPassword ? 'border-red-500' : ''}
        />
        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">새 비밀번호 확인 *</label>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          className={errors.confirmPassword ? 'border-red-500' : ''}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          비밀번호 변경
        </Button>
      </div>
    </form>
  );
};

// Artist MyPage Component
export const ArtistMyPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'artist1',
    username: '테스트아티스트',
    email: 'artist@example.com',
    role: 'artist',
    bio: '음악을 사랑하는 아티스트입니다.',
    createdAt: new Date('2023-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    status: 'active'
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        // API에서 프로젝트 정보 가져오기
        const projectsResponse = await fetch('/api/projects/artist');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data || []);
        }

        // API에서 수익 정보 가져오기
        const revenuesResponse = await fetch('/api/revenues/artist');
        if (revenuesResponse.ok) {
          const revenuesData = await revenuesResponse.json();
          setRevenues(revenuesData.data || []);
        }
      } catch (error) {
        console.error('아티스트 데이터 로드 실패:', error);
        setProjects([]);
        setRevenues([]);
      }
    };

    fetchArtistData();
  }, []);

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setProfile(prev => ({ ...prev, ...data }));
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '승인 대기', variant: 'secondary' as const },
      active: { label: '진행중', variant: 'default' as const },
      completed: { label: '완료', variant: 'outline' as const },
      failed: { label: '실패', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">아티스트 마이페이지</h1>
        <p className="text-gray-600">프로젝트와 수익을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="projects">프로젝트</TabsTrigger>
          <TabsTrigger value="revenue">수익 관리</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    프로필 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm profile={profile} onSave={handleProfileSave} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>계정 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">가입일</p>
                    <p className="font-medium">{format(profile.createdAt, 'PPP', { locale: ko })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">마지막 로그인</p>
                    <p className="font-medium">{format(profile.lastLoginAt, 'PPP', { locale: ko })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">상태</p>
                    <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>
                      {profile.status === 'active' ? '활성' : '정지'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>총 프로젝트</span>
                    <span className="font-bold">{projects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>성공한 프로젝트</span>
                    <span className="font-bold text-green-600">
                      {projects.filter(p => p.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>총 수익</span>
                    <span className="font-bold text-blue-600">
                      {revenues.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}원
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>내 프로젝트</span>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  새 프로젝트
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>목표: {project.goalAmount.toLocaleString()}원</span>
                        <span>현재: {project.currentAmount.toLocaleString()}원</span>
                        <span>달성률: {Math.round((project.currentAmount / project.goalAmount) * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(project.status)}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>수익 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenues.map(revenue => (
                  <div key={revenue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{revenue.projectTitle}</h3>
                      <p className="text-sm text-gray-600">
                        {format(revenue.distributedAt, 'PPP', { locale: ko })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-600">
                        {revenue.amount.toLocaleString()}원
                      </span>
                      <Badge variant={revenue.status === 'completed' ? 'default' : 'secondary'}>
                        {revenue.status === 'completed' ? '지급 완료' : '대기중'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  비밀번호 변경
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  계정 삭제
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button variant="destructive">
                  계정 삭제
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Fan MyPage Component
export const FanMyPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    role: 'fan',
    bio: '',
    createdAt: new Date(),
    lastLoginAt: new Date(),
    status: 'active'
  });

  const [backings, setBackings] = useState<Backing[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // API에서 백킹 정보 가져오기
    const fetchBackingInfo = async () => {
      try {
        const response = await fetch('/api/users/backing-info');
        if (response.ok) {
          const data = await response.json();
          setBackings(data.data || []);
        }
      } catch (error) {
        console.error('백킹 정보 로드 실패:', error);
        setBackings([]);
      }
    };

    fetchBackingInfo();
  }, []);

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
    // API 호출하여 프로필 업데이트
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">팬 마이페이지</h1>
        <p className="text-gray-600">후원 내역과 프로필을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="backings">후원 내역</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    프로필 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm profile={profile} onSave={handleProfileSave} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>계정 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">가입일</p>
                    <p className="font-medium">{format(profile.createdAt, 'PPP', { locale: ko })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">마지막 로그인</p>
                    <p className="font-medium">{format(profile.lastLoginAt, 'PPP', { locale: ko })}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>후원 통계</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>총 후원 프로젝트</span>
                    <span className="font-bold">{backings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>총 후원 금액</span>
                    <span className="font-bold text-blue-600">
                      {backings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>성공한 프로젝트</span>
                    <span className="font-bold text-green-600">
                      {backings.filter(b => b.projectStatus === 'completed').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>후원 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backings.map(backing => (
                  <div key={backing.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{backing.projectTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          후원일: {format(backing.backedAt, 'PPP', { locale: ko })}
                        </p>
                        {backing.reward && (
                          <p className="text-sm text-blue-600 mt-1">
                            리워드: {backing.reward}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {backing.amount.toLocaleString()}원
                        </div>
                        <Badge variant={backing.projectStatus === 'completed' ? 'default' : 'secondary'}>
                          {backing.projectStatus === 'completed' ? '성공' : '진행중'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  비밀번호 변경
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  계정 삭제
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
                </p>
                <Button variant="destructive">
                  계정 삭제
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Admin MyPage Component
export const AdminMyPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'admin1',
    username: '관리자',
    email: 'admin@example.com',
    role: 'admin',
    bio: '플랫폼 관리자입니다.',
    createdAt: new Date('2023-01-01'),
    lastLoginAt: new Date('2024-01-15'),
    status: 'active'
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (data: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
    // API 호출하여 프로필 업데이트
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('프로필이 성공적으로 업데이트되었습니다.');
      } else {
        alert('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관리자 마이페이지</h1>
        <p className="text-gray-600">관리자 계정을 관리하세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    관리자 프로필
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm profile={profile} onSave={handleProfileSave} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>계정 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">가입일</p>
                    <p className="font-medium">{format(profile.createdAt, 'PPP', { locale: ko })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">마지막 로그인</p>
                    <p className="font-medium">{format(profile.lastLoginAt, 'PPP', { locale: ko })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">권한</p>
                    <Badge variant="default" className="bg-red-600">
                      관리자
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>관리자 기능</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    사용자 관리
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    프로젝트 승인
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    콘텐츠 검토
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  비밀번호 변경
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  로그아웃
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  현재 세션에서 로그아웃합니다.
                </p>
                <Button variant="outline">
                  로그아웃
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main User Profile System Component
export const UserProfileSystem: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'artist' | 'fan'>('fan');

  const renderMyPage = () => {
    switch (userRole) {
      case 'admin':
        return <AdminMyPage />;
      case 'artist':
        return <ArtistMyPage />;
      case 'fan':
        return <FanMyPage />;
      default:
        return <FanMyPage />;
    }
  };

  return (
    <div>
      {renderMyPage()}
    </div>
  );
};

export default UserProfileSystem;
