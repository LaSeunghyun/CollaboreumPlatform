import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, communityAPI, communityPostAPI } from '../services/api';
import { ApiResponse } from '../types';
import { useDeleteCommunityPost } from '../features/community/hooks/useCommunityPosts';
import { ArrowLeft, Heart, MessageCircle, Eye, Trash2, MoreVertical, Copy, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getFirstChar, getUsername } from '../utils/typeGuards';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from './ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

interface Comment {
    id: string;
    author: string;
    authorId: string;
    content: string;
    timeAgo: string;
    createdAt: Date;
    replies?: Comment[]; // 대댓글 배열
    parentId?: string; // 부모 댓글 ID (대댓글인 경우)
}

interface PostDetail {
    id: string;
    title: string;
    category: string;
    author: string;
    authorId: string;
    content: string;
    images: string[];
    timeAgo: string;
    replies: number;
    likes: number;
    dislikes: number;
    isLiked: boolean;
    isDisliked: boolean;
    isHot: boolean;
    viewCount: number;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    comments: Comment[];
}

interface CommunityPostDetailProps {
    postId: string;
    onBack?: () => void;
}

export const CommunityPostDetail: React.FC<CommunityPostDetailProps> = ({
    postId,
    onBack
}) => {
    const { user } = useAuth();
    const deletePostMutation = useDeleteCommunityPost();
    const [post, setPost] = useState<PostDetail | null>(null);
    const [comment, setComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // 대댓글 관련 상태
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // 링크 복사 기능
    const handleCopyLink = async () => {
        const link = `${window.location.origin}/community/post/${postId}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (error) {
            console.error('링크 복사 실패:', error);
        }
    };

    // 소셜 공유 기능
    const handleSocialShare = (platform: 'twitter' | 'facebook' | 'kakao') => {
        const link = `${window.location.origin}/community/post/${postId}`;
        const title = post?.title || '게시글';

        switch (platform) {
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
                break;
            case 'kakao':
                // 카카오톡 공유는 Kakao SDK가 필요하므로 기본 링크 복사로 대체
                handleCopyLink();
                break;
        }
    };

    useEffect(() => {
        // postId가 유효하지 않은 경우 처리
        if (!postId || postId === 'undefined') {
            setError('유효하지 않은 게시글 ID입니다.');
            setIsLoading(false);
            return;
        }

        // 현재 페이지 정보를 세션 스토리지에 저장
        const currentPage = window.location.href;
        const previousPage = sessionStorage.getItem('currentPage');

        if (previousPage && previousPage !== currentPage) {
            sessionStorage.setItem('previousPage', previousPage);
        }

        sessionStorage.setItem('currentPage', currentPage);

        fetchPostDetail();
        // 조회수 증가
        incrementViewCount();

        // 브라우저 뒤로가기 버튼 처리
        const handlePopState = () => {
            handleBack();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [postId]);

    const fetchPostDetail = async () => {
        if (!postId || postId === 'undefined') {
            setError('유효하지 않은 게시글 ID입니다.');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await authAPI.get(`/community/posts/${postId}`) as ApiResponse<PostDetail>;

            if (response.success && response.data) {
                const postData = response.data;
                // API 응답을 컴포넌트에서 사용하는 형식으로 변환
                // 댓글 데이터 변환 함수
                const transformComments = (comments: any[]): Comment[] => {
                    if (!Array.isArray(comments)) return [];

                    return comments.map((comment: any) => ({
                        id: comment.id || comment._id || '',
                        author: comment.author || comment.authorName || 'Unknown',
                        authorId: comment.authorId || comment.author || comment.authorName || '',
                        content: comment.content || '',
                        timeAgo: comment.timeAgo || formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko }),
                        createdAt: new Date(comment.createdAt),
                        replies: comment.replies ? transformComments(comment.replies) : [],
                        parentId: comment.parentId
                    }));
                };

                const formattedPost: PostDetail = {
                    id: postData.id || (postData as any)._id || postId, // _id를 id로 매핑
                    title: postData.title,
                    category: postData.category,
                    author: typeof postData.author === 'string' ? postData.author : (postData.author as any)?.name || 'Unknown',
                    authorId: typeof postData.author === 'string' ? postData.author : (postData.author as any)?.id || postData.author,
                    content: postData.content,
                    images: postData.images || [],
                    timeAgo: formatDistanceToNow(new Date(postData.createdAt), { addSuffix: true, locale: ko }),
                    replies: postData.replies || 0,
                    likes: Array.isArray(postData.likes) ? postData.likes.length : (postData.likes || 0),
                    dislikes: Array.isArray(postData.dislikes) ? postData.dislikes.length : (postData.dislikes || 0),
                    isLiked: false,
                    isDisliked: false,
                    isHot: (Array.isArray(postData.likes) ? postData.likes.length : (postData.likes || 0)) > 20,
                    viewCount: postData.views || postData.viewCount || 0,
                    views: postData.views || postData.viewCount || 0,
                    createdAt: new Date(postData.createdAt),
                    updatedAt: new Date(postData.updatedAt),
                    comments: transformComments(postData.comments || [])
                };
                setPost(formattedPost);

                // 사용자별 반응 상태 확인
                if (user && formattedPost.id) {
                    try {
                        const reactionsResponse = await communityPostAPI.getPostReactions(formattedPost.id) as ApiResponse<any>;
                        if (reactionsResponse?.success && reactionsResponse?.data) {
                            const data = reactionsResponse.data;
                            setPost((prev: any) => prev ? {
                                ...prev,
                                isLiked: data?.isLiked || false,
                                isDisliked: data?.isDisliked || false,
                                likes: data?.likes || 0,
                                dislikes: data?.dislikes || 0
                            } : null);
                        }
                    } catch (err) {
                        console.error('반응 상태 확인 실패:', err);
                    }
                }
            } else {
                setError('포스트를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('포스트 상세 조회 오류:', error);
            setError('포스트 조회 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 조회수 증가 함수
    const incrementViewCount = async () => {
        if (!postId || postId === 'undefined') {
            return;
        }

        try {
            await authAPI.post(`/community/posts/${postId}/views`);
        } catch (error) {
            console.error('조회수 증가 실패:', error);
            // 조회수 증가 실패는 사용자에게 보여주지 않음
        }
    };

    const handleLike = async () => {
        if (!user || !post) return;

        try {
            setIsLiking(true);

            // 이미 좋아요가 되어 있다면 취소, 아니면 좋아요
            const action = post.isLiked ? 'unlike' : 'like';

            const response = await authAPI.post(`/community/posts/${postId}/reaction`, {
                type: action
            }) as ApiResponse<any>;

            if (response.success && response.data) {
                // 좋아요 상태를 즉시 업데이트
                setPost((prev: any) => prev ? {
                    ...prev,
                    likes: response.data.likes,
                    dislikes: response.data.dislikes,
                    isLiked: !prev.isLiked, // 토글
                    isDisliked: false, // 좋아요를 누르면 싫어요는 자동으로 취소
                    isHot: response.data.likes > 20
                } : null);
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleDislike = async () => {
        if (!user || !post) return;

        try {
            setIsDisliking(true);

            // 이미 싫어요가 되어 있다면 취소, 아니면 싫어요
            const action = post.isDisliked ? 'undislike' : 'dislike';

            const response = await authAPI.post(`/community/posts/${postId}/reaction`, {
                type: action
            }) as ApiResponse<any>;

            if (response.success && response.data) {
                // 싫어요 상태를 즉시 업데이트
                setPost((prev: any) => prev ? {
                    ...prev,
                    likes: response.data.likes,
                    dislikes: response.data.dislikes,
                    isLiked: false, // 싫어요를 누르면 좋아요는 자동으로 취소
                    isDisliked: !prev.isDisliked // 토글
                } : null);
            }
        } catch (error) {
            console.error('싫어요 처리 오류:', error);
        } finally {
            setIsDisliking(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim() || !user || !post) return;

        try {
            setIsSubmittingComment(true);
            const response = await authAPI.post(`/communities/posts/${postId}/comments`, {
                content: comment.trim()
            }) as ApiResponse<any>;

            if (response.success && response.data) {
                setComment('');
                // 댓글 목록 새로고침
                fetchPostDetail();
            }
        } catch (error) {
            console.error('댓글 작성 오류:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCommentDelete = async (commentId: string) => {
        if (!user || !post) return;

        try {
            const response = await authAPI.delete(`/communities/posts/${postId}/comments/${commentId}`) as ApiResponse<any>;

            if (response.success) {
                // 댓글 목록 새로고침
                fetchPostDetail();
            }
        } catch (error) {
            console.error('댓글 삭제 오류:', error);
        }
    };

    // 대댓글 작성 함수
    const handleReplySubmit = async (e: React.FormEvent, parentCommentId: string) => {
        e.preventDefault();
        if (!replyContent.trim() || !user || !post) return;

        try {
            setIsSubmittingReply(true);
            const response = await communityAPI.replyToComment(postId, parentCommentId, replyContent.trim()) as ApiResponse<any>;

            if (response.success && response.data) {
                setReplyContent('');
                setReplyingTo(null);
                // 댓글 목록 새로고침
                fetchPostDetail();
            }
        } catch (error) {
            console.error('대댓글 작성 오류:', error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // 대댓글 작성 취소
    const cancelReply = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    // 대댓글 표시 함수
    const renderReplies = (replies: Comment[] = []) => {
        if (replies.length === 0) return null;

        return (
            <div className="ml-8 mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
                {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 p-3 bg-gray-100 rounded-lg">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>{getFirstChar(reply.author)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{getUsername(reply.author)}</span>
                                    <span className="text-xs text-gray-500">{reply.timeAgo}</span>
                                </div>
                                {canDeleteComment(reply.authorId) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCommentDelete(reply.id)}
                                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const canDeleteComment = (commentAuthorId: string) => {
        return user && (user.id === commentAuthorId || user.id === post?.authorId);
    };

    const canDeletePost = () => {
        return user && post && (user.id === post.authorId || user.role === 'admin');
    };

    const handleDeletePost = async () => {
        if (!user || !post) return;

        try {
            await deletePostMutation.mutateAsync(postId);
            // 삭제 성공 시 목록으로 돌아가기
            handleBack();
        } catch (error) {
            console.error('게시글 삭제 오류:', error);
            setError('게시글 삭제 중 오류가 발생했습니다.');
        } finally {
            setShowDeleteDialog(false);
        }
    };

    // 이전 페이지로 돌아가기
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            // 더 확실한 뒤로가기 방법
            try {
                // 세션 스토리지에서 이전 페이지 정보 확인
                const previousPage = sessionStorage.getItem('previousPage');

                if (previousPage && previousPage !== window.location.href) {
                    // 이전 페이지로 이동
                    window.location.href = previousPage;
                } else if (window.history.length > 1) {
                    // 브라우저 히스토리에서 이전 페이지로 이동
                    window.history.back();
                } else {
                    // 모두 실패하면 홈으로 이동
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('뒤로가기 실패:', error);
                // 에러 발생 시 홈으로 이동
                window.location.href = '/';
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">포스트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
                    <p className="text-gray-600 mb-4">{error || '포스트를 찾을 수 없습니다.'}</p>
                    <Button onClick={handleBack} variant="outline">
                        ← 목록으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const isLiked = post.isLiked;
    const isDisliked = post.isDisliked;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* 헤더 */}
                <div className="mb-6">
                    <Button onClick={handleBack} variant="outline" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        이전 페이지로 돌아가기
                    </Button>

                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="secondary">{post.category}</Badge>
                                        {post.isHot && (
                                            <Badge variant="destructive">HOT</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>작성자: {post.author}</span>
                                        <span>{post.timeAgo}</span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {post.viewCount}
                                        </span>
                                    </div>
                                </div>

                                {/* 액션 버튼들 */}
                                <div className="flex items-center gap-2">
                                    {/* 링크 복사 버튼 */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyLink}
                                        className="h-8 px-3"
                                    >
                                        {copiedLink ? (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                복사됨
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <Copy className="w-4 h-4" />
                                                링크 복사
                                            </div>
                                        )}
                                    </Button>

                                    {/* 소셜 공유 메뉴 */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 px-3">
                                                <Share2 className="w-4 h-4 mr-1" />
                                                공유
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                    트위터
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                                    페이스북
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSocialShare('kakao')}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                                                    카카오톡
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    {/* 게시글 액션 메뉴 */}
                                    {canDeletePost() && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => setShowDeleteDialog(true)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    삭제
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* 포스트 내용 */}
                            <div className="prose max-w-none mb-6">
                                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* 이미지 */}
                            {post.images && post.images.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {post.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`이미지 ${index + 1}`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* 액션 버튼 */}
                            <div className="flex items-center gap-4 py-4 border-t border-gray-200">
                                <Button
                                    variant="ghost"
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : ''}`}
                                >
                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    좋아요 {post.likes}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleDislike}
                                    disabled={isDisliking}
                                    className={`flex items-center gap-2 ${isDisliked ? 'text-blue-500' : ''}`}
                                >
                                    <svg className={`w-5 h-5 ${isDisliked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
                                    </svg>
                                    싫어요 {post.dislikes}
                                </Button>
                                <div className="flex items-center gap-2 text-gray-500">
                                    <MessageCircle className="w-5 h-5" />
                                    댓글 {post.replies}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 댓글 섹션 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">댓글 ({post.replies})</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {/* 댓글 작성 폼 */}
                        {user && (
                            <form onSubmit={handleCommentSubmit} className="mb-6">
                                <div className="flex gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{getFirstChar(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Input
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="댓글을 입력하세요..."
                                            maxLength={1000}
                                            disabled={isSubmittingComment}
                                        />
                                        <div className="text-sm text-gray-500 text-right mt-1">
                                            {comment.length}/1000
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={!comment.trim() || isSubmittingComment}
                                        size="sm"
                                    >
                                        {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* 댓글 목록 */}
                        <div className="space-y-4">
                            {(Array.isArray(post.comments) ? post.comments : []).length === 0 ? (
                                <p className="text-center text-gray-500 py-8">
                                    아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                                </p>
                            ) : (
                                (Array.isArray(post.comments) ? post.comments : []).map((comment) => (
                                    <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                                        <Avatar className="w-10 h-10">
                                            <AvatarFallback>{getFirstChar(comment.author)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{getUsername(comment.author)}</span>
                                                    <span className="text-xs text-gray-500">{comment.timeAgo}</span>
                                                </div>
                                                {canDeleteComment(comment.authorId) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCommentDelete(comment.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 h-auto"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-gray-700">{comment.content}</p>

                                            {/* 대댓글 작성 버튼 */}
                                            {user && (
                                                <div className="mt-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setReplyingTo(comment.id)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                                    >
                                                        답글 달기
                                                    </Button>
                                                </div>
                                            )}

                                            {/* 대댓글 작성 폼 */}
                                            {replyingTo === comment.id && (
                                                <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder={`${comment.author}님에게 답글 달기...`}
                                                            maxLength={500}
                                                            disabled={isSubmittingReply}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            disabled={!replyContent.trim() || isSubmittingReply}
                                                            size="sm"
                                                        >
                                                            {isSubmittingReply ? '작성 중...' : '답글'}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={cancelReply}
                                                        >
                                                            취소
                                                        </Button>
                                                    </div>
                                                    <div className="text-xs text-gray-500 text-right mt-1">
                                                        {replyContent.length}/500
                                                    </div>
                                                </form>
                                            )}

                                            {renderReplies(comment.replies)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 삭제 확인 모달 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 게시글을 정말 삭제하시겠습니까? 삭제된 게시글은 복구할 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletePostMutation.isPending}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePost}
                            disabled={deletePostMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deletePostMutation.isPending ? '삭제 중...' : '삭제'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
