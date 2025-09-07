import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
    Settings,
    LogOut,
    Plus,
    BarChart3,
    Heart,
    MessageSquare,
    Award
} from 'lucide-react';
import { FundingProjectCard } from '../../components/molecules/FundingProjectCard';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import { useUserProfile, useUserProjects, useUserBackings } from '../../lib/api/useUser';
import { LoadingState, ErrorState, SkeletonGrid } from '../../components/organisms/States';

// 타입 정의 (간단하게 any 대신 명확하게)
type UserProfile = {
    avatar?: string;
    name?: string;
    email?: string;
    followers?: number;
    following?: number;
};

type UserProjects = {
    data?: {
        projects?: Array<any>;
    };
    projects?: Array<any>;
};

type UserBackings = {
    backings?: Array<any>;
};

export const AccountPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true); // 실제로는 인증 상태에서 가져와야 함
    const [activeTab, setActiveTab] = useState("my-projects");

    // API 훅들
    const { data: userProfileRaw, isLoading: profileLoading, error: profileError } = useUserProfile("current-user");
    const { data: userProjectsRaw, isLoading: projectsLoading, error: projectsError } = useUserProjects("current-user");
    const { data: userBackingsRaw, isLoading: backingsLoading, error: backingsError } = useUserBackings("current-user");

    // 안전하게 데이터 구조 분해
    const userProfile: UserProfile = userProfileRaw as UserProfile || {};
    const userProjects: UserProjects = userProjectsRaw as UserProjects || {};
    const userBackings: UserBackings = userBackingsRaw as UserBackings || {};

    const handleLogout = () => {
        setIsLoggedIn(false);
        // 실제 로그아웃 로직
    };

    const handleCreateProject = () => {
        // 프로젝트 생성 로직
    };

    if (!isLoggedIn) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
                <p className="text-muted-foreground mb-6">마이페이지를 이용하려면 로그인해주세요.</p>
                <Button className="bg-indigo hover:bg-indigo-hover">
                    로그인하기
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">마이페이지</h1>
                    <p className="text-muted-foreground">내 활동과 프로젝트를 관리하세요</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        설정
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        로그아웃
                    </Button>
                </div>
            </div>

            {/* User Profile Card */}
            <Card>
                <CardContent className="p-6">
                    {profileLoading ? (
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-full animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                                <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                            </div>
                        </div>
                    ) : profileError ? (
                        <ErrorState title="프로필 정보를 불러올 수 없습니다" />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={userProfile.avatar} />
                                <AvatarFallback>{userProfile.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold">{userProfile.name || '사용자'}</h3>
                                <p className="text-sm text-muted-foreground">{userProfile.email || 'user@example.com'}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>팔로워 {userProfile.followers ?? 0}명</span>
                                    <span>팔로잉 {userProfile.following ?? 0}명</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-indigo" />
                            <span className="text-sm text-muted-foreground">진행 중인 프로젝트</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {(userProjects.data?.projects || userProjects.projects)?.filter((p: any) => p.status === 'ongoing').length ?? 0}개
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-muted-foreground">후원한 프로젝트</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {userBackings.backings?.length ?? 0}개
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-sky" />
                            <span className="text-sm text-muted-foreground">커뮤니티 활동</span>
                        </div>
                        <p className="text-2xl font-bold">23개</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">달성한 목표</span>
                        </div>
                        <p className="text-2xl font-bold">1개</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="my-projects">내 프로젝트</TabsTrigger>
                    <TabsTrigger value="backed-projects">후원한 프로젝트</TabsTrigger>
                    <TabsTrigger value="community-activity">커뮤니티 활동</TabsTrigger>
                    <TabsTrigger value="settings">설정</TabsTrigger>
                </TabsList>

                <TabsContent value="my-projects" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">내 프로젝트</h3>
                        <Button
                            className="bg-indigo hover:bg-indigo/90"
                            onClick={handleCreateProject}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            새 프로젝트
                        </Button>
                    </div>

                    {projectsLoading ? (
                        <SkeletonGrid count={3} cols={3} />
                    ) : projectsError ? (
                        <ErrorState title="프로젝트 정보를 불러올 수 없습니다" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(userProjects.data?.projects || userProjects.projects)?.map((project: any) => (
                                <FundingProjectCard key={project.id} {...project} />
                            ))}

                            <Card className="border-dashed">
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className="w-12 h-12 bg-indigo/10 rounded-full flex items-center justify-center mx-auto">
                                        <Plus className="w-6 h-6 text-indigo" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 font-medium">새 프로젝트 시작</h3>
                                        <p className="text-sm text-muted-foreground">
                                            창의적인 아이디어를 현실로 만들어보세요
                                        </p>
                                    </div>
                                    <Button
                                        className="bg-indigo hover:bg-indigo/90"
                                        onClick={handleCreateProject}
                                    >
                                        프로젝트 만들기
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="backed-projects" className="space-y-6">
                    {backingsLoading ? (
                        <SkeletonGrid count={3} cols={3} />
                    ) : backingsError ? (
                        <ErrorState title="후원 정보를 불러올 수 없습니다" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userBackings.backings?.map((backing: any) => (
                                <FundingProjectCard key={backing.project.id} {...backing.project} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="community-activity" className="space-y-6">
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {/* 커뮤니티 활동 목록 */}
                                <div className="p-6 text-center text-muted-foreground">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                                    <p>커뮤니티 활동 내역이 없습니다.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>계정 설정</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">이메일</label>
                                <Input defaultValue={userProfile.email || "user@example.com"} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">알림 설정</label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked />
                                        <span className="text-sm">프로젝트 업데이트 알림</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked />
                                        <span className="text-sm">커뮤니티 댓글 알림</span>
                                    </label>
                                </div>
                            </div>
                            <Button className="bg-indigo hover:bg-indigo/90">
                                설정 저장
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
