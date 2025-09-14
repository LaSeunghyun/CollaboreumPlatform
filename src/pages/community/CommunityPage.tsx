import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Search, Plus, Copy, ExternalLink, TrendingUp, Clock, MessageCircle, Eye, Users, MessageSquare, Heart } from 'lucide-react';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import { useCommunityPosts, useCreateCommunityPost } from '../../features/community/hooks/useCommunityPosts';
import { LoadingState, ErrorState, EmptyCommunityState } from '../../components/organisms/States';
import { useAuth } from '../../contexts/AuthContext';
import { CommunityFull } from '../../components/CommunityFull';
import { CommunityMain } from '../../components/CommunityMain';
import { CommunityPostForm } from '../../components/CommunityPostForm';
import { CommunityPostDetail } from '../../components/CommunityPostDetail';
import { Badge } from '../../components/ui/badge';

export const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"latest" | "popular" | "comments" | "views">("latest");
    const [timeFilter, setTimeFilter] = useState<"all" | "3h" | "6h" | "12h" | "1d" | "2d" | "3d" | "7d">("all");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: ''
    });
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    // API 훅들
    const { data: allPosts, isLoading: allLoading, error: allError } = useCommunityPosts({
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: questionPosts, isLoading: questionLoading, error: questionError } = useCommunityPosts({
        category: 'question',
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: reviewPosts, isLoading: reviewLoading, error: reviewError } = useCommunityPosts({
        category: 'review',
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: freePosts, isLoading: freeLoading, error: freeError } = useCommunityPosts({
        category: 'free',
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const createPostMutation = useCreateCommunityPost();

    const handleCreatePost = () => {
        setIsCreateModalOpen(true);
    };

    const handlePostClick = (postId: string) => {
        navigate(`/community/post/${postId}`);
    };

    // 링크 복사 기능
    const handleCopyLink = async (postId: string) => {
        const link = `${window.location.origin}/community/post/${postId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedLink(postId);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (error) {
            console.error('링크 복사 실패:', error);
        }
    };

    // 시간 필터 적용
    const getTimeFilterValue = () => {
        const now = new Date();
        switch (timeFilter) {
            case '3h': return new Date(now.getTime() - 3 * 60 * 60 * 1000);
            case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
            case '12h': return new Date(now.getTime() - 12 * 60 * 60 * 1000);
            case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '2d': return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
            case '3d': return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            default: return undefined;
        }
    };

    const handleCreatePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createFormData.title.trim() || !createFormData.content.trim() || !createFormData.category) {
            alert('제목, 내용, 카테고리를 모두 입력해주세요.');
            return;
        }

        try {
            const postData = {
                title: createFormData.title,
                content: createFormData.content,
                category: createFormData.category,
                tags: createFormData.tags ? createFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                status: 'published' as const
            };

            await createPostMutation.mutateAsync(postData);

            alert('게시글이 성공적으로 작성되었습니다.');
            setCreateFormData({
                title: '',
                content: '',
                category: '',
                tags: ''
            });
            setIsCreateModalOpen(false);
        } catch (error: any) {
            console.error('게시글 작성 실패:', error);
            alert(`게시글 작성 실패: ${error?.message || '알 수 없는 오류가 발생했습니다.'}`);
        }
    };

    const handleSearch = () => {
        // 검색 로직은 useCommunityPosts 훅이 자동으로 처리
    };

    const renderPosts = (posts: any[], loading: boolean, error: any, category: string) => {
        if (loading) {
            return <LoadingState title="게시글을 불러오는 중..." />;
        }

        if (error) {
            return (
                <ErrorState
                    title="게시글을 불러올 수 없습니다"
                    description="잠시 후 다시 시도해주세요."
                />
            );
        }

        if (!posts || posts.length === 0) {
            return (
                <EmptyCommunityState
                    action={user ? {
                        label: "글쓰기",
                        onClick: handleCreatePost
                    } : undefined}
                />
            );
        }

        return (
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <div className="divide-y">
                        {posts.map((post: any, index: number) => (
                            <div key={post.id} className="relative group">
                                <CommunityBoardPost
                                    {...post}
                                    onClick={() => handlePostClick(post.id)}
                                    rank={index + 1}
                                />
                                {/* 링크 복사 버튼 */}
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyLink(post.id);
                                        }}
                                        className="h-8 w-8 p-0"
                                    >
                                        {copiedLink === post.id ? (
                                            <div className="text-green-600 text-xs">✓</div>
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };


    return (
        <div className="space-y-8">
            {/* IssueLink 스타일 헤더 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">커뮤니티 베스트</h1>
                            <p className="text-gray-600 mt-1">다양한 주제에 대해 이야기하고 소통해보세요</p>
                        </div>
                        {user && (
                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm"
                                        onClick={handleCreatePost}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        글쓰기
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>새 게시글 작성</DialogTitle>
                                        <DialogDescription>
                                            커뮤니티에 새로운 게시글을 작성해보세요. 질문, 후기, 자유 주제로 소통할 수 있습니다.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">제목 *</label>
                                            <Input
                                                value={createFormData.title}
                                                onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="게시글 제목을 입력하세요"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">카테고리 *</label>
                                            <Select value={createFormData.category} onValueChange={(value) => setCreateFormData(prev => ({ ...prev, category: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="카테고리를 선택하세요" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="question">질문</SelectItem>
                                                    <SelectItem value="review">후기</SelectItem>
                                                    <SelectItem value="free">자유</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">내용 *</label>
                                            <Textarea
                                                value={createFormData.content}
                                                onChange={(e) => setCreateFormData(prev => ({ ...prev, content: e.target.value }))}
                                                placeholder="게시글 내용을 입력하세요"
                                                rows={8}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">태그</label>
                                            <Input
                                                value={createFormData.tags}
                                                onChange={(e) => setCreateFormData(prev => ({ ...prev, tags: e.target.value }))}
                                                placeholder="태그를 쉼표로 구분하여 입력하세요"
                                            />
                                        </div>

                                        <div className="flex gap-2 pt-4">
                                            <Button type="submit" className="flex-1">
                                                게시글 작성
                                            </Button>
                                            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>
                                                취소
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>

                    {/* IssueLink 스타일 필터 바 */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                {/* 카테고리 탭 */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                                    <TabsList className="grid w-full grid-cols-6 max-w-2xl">
                                        <TabsTrigger value="all">전체</TabsTrigger>
                                        <TabsTrigger value="question">질문</TabsTrigger>
                                        <TabsTrigger value="review">후기</TabsTrigger>
                                        <TabsTrigger value="free">자유</TabsTrigger>
                                        <TabsTrigger value="full">전체보기</TabsTrigger>
                                        <TabsTrigger value="main">메인</TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                {/* 검색 및 필터 */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="게시글 검색..."
                                            className="pl-10 w-64"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>

                                    {/* 시간 필터 */}
                                    <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)}>
                                        <SelectTrigger className="w-[100px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">전체</SelectItem>
                                            <SelectItem value="3h">3시간</SelectItem>
                                            <SelectItem value="6h">6시간</SelectItem>
                                            <SelectItem value="12h">12시간</SelectItem>
                                            <SelectItem value="1d">1일</SelectItem>
                                            <SelectItem value="2d">2일</SelectItem>
                                            <SelectItem value="3d">3일</SelectItem>
                                            <SelectItem value="7d">7일</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* 정렬 필터 */}
                                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="latest">최신순</SelectItem>
                                            <SelectItem value="popular">인기순</SelectItem>
                                            <SelectItem value="comments">댓글순</SelectItem>
                                            <SelectItem value="views">조회순</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 메인 컨텐츠 */}
                    <div className="max-w-7xl mx-auto px-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                            <TabsContent value="question" className="space-y-6">
                                {renderPosts(
                                    (questionPosts as any)?.data?.posts || (questionPosts as any)?.posts || [],
                                    questionLoading,
                                    questionError,
                                    'question'
                                )}
                            </TabsContent>

                            <TabsContent value="review" className="space-y-6">
                                {renderPosts(
                                    (reviewPosts as any)?.data?.posts || (reviewPosts as any)?.posts || [],
                                    reviewLoading,
                                    reviewError,
                                    'review'
                                )}
                            </TabsContent>

                            <TabsContent value="free" className="space-y-6">
                                {renderPosts(
                                    (freePosts as any)?.data?.posts || (freePosts as any)?.posts || [],
                                    freeLoading,
                                    freeError,
                                    'free'
                                )}
                            </TabsContent>

                            <TabsContent value="all" className="space-y-6">
                                {renderPosts(
                                    (allPosts as any)?.data?.posts || (allPosts as any)?.posts || [],
                                    allLoading,
                                    allError,
                                    'all'
                                )}
                            </TabsContent>

                            <TabsContent value="full" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo" />
                                        <h3 className="text-xl font-semibold">커뮤니티 전체보기</h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        모든 아티스트와 팬들이 함께 소통하는 공간입니다.
                                    </p>
                                    <CommunityFull
                                        onBack={() => setActiveTab("all")}
                                        onSelectArtist={(artistId) => console.log('Selected artist:', artistId)}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="main" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-sky" />
                                        <h3 className="text-xl font-semibold">커뮤니티 메인</h3>
                                    </div>
                                    <p className="text-muted-foreground">
                                        인기 게시물과 실시간 소통을 확인하세요.
                                    </p>
                                    <CommunityMain onBack={() => setActiveTab("all")} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* 커뮤니티 통계 섹션 */}
            <section className="space-y-6 py-8">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">커뮤니티 통계</h2>
                    <p className="text-muted-foreground">
                        활발한 커뮤니티 활동 현황을 확인해보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2,456</div>
                            <p className="text-xs text-muted-foreground">
                                +15% 지난 주 대비
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,234</div>
                            <p className="text-xs text-muted-foreground">
                                +8% 지난 주 대비
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">총 댓글</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8,912</div>
                            <p className="text-xs text-muted-foreground">
                                +22% 지난 주 대비
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">평균 좋아요</CardTitle>
                            <Heart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">156</div>
                            <p className="text-xs text-muted-foreground">
                                +12% 지난 주 대비
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
};
