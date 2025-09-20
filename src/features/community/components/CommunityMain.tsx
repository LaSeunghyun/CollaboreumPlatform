import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import { ErrorMessage, ProjectListSkeleton } from "@/shared/ui";
import { useCommunityPosts } from "@/lib/api/useCommunityPosts";
import type { CommunityPost, CommunityPostListQuery } from "../types";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const categoryParam = searchParams.get("category") || "all";
    const sortParam = searchParams.get("sort") || "latest";
    const orderParam = searchParams.get("order");
    const searchParam = searchParams.get("search") || "";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const statusParam = searchParams.get("status");
    const authorParam = searchParams.get("authorId");

    useEffect(() => {
        setSearchInput(searchParam);
    }, [searchParam]);

    const mapSortOption = useCallback((option: string): Pick<CommunityPostListQuery, "sortBy" | "order"> => {
        switch (option) {
            case "popular":
                return { sortBy: "likes", order: "desc" };
            case "trending":
                return { sortBy: "views", order: "desc" };
            case "latest":
            default:
                return { sortBy: "createdAt", order: "desc" };
        }
    }, []);

    const updateSearchParams = useCallback(
        (updates: Record<string, string | null | undefined>) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);

                Object.entries(updates).forEach(([key, value]) => {
                    if (value === null || value === undefined || value === "") {
                        next.delete(key);
                        return;
                    }

                    if (key === "page" && value === "1") {
                        next.delete(key);
                        return;
                    }

                    next.set(key, value);
                });

                return next;
            });
        },
        [setSearchParams]
    );

    const handleTabChange = useCallback(
        (value: string) => {
            updateSearchParams({
                category: value === "all" ? null : value,
                page: "1",
            });
        },
        [updateSearchParams]
    );

    const handleSortChange = useCallback(
        (value: string) => {
            const { order } = mapSortOption(value);
            updateSearchParams({
                sort: value,
                order,
                page: "1",
            });
        },
        [mapSortOption, updateSearchParams]
    );

    const handleSearchChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setSearchInput(value);

            const normalized = value.trim();
            updateSearchParams({
                search: normalized ? normalized : null,
                page: "1",
            });
        },
        [updateSearchParams]
    );

    const query = useMemo<CommunityPostListQuery>(() => {
        const params: CommunityPostListQuery = {};

        if (categoryParam && categoryParam !== "all") {
            params.category = categoryParam;
        }

        if (searchParam) {
            params.search = searchParam;
        }

        if (pageParam) {
            const parsedPage = Number(pageParam);
            if (!Number.isNaN(parsedPage) && parsedPage > 0) {
                params.page = parsedPage;
            }
        }

        if (limitParam) {
            const parsedLimit = Number(limitParam);
            if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
                params.limit = parsedLimit;
            }
        }

        if (statusParam) {
            params.status = statusParam as CommunityPostListQuery["status"];
        }

        if (authorParam) {
            params.authorId = authorParam;
        }

        const { sortBy, order } = mapSortOption(sortParam);
        if (sortBy) {
            params.sortBy = sortBy;
        }

        const normalizedOrder = (orderParam as CommunityPostListQuery["order"]) || order;
        if (normalizedOrder) {
            params.order = normalizedOrder;
        }

        return params;
    }, [authorParam, categoryParam, limitParam, mapSortOption, orderParam, pageParam, searchParam, sortParam, statusParam]);

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useCommunityPosts(query);

    const posts = useMemo<CommunityPost[]>(() => {
        if (!data) {
            return [];
        }

        if (Array.isArray((data as any).posts)) {
            return (data as any).posts as CommunityPost[];
        }

        if (Array.isArray((data as any).data?.posts)) {
            return (data as any).data.posts as CommunityPost[];
        }

        if (Array.isArray((data as any).data)) {
            return (data as any).data as CommunityPost[];
        }

        return [];
    }, [data]);

    const pagination = useMemo(() => {
        if (!data) return undefined;

        if ((data as any).pagination) {
            return (data as any).pagination;
        }

        if ((data as any).data?.pagination) {
            return (data as any).data.pagination;
        }

        return undefined;
    }, [data]);

    const allowedTabs = ["all", "general", "question", "discussion", "collaboration"] as const;
    const activeTab = allowedTabs.includes(categoryParam as typeof allowedTabs[number]) ? categoryParam : "all";
    const allowedSorts = ["latest", "popular", "trending"] as const;
    const normalizedSort = allowedSorts.includes(sortParam as typeof allowedSorts[number]) ? sortParam : "latest";
    const totalPosts = pagination?.total ?? posts.length;

    const handleCreatePost = (data: any) => {
        console.log("Creating post:", data);
        setShowCreateForm(false);
        onCreatePost?.();
        refetch();
        // 실제로는 API 호출
    };

    const handlePostClick = (post: CommunityPost) => {
        if (onPostClick) {
            onPostClick(post);
        }
    };

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
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={normalizedSort} onValueChange={handleSortChange}>
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
                                        <p className="text-2xl font-bold text-gray-900">{totalPosts.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 탭 및 게시글 목록 */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
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
                                    {isLoading ? (
                                        <ProjectListSkeleton />
                                    ) : error ? (
                                        <ErrorMessage
                                            error={error as Error}
                                            onRetry={() => refetch()}
                                        />
                                    ) : posts.length > 0 ? (
                                        posts.map((post) => (
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

                                    {!isLoading && !error && isFetching && (
                                        <Card>
                                            <CardContent className="p-4 text-center text-sm text-gray-500">
                                                최신 게시글을 불러오는 중입니다...
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