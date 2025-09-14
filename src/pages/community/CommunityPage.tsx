import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Search, Plus, MessageCircle, Users, MessageSquare, Heart } from 'lucide-react';
import { useCommunityPosts, useCreateCommunityPost } from '../../features/community/hooks/useCommunityPosts';
import { LoadingState, ErrorState, EmptyCommunityState } from '../../components/organisms/States';
import { useAuth } from '../../contexts/AuthContext';
import { useCommunityStats } from '../../lib/api/useStats';
import { useCategories } from '../../lib/api/useCategories';
import { Badge } from '../../components/ui/badge';

// 카테고리별 게시글 컴포넌트
const CategoryPosts: React.FC<{
    categoryId: string;
    searchQuery: string;
    sortBy: "latest" | "popular" | "comments" | "views";
}> = ({ categoryId, searchQuery, sortBy }) => {
    const { data: categoryPosts, isLoading, error } = useCommunityPosts({
        category: categoryId,
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    if (isLoading) {
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

    if (!categoryPosts?.posts || categoryPosts.posts.length === 0) {
        return (
            <EmptyCommunityState
                action={undefined}
            />
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* 테이블 헤더 */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-600">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-5">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">좋아요</div>
                <div className="col-span-1 text-center">싫어요</div>
                <div className="col-span-1 text-center">작성일</div>
            </div>

            {/* 게시글 목록 */}
            {categoryPosts.posts.map((post: any, index: number) => {
                const postId = post.id || post._id;
                if (!postId) return null;

                return (
                    <div
                        key={postId}
                        className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                            console.log('Post clicked with ID:', postId);
                            if (!postId || postId === 'undefined' || postId === 'null') {
                                console.error('Invalid postId:', postId);
                                return;
                            }
                            window.location.href = `/community/post/${postId}`;
                        }}
                    >
                        {/* 번호 */}
                        <div className="col-span-1 text-center text-sm text-gray-500">
                            {categoryPosts.posts.length - index}
                        </div>

                        {/* 제목 */}
                        <div className="col-span-5">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                    {post.category}
                                </Badge>
                                {post.isHot && (
                                    <Badge variant="destructive" className="text-xs">
                                        HOT
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-sm font-medium line-clamp-1 hover:text-blue-600">
                                {post.title}
                                {(post.comments || post.replies) > 0 && (
                                    <span className="text-blue-600 ml-1">[{post.comments || post.replies}]</span>
                                )}
                            </h3>
                        </div>

                        {/* 작성자 */}
                        <div className="col-span-2 text-center text-sm text-gray-600">
                            {typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown'}
                        </div>

                        {/* 조회수 */}
                        <div className="col-span-1 text-center text-sm text-gray-500">
                            {(post.views || post.viewCount || 0).toLocaleString()}
                        </div>

                        {/* 좋아요 */}
                        <div className="col-span-1 text-center text-sm text-gray-500">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-red-500">❤️</span>
                                <span>{post.likes || 0}</span>
                            </div>
                        </div>

                        {/* 싫어요 */}
                        <div className="col-span-1 text-center text-sm text-gray-500">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-blue-500">👎</span>
                                <span>{post.dislikes || 0}</span>
                            </div>
                        </div>

                        {/* 작성일 */}
                        <div className="col-span-1 text-center text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                );
            })}

            {/* 모바일 레이아웃 */}
            {categoryPosts.posts.length > 0 && (
                <div className="md:hidden space-y-2 p-4">
                    {categoryPosts.posts.map((post: any, index: number) => {
                        const postId = post.id || post._id;
                        if (!postId) return null;

                        return (
                            <div
                                key={postId}
                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                    console.log('Post clicked with ID:', postId);
                                    if (!postId || postId === 'undefined' || postId === 'null') {
                                        console.error('Invalid postId:', postId);
                                        return;
                                    }
                                    window.location.href = `/community/post/${postId}`;
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {post.category}
                                    </Badge>
                                    {post.isHot && (
                                        <Badge variant="destructive" className="text-xs">
                                            HOT
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="font-medium text-sm mb-2 line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown'}</span>
                                    <div className="flex items-center gap-3">
                                        <span>조회 {post.views || post.viewCount || 0}</span>
                                        <span>❤️ {post.likes || 0}</span>
                                        <span>👎 {post.dislikes || 0}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const CommunityPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"latest" | "popular" | "comments" | "views">("latest");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: ''
    });

    // API 훅들
    const { data: allPosts, isLoading: allLoading, error: allError } = useCommunityPosts({
        search: searchQuery || undefined,
        sortBy: sortBy === "latest" ? "createdAt" : "likes",
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });


    const createPostMutation = useCreateCommunityPost();

    // 커뮤니티 통계 조회 (임시 비활성화 - API 404 오류 해결 전까지)
    // const { data: communityStats, isLoading: statsLoading } = useCommunityStats();
    const communityStats = null;
    const statsLoading = false;

    // 카테고리 목록 조회
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    const handleCreatePost = () => {
        setIsCreateModalOpen(true);
    };

    const handlePostClick = (postId: string) => {
        console.log('Post clicked with ID:', postId);
        if (!postId || postId === 'undefined' || postId === 'null') {
            console.error('Invalid postId:', postId);
            return;
        }
        navigate(`/community/post/${postId}`);
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
            <div className="bg-white rounded-lg shadow-sm">
                {/* 테이블 헤더 */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-600">
                    <div className="col-span-1 text-center">번호</div>
                    <div className="col-span-5">제목</div>
                    <div className="col-span-2 text-center">작성자</div>
                    <div className="col-span-1 text-center">조회</div>
                    <div className="col-span-1 text-center">좋아요</div>
                    <div className="col-span-1 text-center">싫어요</div>
                    <div className="col-span-1 text-center">작성일</div>
                </div>

                {/* 게시글 목록 */}
                {posts.map((post: any, index: number) => {
                    // postId 검증 및 로깅
                    const postId = post.id || post._id;
                    console.log('Rendering post:', { postId, title: post.title, fullPost: post });

                    if (!postId) {
                        console.error('Post missing ID:', post);
                        return null;
                    }

                    return (
                        <div
                            key={postId}
                            className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handlePostClick(postId)}
                        >
                            {/* 번호 */}
                            <div className="col-span-1 text-center text-sm text-gray-500">
                                {posts.length - index}
                            </div>

                            {/* 제목 */}
                            <div className="col-span-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">
                                        {categories?.find(cat => cat.id === post.category)?.label || post.category}
                                    </Badge>
                                    {post.isHot && (
                                        <Badge variant="destructive" className="text-xs">
                                            HOT
                                        </Badge>
                                    )}
                                </div>
                                <h3 className="text-sm font-medium line-clamp-1 hover:text-blue-600">
                                    {post.title}
                                    {(post.comments || post.replies) > 0 && (
                                        <span className="text-blue-600 ml-1">[{post.comments || post.replies}]</span>
                                    )}
                                </h3>
                            </div>

                            {/* 작성자 */}
                            <div className="col-span-2 text-center text-sm text-gray-600">
                                {typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown'}
                            </div>

                            {/* 조회수 */}
                            <div className="col-span-1 text-center text-sm text-gray-500">
                                {(post.views || post.viewCount || 0).toLocaleString()}
                            </div>

                            {/* 좋아요 */}
                            <div className="col-span-1 text-center text-sm text-gray-500">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-red-500">❤️</span>
                                    <span>{post.likes || 0}</span>
                                </div>
                            </div>

                            {/* 싫어요 */}
                            <div className="col-span-1 text-center text-sm text-gray-500">
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-blue-500">👎</span>
                                    <span>{post.dislikes || 0}</span>
                                </div>
                            </div>

                            {/* 작성일 */}
                            <div className="col-span-1 text-center text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* 모바일 레이아웃 */}
                {posts.length > 0 && (
                    <div className="md:hidden space-y-2 p-4">
                        {posts.map((post: any, index: number) => {
                            const postId = post.id || post._id;
                            if (!postId) {
                                console.error('Post missing ID in mobile layout:', post);
                                return null;
                            }

                            return (
                                <div
                                    key={postId}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handlePostClick(postId)}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {categories?.find(cat => cat.id === post.category)?.label || post.category}
                                        </Badge>
                                        {post.isHot && (
                                            <Badge variant="destructive" className="text-xs">
                                                HOT
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{typeof post.author === 'string' ? post.author : post.author?.name || 'Unknown'}</span>
                                        <div className="flex items-center gap-3">
                                            <span>조회 {post.views || post.viewCount || 0}</span>
                                            <span>❤️ {post.likes || 0}</span>
                                            <span>👎 {post.dislikes || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="space-y-6">
            {/* 간단한 헤더 */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
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
                                        새 글 작성
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
                                                    {categoriesLoading ? (
                                                        <SelectItem value="loading" disabled>카테고리 로딩 중...</SelectItem>
                                                    ) : (
                                                        categories?.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
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

                    {/* 필터 바 */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                {/* 카테고리 탭 */}
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                                    <TabsList className={`grid w-full max-w-lg ${categories ? `grid-cols-${(categories.length + 1)}` : 'grid-cols-4'}`}>
                                        <TabsTrigger value="all">전체</TabsTrigger>
                                        {categoriesLoading ? (
                                            <>
                                                <TabsTrigger value="loading1" disabled>로딩중...</TabsTrigger>
                                                <TabsTrigger value="loading2" disabled>로딩중...</TabsTrigger>
                                            </>
                                        ) : (
                                            categories?.map((category) => (
                                                <TabsTrigger key={category.id} value={category.id}>
                                                    {category.label}
                                                </TabsTrigger>
                                            ))
                                        )}
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
                                        />
                                    </div>

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

                            <TabsContent value="all" className="space-y-6">
                                {renderPosts(
                                    (allPosts as any)?.posts || [],
                                    allLoading,
                                    allError,
                                    'all'
                                )}
                            </TabsContent>

                            {categories?.map((category) => (
                                <TabsContent key={category.id} value={category.id} className="space-y-6">
                                    <CategoryPosts
                                        categoryId={category.id}
                                        searchQuery={searchQuery}
                                        sortBy={sortBy}
                                    />
                                </TabsContent>
                            ))}

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

                {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
                                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {((communityStats as any)?.data?.totalPosts || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {((communityStats as any)?.data?.postsGrowthRate || 0) > 0 ? '+' : ''}
                                    {((communityStats as any)?.data?.postsGrowthRate || 0)}% 지난 주 대비
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {((communityStats as any)?.data?.activeUsers || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {((communityStats as any)?.data?.usersGrowthRate || 0) > 0 ? '+' : ''}
                                    {((communityStats as any)?.data?.usersGrowthRate || 0)}% 지난 주 대비
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">총 댓글</CardTitle>
                                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {((communityStats as any)?.data?.totalComments || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    커뮤니티 참여도
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">평균 좋아요</CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {((communityStats as any)?.data?.avgLikes || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    게시글당 평균
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </section>
        </div>
    );
};
