import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Badge } from '@/shared/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { ErrorRetry, LoadingRetry } from './ui/retry-button';
import { useQueryClient } from '@tanstack/react-query';

import { communityPostAPI, communityCommentAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getCategoryLabel,
  DEFAULT_CATEGORIES
} from '../constants/categories';
import {
  Search,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Flag,
  MoreHorizontal,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { getFirstChar, getUsername, getAvatarUrl } from '../utils/typeGuards';
import { safeArrayResponse, safeObjectResponse, getErrorMessage } from '../utils/apiUtils';

// Types
interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    role: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  likes: number;
  dislikes: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isReported: boolean;
  commentCount: number;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    role: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  dislikes: number;
  replies: Comment[];
  parentId?: string;
}

// Post Creation Form Component
export const PostCreationForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const postData = {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };

        await communityPostAPI.createPost(postData);

        // 폼 초기화
        setFormData({
          title: '',
          content: '',
          category: '',
          tags: ''
        });

        // 성공 메시지 표시 (토스트 등으로 개선 가능)
        alert('게시글이 성공적으로 작성되었습니다.');

        // React Query 캐시 무효화로 데이터 새로고침
        queryClient.invalidateQueries({ queryKey: ['community-posts'] });
        queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      } catch (error) {
        console.error('게시글 작성 실패:', error);
        alert('게시글 작성 중 오류가 발생했습니다.');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          새 게시글 작성
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">제목 *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="게시글 제목을 입력하세요"
              className={errors.title ? 'ring-2 ring-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">카테고리 *</label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger className={errors.category ? 'ring-2 ring-red-500' : ''}>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">내용 *</label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="게시글 내용을 입력하세요"
              rows={8}
              className={errors.content ? 'ring-2 ring-red-500' : ''}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">태그</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="태그를 쉼표로 구분하여 입력하세요"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              게시글 작성
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Post List Component
export const PostList: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  // 커뮤니티 포스트 데이터 상태
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // 커뮤니티 포스트 데이터 로드
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await communityPostAPI.getPosts();
        const data = safeArrayResponse<CommunityPost>(response, []);
        setPosts(data);
        setFilteredPosts(data);
      } catch (error) {
        console.error('커뮤니티 포스트 로드 실패:', error);
        setError(getErrorMessage(error, '커뮤니티 포스트를 불러올 수 없습니다.'));
        setPosts([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    // posts가 undefined이거나 배열이 아닌 경우 빈 배열로 처리
    const safePosts = Array.isArray(posts) ? posts : [];
    let filtered = safePosts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        case 'views':
          return b.views - a.views;
        case 'comments':
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory, sortBy]);

  const handlePostReaction = async (postId: string, reaction: 'like' | 'dislike') => {
    if (!user?.id) return;

    try {
      await communityPostAPI.togglePostReaction(postId, reaction);
      // React Query 캐시 무효화로 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
      // 게시글 목록 새로고침
      const response = await communityPostAPI.getPosts();
      const data = safeArrayResponse<CommunityPost>(response, []);
      setPosts(data);
    } catch (err) {
      console.error('반응 처리 실패:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="views">조회순</SelectItem>
                <SelectItem value="comments">댓글순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === ''
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            전체
          </button>
          {DEFAULT_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getAvatarUrl(post.author)} />
                    <AvatarFallback>{getFirstChar(post.author)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <Badge variant="secondary" className="text-xs">고정</Badge>
                          )}
                          <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>
                          <span className="text-sm text-gray-500">
                            {format(post.createdAt, 'MM/dd HH:mm')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">{post.content}</p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getUsername(post.author)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.views}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handlePostReaction(post.id, 'like')}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {typeof post.likes === 'number' ? post.likes : 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handlePostReaction(post.id, 'dislike')}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {typeof post.dislikes === 'number' ? post.dislikes : 0}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Post Detail Component
export const PostDetail: React.FC<{ postId: string }> = ({ postId }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 게시글 상세 정보 조회
        const postResponse = await communityPostAPI.getPostById(postId);
        const postData = safeObjectResponse<CommunityPost>(postResponse, null);
        setPost(postData);

        // 댓글 목록 조회
        const commentsResponse = await communityCommentAPI.getComments(postId);
        const commentsData = safeArrayResponse<Comment>(commentsResponse, []);
        setComments(commentsData);

        // 조회수 증가
        await communityPostAPI.incrementPostViews(postId);

      } catch (err) {
        console.error('데이터 로딩 실패:', err);
        setError(getErrorMessage(err, '데이터를 불러오는데 실패했습니다.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      const commentData = {
        content: newComment,
        parentId: replyTo || undefined
      };

      const response = await communityCommentAPI.createComment(postId, commentData);
      const newCommentData = safeObjectResponse<Comment>(response, null);
      if (newCommentData) {
        setComments((prev: any) => [...(Array.isArray(prev) ? prev : []), newCommentData]);
      }
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      setError('댓글 작성에 실패했습니다.');
    }
  };

  const handleReply = (commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
    setReplyContent('');
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !user?.id) return;

    try {
      const commentData = {
        content: replyContent,
        parentId: parentCommentId
      };

      const response = await communityCommentAPI.createComment(postId, commentData);
      const newCommentData = safeObjectResponse<Comment>(response, null);
      if (newCommentData) {
        setComments((prev: any) => [...(Array.isArray(prev) ? prev : []), newCommentData]);
      }
      setReplyContent('');
      setReplyTo(null);
    } catch (err) {
      console.error('답글 작성 실패:', err);
      setError('답글 작성에 실패했습니다.');
    }
  };

  const handlePostReaction = async (reaction: 'like' | 'dislike') => {
    if (!user?.id) return;

    try {
      await communityPostAPI.togglePostReaction(postId, reaction);
      // 게시글 정보 새로고침
      const updatedPostResponse = await communityPostAPI.getPostById(postId);
      const updatedPost = safeObjectResponse<CommunityPost>(updatedPostResponse, null);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (err) {
      console.error('반응 처리 실패:', err);
    }
  };

  const handleCommentReaction = async (commentId: string, reaction: 'like' | 'dislike') => {
    if (!user?.id) return;

    try {
      await communityCommentAPI.toggleCommentReaction(postId, commentId, reaction);
      // 댓글 목록 새로고침
      const updatedCommentsResponse = await communityCommentAPI.getComments(postId);
      const updatedComments = (updatedCommentsResponse as any)?.data || updatedCommentsResponse;
      setComments(updatedComments);
    } catch (err) {
      console.error('댓글 반응 처리 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <ErrorRetry
          error={error}
          onRetry={() => window.location.reload()}
          isLoading={loading}
          retryCount={0}
          maxRetries={3}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <p className="text-gray-600">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 게시글 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {post.isPinned && (
                    <Badge variant="secondary">고정</Badge>
                  )}
                  <Badge variant="outline">{getCategoryLabel(post.category)}</Badge>
                  <span className="text-sm text-gray-500">
                    {format(post.createdAt, 'PPP')}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={getAvatarUrl(post.author)} />
                <AvatarFallback>{getFirstChar(post.author)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getUsername(post.author)}</p>
                <p className="text-sm text-gray-600">{post.author.role || '사용자'}</p>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handlePostReaction('like')}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {typeof post.likes === 'number' ? post.likes : 0}
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  onClick={() => handlePostReaction('dislike')}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {typeof post.dislikes === 'number' ? post.dislikes : 0}
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                조회수 {post.views} • 댓글 {post.commentCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 작성 */}
      <Card>
        <CardHeader>
          <CardTitle>댓글 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="댓글을 입력하세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleAddComment}>댓글 작성</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 댓글 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>댓글 ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getAvatarUrl(comment.author)} />
                    <AvatarFallback>{getFirstChar(comment.author)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getUsername(comment.author)}</span>
                      <Badge variant="outline" className="text-xs">{comment.author.role || '사용자'}</Badge>
                      <span className="text-sm text-gray-500">
                        {format(comment.createdAt, 'MM/dd HH:mm')}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-2">{comment.content}</p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleCommentReaction(comment.id, 'like')}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {typeof comment.likes === 'number' ? comment.likes : 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleCommentReaction(comment.id, 'dislike')}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        {typeof comment.dislikes === 'number' ? comment.dislikes : 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                      >
                        답글
                      </Button>
                    </div>

                    {/* 답글 폼 */}
                    {replyTo === comment.id && (
                      <div className="mt-3 ml-4">
                        <Textarea
                          placeholder="답글을 입력하세요..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={2}
                          className="mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(comment.id)}
                          >
                            답글 작성
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyTo(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Community System Component
export const CommunitySystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
        <p className="text-gray-600">다양한 주제에 대해 이야기하고 소통해보세요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">게시글 목록</TabsTrigger>
          <TabsTrigger value="create">게시글 작성</TabsTrigger>
          <TabsTrigger value="my-posts">내 게시글</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <PostList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <PostCreationForm />
        </TabsContent>

        <TabsContent value="my-posts" className="mt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">내 게시글 기능은 곧 추가될 예정입니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySystem;
