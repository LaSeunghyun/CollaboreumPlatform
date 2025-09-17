import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Search, Plus, Filter, TrendingUp, MessageCircle, Users } from 'lucide-react';
import { PostList } from './PostList';
import { PostForm } from './PostForm';
import { useCommunityPosts, useCommunityStats, useCommunityCategories } from '../hooks/useCommunity';
import { CommunityPost, PostListParams, PostSortOptions } from '../types/index';

interface CommunityMainProps {
    onPostClick?: (post: CommunityPost) => void;
    onCreatePost?: () => void;
    showStats?: boolean;
}

export function CommunityMain({
    onPostClick,
    onCreatePost,
    showStats = true
}: CommunityMainProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'create' | 'my-posts'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'likes' | 'views' | 'comments'>('createdAt');
    const [sortOrder, setSortOrder] = useState<PostSortOptions['order']>('desc');

    // API 훅들
    const { data: stats } = useCommunityStats();
    const { data: categoriesData } = useCommunityCategories();

    // 게시글 목록 파라미터
    const listParams: PostListParams = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy,
        order: sortOrder,
        page: 1,
        limit: 20
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색은 자동으로 실행됨 (useCommunityPosts가 params 변경을 감지)
    };

    const handleSortChange = (field: 'createdAt' | 'likes' | 'views' | 'comments') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleCreatePost = (data: any) => {
        // 게시글 생성 로직은 부모 컴포넌트에서 처리
        if (onCreatePost) {
            onCreatePost();
        }
        setActiveTab('list');
    };

    const handleCancelCreate = () => {
        setActiveTab('list');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <>
                    {/* 헤더 */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
                        <p className="text-gray-600">다양한 주제에 대해 이야기하고 소통해보세요</p>
                    </div>

                    {/* 통계 카드 */}
                    {showStats && stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-medium mb-1">총 게시글</h3>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats?.totalPosts?.toLocaleString() || '0'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-medium mb-1">활성 사용자</h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats?.totalUsers?.toLocaleString() || '0'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-medium mb-1">총 댓글</h3>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats?.totalComments?.toLocaleString() || '0'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <TrendingUp className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h3 className="font-medium mb-1">총 좋아요</h3>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {stats?.totalLikes?.toLocaleString() || '0'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* 메인 컨텐츠 */}
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="list">게시글 목록</TabsTrigger>
                            <TabsTrigger value="create">게시글 작성</TabsTrigger>
                            <TabsTrigger value="my-posts">내 게시글</TabsTrigger>
                        </TabsList>

                        {/* 게시글 목록 탭 */}
                        <TabsContent value="list" className="mt-6">
                            <div className="space-y-6">
                                {/* 검색 및 필터 */}
                                <Card>
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSearch} className="space-y-4">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                {/* 검색 */}
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

                                                {/* 카테고리 필터 */}
                                                <div className="w-full md:w-48">
                                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="카테고리 선택" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="">전체 카테고리</SelectItem>
                                                            {categoriesData?.categories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* 정렬 */}
                                                <div className="w-full md:w-48">
                                                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                                                        const [field, order] = value.split('-');
                                                        setSortBy(field as 'createdAt' | 'likes' | 'views' | 'comments');
                                                        setSortOrder(order as PostSortOptions['order']);
                                                    }}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="createdAt-desc">최신순</SelectItem>
                                                            <SelectItem value="createdAt-asc">오래된순</SelectItem>
                                                            <SelectItem value="likes-desc">인기순</SelectItem>
                                                            <SelectItem value="views-desc">조회순</SelectItem>
                                                            <SelectItem value="comments-desc">댓글순</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>

                                {/* 게시글 목록 */}
                                <PostList
                                    params={listParams}
                                    onPostClick={onPostClick}
                                    showActions={true}
                                />
                            </div>
                        </TabsContent>

                        {/* 게시글 작성 탭 */}
                        <TabsContent value="create" className="mt-6">
                            <PostForm
                                onSubmit={handleCreatePost}
                                onCancel={handleCancelCreate}
                            />
                        </TabsContent>

                        {/* 내 게시글 탭 */}
                        <TabsContent value="my-posts" className="mt-6">
                            <PostList
                                params={{ ...listParams, author: 'me' }}
                                onPostClick={onPostClick}
                                showActions={true}
                                emptyMessage="작성한 게시글이 없습니다."
                            />
                        </TabsContent>
                    </Tabs>
                </>
            </div>
        </div>
    );
}
