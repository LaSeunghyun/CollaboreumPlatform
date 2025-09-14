// 커뮤니티 게시글 목록 컴포넌트 (API-first + UI 규칙 + 테스트)
import React from 'react'
import {
    useCommunityPosts,
    useLikeCommunityPost,
    useViewCommunityPost,
    type CommunityPostListQuery
} from '../index'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge,
    Button,
    SkeletonCard,
    // ProjectListSkeleton,
    EmptyState,
    ErrorMessage
} from '../../../shared/ui'
import {
    Heart,
    MessageCircle,
    Eye,
    Calendar,
    User,
    Tag
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface CommunityPostListProps {
    query?: CommunityPostListQuery
    onPostClick?: (postId: string) => void
    onCreatePost?: () => void
}

export function CommunityPostList({
    query = {},
    onPostClick,
    onCreatePost
}: CommunityPostListProps) {
    const {
        data,
        isLoading,
        error,
        refetch
    } = useCommunityPosts(query)

    const likePostMutation = useLikeCommunityPost()
    const viewPostMutation = useViewCommunityPost()

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        )
    }

    // 에러 상태
    if (error) {
        return (
            <ErrorMessage
                error={error}
                onRetry={() => refetch()}
            />
        )
    }

    // 빈 상태
    if (!data?.posts || data.posts.length === 0) {
        return (
            <EmptyState
                title="게시글이 없습니다"
                description="첫 번째 게시글을 작성해보세요."
                action={onCreatePost ? {
                    label: "게시글 작성",
                    onClick: onCreatePost
                } : undefined}
            />
        )
    }

    const handlePostClick = (postId: string) => {
        // 조회수 증가
        viewPostMutation.mutate(postId)
        onPostClick?.(postId)
    }

    const handleLikeClick = (postId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        likePostMutation.mutate(postId)
    }

    return (
        <div className="space-y-4">
            {data.posts.map((post) => (
                <Card
                    key={post.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePostClick(post.id)}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center space-x-2">
                                    {post.isPinned && (
                                        <Badge variant="destructive" size="sm">
                                            고정
                                        </Badge>
                                    )}
                                    {post.isHot && (
                                        <Badge variant="default" size="sm">
                                            인기
                                        </Badge>
                                    )}
                                    <Badge variant="outline" size="sm">
                                        {post.category}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg line-clamp-2">
                                    {post.title}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
                            {post.content}
                        </p>

                        {/* 태그 */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" size="sm">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* 작성자 정보 */}
                        <div className="flex items-center space-x-2 text-sm text-neutral-500 mb-4">
                            <User className="h-4 w-4" />
                            <span>{post.author.name}</span>
                            <span>•</span>
                            <Calendar className="h-4 w-4" />
                            <span>
                                {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                    locale: ko
                                })}
                            </span>
                        </div>

                        {/* 통계 */}
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleLikeClick(post.id, e)}
                                className="h-8 px-2"
                            >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                            >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {post.replies}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                {post.views}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
