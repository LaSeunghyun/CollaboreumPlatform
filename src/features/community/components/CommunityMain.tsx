import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/Tabs";
import { ErrorMessage, ProjectListSkeleton } from "@/shared/ui";
import { useCommunityPosts } from "@/lib/api/useCommunityPosts";
import { useCategories } from "@/lib/api/useCategories";
import { useCreateCommunityPost } from "@/features/community/hooks/useCommunityPosts";
import { useCommunityStats } from "@/features/community/hooks/useCommunity";
import type { CommunityPost, CommunityPostListQuery, CreateCommunityPostData } from "../types";
import PostCard from "./PostCard";
import PostForm from "./PostForm";
import { Search, Plus, Filter, TrendingUp, Clock, Star } from "lucide-react";
import { toast } from "sonner";

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

    const { data: categoriesData = [], error: categoriesError, refetch: refetchCategories } = useCategories();
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useCommunityStats();
    const {
        mutateAsync: createCommunityPost,
        isPending: isCreatePending,
        isLoading: isCreateLoading,
    } = useCreateCommunityPost();

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

    const tabItems = useMemo(() => {
        if (!categoriesData || !Array.isArray(categoriesData)) {
            return [{ value: "all", label: "전체" }];
        }

        const unique = new Map<string, { value: string; label: string }>();

        categoriesData.forEach(category => {
            const rawValue =
                (category as any).value ||
                (category as any).id ||
                (category as any).name ||
                (category as any).label;

            if (!rawValue || typeof rawValue !== "string") {
                return;
            }

            const normalizedValue = rawValue.trim();
            if (!normalizedValue) {
                return;
            }

            const label =
                (category as any).label ||
                (category as any).name ||
                normalizedValue;

            if (!unique.has(normalizedValue)) {
                unique.set(normalizedValue, {
                    value: normalizedValue,
                    label,
                });
            }
        });

        return [{ value: "all", label: "전체" }, ...Array.from(unique.values())];
    }, [categoriesData]);

    const allowedTabs = useMemo(() => tabItems.map(item => item.value), [tabItems]);
    const activeTab = allowedTabs.includes(categoryParam) ? categoryParam : "all";
    const allowedSorts = ["latest", "popular", "trending"] as const;
    const normalizedSort = allowedSorts.includes(sortParam as typeof allowedSorts[number]) ? sortParam : "latest";
    const normalizedStats = useMemo(() => ({
        totalPosts: stats?.totalPosts ?? 0,
        activeUsers: stats?.activeUsers ?? 0,
        totalComments: stats?.totalComments ?? 0,
        avgLikes: stats?.avgLikes ?? 0,
        postsGrowthRate: stats?.postsGrowthRate ?? 0,
        usersGrowthRate: stats?.usersGrowthRate ?? 0,
    }), [stats]);

    const formatGrowth = useCallback((value: number) => {
        if (value > 0) {
            return `▲ ${value}%`;
        }
        if (value < 0) {
            return `▼ ${Math.abs(value)}%`;
        }
        return "변동 없음";
    }, []);

    const handleCreatePost = useCallback(async (data: CreateCommunityPostData) => {
        try {
            await createCommunityPost(data);
            toast.success("게시글이 등록되었습니다.");
            setShowCreateForm(false);
            onCreatePost?.();
            refetch();
            refetchStats();
        } catch (mutationError) {
            console.error("게시글 생성 실패:", mutationError);
            const message = mutationError instanceof Error
                ? mutationError.message
                : "게시글 등록 중 오류가 발생했습니다.";
            toast.error(message);
        }
    }, [createCommunityPost, onCreatePost, refetch, refetchStats]);

    const isCreatingPost = (isCreatePending ?? false) || (isCreateLoading ?? false);

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
                    <div className="mb-8 space-y-4">
                        {statsError ? (
                            <Card>
                                <CardContent className="p-6 text-center space-y-3">
                                    <p className="text-sm text-gray-600">커뮤니티 통계를 불러오지 못했습니다.</p>
                                    <Button size="sm" variant="outline" onClick={() => refetchStats()}>
                                        다시 시도
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">총 게시글</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {statsLoading ? "..." : normalizedStats.totalPosts.toLocaleString()}
                                                </p>
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            주간 증감: {statsLoading ? "..." : formatGrowth(normalizedStats.postsGrowthRate)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">최근 30일 활성 사용자</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {statsLoading ? "..." : normalizedStats.activeUsers.toLocaleString()}
                                                </p>
                                            </div>
                                            <Clock className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            주간 증감: {statsLoading ? "..." : formatGrowth(normalizedStats.usersGrowthRate)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">총 댓글</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {statsLoading ? "..." : normalizedStats.totalComments.toLocaleString()}
                                                </p>
                                            </div>
                                            <Filter className="w-5 h-5 text-green-600" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            커뮤니티 참여 지표
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">평균 좋아요</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {statsLoading ? "..." : normalizedStats.avgLikes.toLocaleString()}
                                                </p>
                                            </div>
                                            <Star className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            게시글당 평균 반응 수
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* 탭 및 게시글 목록 */}
                <div className="space-y-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="flex w-full flex-wrap gap-2">
                            {tabItems.map(item => (
                                <TabsTrigger key={item.value} value={item.value} className="flex-1 sm:flex-none">
                                    {item.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {categoriesError && (
                            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-500">
                                <span>카테고리를 불러오지 못했습니다.</span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => refetchCategories()}
                                    className="h-6 px-2 text-xs"
                                >
                                    다시 시도
                                </Button>
                            </div>
                        )}

                        <TabsContent value={activeTab} className="mt-6">
                            {showCreateForm ? (
                                <PostForm
                                    onSubmit={handleCreatePost}
                                    onCancel={() => setShowCreateForm(false)}
                                    isLoading={isCreatingPost}
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