import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, communityAPI } from '../services/api';
import { ApiResponse, CommunityPostResponse } from '../types';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  timeAgo: string;
  replies: number;
  likes: number;
  isHot: boolean;
  images?: string[];
}

interface CommunityPostListProps {
  onWritePost: () => void;
  onPostClick: (postId: string) => void;
}

// 기본 카테고리 (API 실패 시 사용)
const DEFAULT_CATEGORIES = [
  { value: '전체', label: '전체' },
  { value: '음악', label: '음악' },
  { value: '미술', label: '미술' },
  { value: '문학', label: '문학' },
  { value: '공연', label: '공연' },
  { value: '사진', label: '사진' },
  { value: '기타', label: '기타' }
];

export const CommunityPostList: React.FC<CommunityPostListProps> = ({
  onWritePost,
  onPostClick
}) => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      const response = await authAPI.get('/categories') as ApiResponse<any[]>;
      if (response.success && response.data && Array.isArray(response.data)) {
        const categoryLabels = response.data.map((cat: any) => ({
          value: cat.label || cat.name,
          label: cat.label || cat.name
        }));
        setCategories([{ value: '전체', label: '전체' }, ...categoryLabels]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      // 오류 시 기본 카테고리 사용
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const fetchPosts = async (page: number = 1, category: string = selectedCategory) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (category !== '전체') {
        params.append('category', category);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await authAPI.get(`/community/posts?${params.toString()}`) as ApiResponse<CommunityPostResponse[]>;

      if (response.success && response.data && Array.isArray(response.data)) {
        // CommunityPostResponse를 Post 타입으로 변환
        const mappedPosts: Post[] = response.data.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          author: post.authorName,
          timeAgo: new Date(post.createdAt).toLocaleDateString('ko-KR'),
          replies: 0, // API에서 replies 정보가 없으므로 기본값 설정
          likes: post.likes.length,
          isHot: post.views > 100, // 조회수 기반으로 hot 여부 판단
          images: []
        }));

        if (page === 1) {
          setPosts(mappedPosts);
        } else {
          setPosts(prev => [...prev, ...mappedPosts]);
        }
        setTotalPosts(response.data.length > 0 && response.data[0].pagination ? response.data[0].pagination.totalPosts : 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('포스트 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts(1, selectedCategory);
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPosts(1, selectedCategory);
  };

  const handleLoadMore = () => {
    fetchPosts(currentPage + 1, selectedCategory);
  };

  const handleSortChange = async (sort: 'latest' | 'popular') => {
    setSortBy(sort);
    setIsLoading(true);

    try {
      // 서버에서 정렬된 데이터를 받아오기
      const response = await communityAPI.getForumPosts(selectedCategory === "전체" ? undefined : selectedCategory, {
        sort: sort === 'popular' ? 'likes' : 'createdAt',
        order: 'desc'
      });

      if ((response as any).success && (response as any).data) {
        setPosts((response as any).data);
      }
    } catch (error) {
      // 에러 발생 시 클라이언트 사이드 정렬로 폴백
      const sortedPosts = [...posts];
      if (sort === 'popular') {
        sortedPosts.sort((a, b) => b.likes - a.likes);
      }
      setPosts(sortedPosts);
    } finally {
      setIsLoading(false);
    }
  };

  const formatContent = (content: string) => {
    if (content.length > 100) {
      return content.substring(0, 100) + '...';
    }
    return content;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 카테고리 필터 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">카테고리</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.value
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 및 정렬 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Input
                placeholder="아티스트 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              <Button
                size="sm"
                onClick={handleSearch}
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                🔍
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {totalPosts}개의 글
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange(sortBy === 'latest' ? 'popular' : 'latest')}
            >
              {sortBy === 'latest' ? '최신순' : '인기순'}
            </Button>
            {isAuthenticated && (
              <Button
                onClick={onWritePost}
                className="bg-blue-600 hover:bg-blue-700"
              >
                새 글 작성
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 포스트 목록 */}
      <div className="space-y-4">
        {posts.length === 0 && !isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">아직 작성된 글이 없습니다.</p>
            {isAuthenticated && (
              <Button
                onClick={onWritePost}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                첫 번째 글을 작성해보세요!
              </Button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPostClick(post.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      {post.isHot && (
                        <Badge variant="destructive" className="text-xs">
                          HOT
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-3 line-clamp-3">
                  {formatContent(post.content)}
                </p>

                {/* 이미지 미리보기 */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {post.images.slice(0, 3).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`이미지 ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                    {post.images.length > 3 && (
                      <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-500">
                        +{post.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{post.author}</span>
                    <span>{post.timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>💬 {post.replies}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 더 보기 버튼 */}
      {posts.length > 0 && posts.length < totalPosts && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            className="px-8 py-3"
          >
            {isLoading ? '로딩 중...' : '더 많은 글 보기'}
          </Button>
        </div>
      )}
    </div>
  );
};
