import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { CommunityBoardPost } from '../../components/organisms/CommunityBoardPost';
import { useCommunityPosts } from '../../lib/api/useCommunity';
import { LoadingState, ErrorState, EmptyCommunityState } from '../../components/organisms/States';

export const CommunityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [isLoggedIn] = useState(true); // 실제로는 인증 상태에서 가져와야 함

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
        // 게시글 작성 로직
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
                    <Button
                        className="bg-indigo hover:bg-indigo-hover hover-scale transition-button shadow-sm"
                        onClick={handleCreatePost}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        글쓰기
                    </Button>
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
                        questionPosts?.data?.posts || [],
                        questionLoading,
                        questionError,
                        'question'
                    )}
                </TabsContent>

                <TabsContent value="review" className="space-y-6">
                    {renderPosts(
                        reviewPosts?.data?.posts || [],
                        reviewLoading,
                        reviewError,
                        'review'
                    )}
                </TabsContent>

                <TabsContent value="free" className="space-y-6">
                    {renderPosts(
                        freePosts?.data?.posts || [],
                        freeLoading,
                        freeError,
                        'free'
                    )}
                </TabsContent>

                <TabsContent value="all" className="space-y-6">
                    {renderPosts(
                        allPosts?.data?.posts || [],
                        allLoading,
                        allError,
                        'all'
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
