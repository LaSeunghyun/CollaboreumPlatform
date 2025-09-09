import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import { useCommunityPosts } from '../../lib/api/useCommunity';
import { LoadingState, ErrorState, EmptyCommunityState } from '../../components/organisms/States';

export const CommunityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [isLoggedIn] = useState(true); // 실제로는 인증 상태에서 가져와야 함
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
        sortBy: sortBy,
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: questionPosts, isLoading: questionLoading, error: questionError } = useCommunityPosts({
        category: 'question',
        search: searchQuery || undefined,
        sortBy: sortBy,
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: reviewPosts, isLoading: reviewLoading, error: reviewError } = useCommunityPosts({
        category: 'review',
        search: searchQuery || undefined,
        sortBy: sortBy,
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const { data: freePosts, isLoading: freeLoading, error: freeError } = useCommunityPosts({
        category: 'free',
        search: searchQuery || undefined,
        sortBy: sortBy,
        order: sortBy === 'latest' ? 'desc' : 'desc',
    });

    const handleCreatePost = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreatePostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!createFormData.title.trim() || !createFormData.content.trim() || !createFormData.category) {
            alert('제목, 내용, 카테고리를 모두 입력해주세요.');
            return;
        }

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL ||
                (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://collaboreumplatform-production.up.railway.app/api');

            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            const postData = {
                title: createFormData.title,
                content: createFormData.content,
                category: createFormData.category,
                tags: createFormData.tags ? createFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
            };

            const response = await fetch(`${API_BASE_URL}/community/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (response.ok) {
                alert('게시글이 성공적으로 작성되었습니다.');
                setCreateFormData({
                    title: '',
                    content: '',
                    category: '',
                    tags: ''
                });
                setIsCreateModalOpen(false);
                // 페이지 새로고침
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`게시글 작성 실패: ${errorData.message || '알 수 없는 오류가 발생했습니다.'}`);
            }
        } catch (error) {
            console.error('게시글 작성 실패:', error);
            alert('게시글 작성 중 오류가 발생했습니다.');
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
                    action={isLoggedIn ? {
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
                        {posts.map((post: any) => (
                            <CommunityBoardPost key={post.id} {...post} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">커뮤니티</h1>
                    <p className="text-muted-foreground">아티스트와 팬이 함께 만드는 소통의 공간</p>
                </div>
                {isLoggedIn && (
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 max-w-md">
                    <TabsTrigger value="question">질문</TabsTrigger>
                    <TabsTrigger value="review">후기</TabsTrigger>
                    <TabsTrigger value="free">자유</TabsTrigger>
                    <TabsTrigger value="all">전체</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="게시글 검색..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">최신순</SelectItem>
                            <SelectItem value="popular">인기순</SelectItem>
                            <SelectItem value="comments">댓글순</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

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
            </Tabs>
        </div>
    );
};
