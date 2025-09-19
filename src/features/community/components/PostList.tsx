import React from 'react';
import { PostCard } from './PostCard';
import { RefreshCw } from 'lucide-react';
import { useCommunityPosts } from '../hooks/useCommunity';
import { PostListParams, CommunityPost } from '../types/index';
import { Skeleton, ErrorMessage, Button } from '@/shared/ui';

interface PostListProps {
    params?: PostListParams;
    onPostClick?: (post: CommunityPost) => void;
    onLike?: (postId: string) => void;
    onDislike?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onReport?: (postId: string) => void;
    onEdit?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    showActions?: boolean;
    compact?: boolean;
    emptyMessage?: string;
    showRefresh?: boolean;
}

export function PostList({
    params = {},
    onPostClick,
    onLike,
    onDislike,
    onBookmark,
    onReport,
    onEdit,
    onDelete,
    showActions = true,
    compact = false,
    emptyMessage = "게시글이 없습니다.",
    showRefresh = true
}: PostListProps) {
    const {
        data,
        isLoading,
        error,
        refetch,
        isRefetching
    } = useCommunityPosts(params);

    const handlePostClick = (post: CommunityPost) => {
        if (onPostClick) {
            onPostClick(post);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3 mb-4" />
                        <div className="flex space-x-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ErrorMessage
                    error={error}
                />
                {showRefresh && (
                    <Button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="mt-4"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        다시 시도
                    </Button>
                )}
            </div>
        );
    }

    const posts = data?.posts || [];

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">{emptyMessage}</div>
                {showRefresh && (
                    <Button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        variant="outline"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        새로고침
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="cursor-pointer"
                >
                    <PostCard
                        post={post}
                        onLike={onLike}
                        onDislike={onDislike}
                        onBookmark={onBookmark}
                        onReport={onReport}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        showActions={showActions}
                        compact={compact}
                    />
                </div>
            ))}

            {/* 페이지네이션은 별도 컴포넌트로 분리 예정 */}
            {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                    <div className="text-sm text-gray-500">
                        {data.pagination.page} / {data.pagination.pages} 페이지
                        ({data.pagination.total}개 게시글)
                    </div>
                </div>
            )}
        </div>
    );
}
