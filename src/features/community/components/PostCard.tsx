import React from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import {
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Bookmark,
    Flag,
    MoreHorizontal,
    Calendar,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getFirstChar } from '../../../utils/typeGuards';
import { PostCardProps } from '../types/index';
import { useLikeCommunityPost } from '../hooks/useCommunity';

export function PostCard({
    post,
    onLike,
    onDislike,
    onBookmark,
    onReport,
    onEdit,
    onDelete,
    showActions = true,
    compact = false
}: PostCardProps) {
    const likePostMutation = useLikeCommunityPost();

    const handleLike = () => {
        if (onLike) {
            onLike(post.id);
        } else {
            // PostCard에서 직접 처리하는 경우
            const action = post.isLiked ? 'unlike' : 'like';
            likePostMutation.mutate({ postId: post.id, action });
        }
    };

    const handleDislike = () => {
        if (onDislike) {
            onDislike(post.id);
        } else {
            // PostCard에서 직접 처리하는 경우
            const action = post.isDisliked ? 'undislike' : 'dislike';
            likePostMutation.mutate({ postId: post.id, action });
        }
    };

    const handleBookmark = () => {
        if (onBookmark) {
            onBookmark(post.id);
        }
    };

    const handleReport = () => {
        if (onReport) {
            onReport(post.id);
        }
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit(post.id);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(post.id);
        }
    };

    return (
        <Card className={`hover:shadow-md transition-shadow ${compact ? 'p-4' : ''}`}>
            <CardHeader className={compact ? 'pb-2' : ''}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={post.author.avatar} alt={post.author.username} />
                            <AvatarFallback>{getFirstChar(post.author.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{post.author.username}</span>
                                {post.author.isVerified && (
                                    <Badge variant="secondary" className="text-xs">인증</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                    {post.author.role === 'admin' ? '관리자' :
                                        post.author.role === 'artist' ? '아티스트' : '팬'}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
                                {post.updatedAt !== post.createdAt && (
                                    <span className="text-blue-500">(수정됨)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex items-center space-x-1">
                            {onEdit && (
                                <Button variant="ghost" size="sm" onClick={handleEdit} title="수정">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="ghost" size="sm" onClick={handleDelete} title="삭제">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleReport} title="신고">
                                <Flag className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="더보기">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className={compact ? 'pt-0' : ''}>
                <div className="space-y-3">
                    {/* 제목 */}
                    <h3 className={`font-semibold text-gray-900 hover:text-blue-600 cursor-pointer ${compact ? 'text-base' : 'text-lg'}`}>
                        {post.title}
                    </h3>

                    {/* 내용 미리보기 */}
                    {!compact && (
                        <p className="text-gray-600 line-clamp-3">
                            {post.content.replace(/<[^>]*>/g, '')} {/* HTML 태그 제거 */}
                        </p>
                    )}

                    {/* 카테고리 및 태그 */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{post.category}</Badge>
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    {/* 통계 및 액션 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'text-blue-500' : ''}`} />
                                <span className={post.isLiked ? 'text-blue-500 font-medium' : ''}>
                                    {post.likes}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <ThumbsDown className={`w-4 h-4 ${post.isDisliked ? 'text-red-500' : ''}`} />
                                <span className={post.isDisliked ? 'text-red-500 font-medium' : ''}>
                                    {post.dislikes}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{post.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views}</span>
                            </div>
                        </div>

                        {showActions && (
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLike}
                                    className={post.isLiked ? 'text-blue-500' : ''}
                                >
                                    <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleDislike}
                                    className={post.isDisliked ? 'text-red-500' : ''}
                                >
                                    <ThumbsDown className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleBookmark}
                                    className={post.isBookmarked ? 'text-yellow-500' : ''}
                                >
                                    <Bookmark className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
