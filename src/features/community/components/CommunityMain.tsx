import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import { CommunityPost } from "../types";
import PostCard from "./PostCard";
import PostForm from "./PostForm";
import { Search, Plus, Filter, TrendingUp, Clock, Star } from "lucide-react";

interface CommunityMainProps {
    onPostClick?: (post: CommunityPost) => void;
    onCreatePost?: () => void;
    showStats?: boolean;
}

const CommunityMain: React.FC<CommunityMainProps> = ({
    onPostClick,
    onCreatePost,
    showStats = true
}) => {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [showCreateForm, setShowCreateForm] = useState(false);

    // 임시 데이터 - 실제로는 API에서 가져와야 함
    const mockPosts: CommunityPost[] = [
        {
            id: "1",
            title: "새로운 음악 프로젝트를 시작합니다!",
            content: "안녕하세요! 새로운 앨범 작업을 시작하게 되었습니다. 많은 관심 부탁드려요.",
            author: {
                id: "user1",
                name: "김아티스트",
                username: "kimartist",
                avatar: undefined,
                role: "artist" as const,
                isVerified: true
            },
            category: "announcement",
            tags: ["음악", "앨범", "프로젝트"],
            likes: 15,
            dislikes: 2,
            views: 120,
            comments: 8,
            replies: 3,
            viewCount: 120,
            isHot: true,
            isPinned: false,
            isLiked: false,
            isDisliked: false,
            isBookmarked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "published"
        },
        {
            id: "2",
            title: "협업하고 싶은 뮤지션을 찾습니다",
            content: "재즈 장르로 작업하고 계신 분들과 협업하고 싶습니다. 연락주세요!",
            author: {
                id: "user2",
                name: "박뮤지션",
                username: "parkmusician",
                avatar: undefined,
                role: "artist" as const,
                isVerified: false
            },
            category: "collaboration",
            tags: ["재즈", "협업", "뮤지션"],
            likes: 8,
            dislikes: 1,
            views: 45,
            comments: 3,
            replies: 1,
            viewCount: 45,
            isHot: false,
            isPinned: false,
            isLiked: true,
            isDisliked: false,
            isBookmarked: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
            status: "published"
        }
    ];

    const handleCreatePost = (data: any) => {
        console.log("Creating post:", data);
        setShowCreateForm(false);
        // 실제로는 API 호출
    };

    const handlePostClick = (post: CommunityPost) => {
        if (onPostClick) {
            onPostClick(post);
        }
    };

    const filteredPosts = mockPosts.filter(post => {
        if (activeTab !== "all" && post.category !== activeTab) return false;
        if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !post.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        switch (sortBy) {
            case "latest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "popular":
                return b.likes - a.likes;
            case "trending":
                return (b.likes + b.comments) - (a.likes + a.comments);
            default:
                return 0;
        }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
                            <p className="text-gray-600 mt-1">아티스트들과 소통하고 협업하세요</p>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>글쓰기</span>
                        </Button>
                    </div>

                    {/* 검색 및 필터 */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="게시글 검색..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="정렬 방식" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="latest">최신순</SelectItem>
                                <SelectItem value="popular">인기순</SelectItem>
                                <SelectItem value="trending">트렌딩</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 통계 */}
                {showStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="w-5 h-5 text-primary-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">오늘의 게시글</p>
                                        <p className="text-2xl font-bold text-gray-900">12</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">활성 사용자</p>
                                        <p className="text-2xl font-bold text-gray-900">156</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">인기 게시글</p>
                                        <p className="text-2xl font-bold text-gray-900">8</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Filter className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">총 게시글</p>
                                        <p className="text-2xl font-bold text-gray-900">1,234</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 탭 및 게시글 목록 */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="general">일반</TabsTrigger>
                            <TabsTrigger value="question">질문</TabsTrigger>
                            <TabsTrigger value="discussion">토론</TabsTrigger>
                            <TabsTrigger value="collaboration">협업</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-6">
                            {showCreateForm ? (
                                <PostForm
                                    onSubmit={handleCreatePost}
                                    onCancel={() => setShowCreateForm(false)}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {sortedPosts.length > 0 ? (
                                        sortedPosts.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                post={post}
                                                onPostClick={handlePostClick}
                                            />
                                        ))
                                    ) : (
                                        <Card>
                                            <CardContent className="p-8 text-center">
                                                <p className="text-gray-500">게시글이 없습니다.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default CommunityMain;