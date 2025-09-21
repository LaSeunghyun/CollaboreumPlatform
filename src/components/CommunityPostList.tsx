import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { Input } from './ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { communityApi } from '../features/community/api/communityApi';
import { KOREAN_CATEGORIES } from '../constants/categories';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  timeAgo: string;
  replies: number;
  likes: number;
  dislikes: number;
  views: number;
  isHot: boolean;
  images?: string[];
  createdAt: string;
}

interface CommunityPostListProps {
  onWritePost: () => void;
  onPostClick: (postId: string) => void;
}

// 기본 카테고리 (API 실패 시 사용)
const DEFAULT_CATEGORIES = KOREAN_CATEGORIES.map(category => ({
  value: category,
  label: category,
}));

export const CommunityPostList: React.FC<CommunityPostListProps> = ({
  onWritePost,
  onPostClick,
}) => {
  const navigate = useNavigate();
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
      const categories = await communityApi.getCategories();
      if (Array.isArray(categories)) {
        const categoryLabels = categories.map((cat: any) => ({
          value: cat.label || cat.name,
          label: cat.label || cat.name,
        }));
        setCategories([{ value: '전체', label: '전체' }, ...categoryLabels]);
      }
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      // 오류 시 기본 카테고리 사용
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const fetchPosts = useCallback(
    async (page: number = 1, category: string = selectedCategory) => {
      setIsLoading(true);
      try {
        const response = await communityApi.getPosts({
          page,
          limit: 20,
          category: category !== '전체' ? category : undefined,
          search: searchQuery.trim() || undefined,
        });

        if (response.posts) {
          // CommunityPost를 Post 타입으로 변환
          const mappedPosts: Post[] = response.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            author:
              typeof post.author === 'string'
                ? post.author
                : post.author?.name || 'Unknown',
            timeAgo: new Date(post.createdAt).toLocaleDateString('ko-KR'),
            replies: post.comments?.length || 0,
            likes: post.likes?.length || 0,
            dislikes: post.dislikes?.length || 0,
            views: post.views || 0,
            isHot: (post.likes?.length || 0) > 20 || (post.views || 0) > 100,
            images: post.images || [],
            createdAt: post.createdAt,
          }));

          if (page === 1) {
            setPosts(mappedPosts);
          } else {
            setPosts(prev => [...prev, ...mappedPosts]);
          }
          setTotalPosts(response.pagination?.total || 0);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('포스트 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, searchQuery],
  );

  useEffect(() => {
    fetchCategories();
    fetchPosts(1, selectedCategory);
  }, [selectedCategory, searchQuery]); // fetchPosts 의존성 제거로 무한루프 방지

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
      const response = await communityApi.getPosts({
        category: selectedCategory === '전체' ? undefined : selectedCategory,
        sortBy: sort === 'popular' ? 'likes' : 'createdAt',
        order: 'desc',
      });

      if (response.posts) {
        // CommunityPost를 Post 타입으로 변환
        const mappedPosts: Post[] = response.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          author:
            typeof post.author === 'string'
              ? post.author
              : post.author?.name || 'Unknown',
          timeAgo: new Date(post.createdAt).toLocaleDateString('ko-KR'),
          replies: post.comments?.length || 0,
          likes: post.likes?.length || 0,
          dislikes: post.dislikes?.length || 0,
          views: post.views || 0,
          isHot: (post.likes?.length || 0) > 20 || (post.views || 0) > 100,
          images: post.images || [],
          createdAt: post.createdAt,
        }));
        setPosts(mappedPosts);
      }
    } catch {
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

  // const formatContent = (content: string) => {
  //   if (content.length > 100) {
  //     return content.substring(0, 100) + '...';
  //   }
  //   return content;
  // };

  return (
    <div className='mx-auto w-full max-w-6xl space-y-6'>
      {/* 카테고리 필터 */}
      <div className='rounded-lg bg-white p-4 shadow-sm'>
        <h3 className='mb-3 text-lg font-semibold'>카테고리</h3>
        <div className='flex flex-wrap gap-2'>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'border-2 border-blue-300 bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 및 정렬 */}
      <div className='rounded-lg bg-white p-4 shadow-sm'>
        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='max-w-md flex-1'>
            <div className='relative'>
              <Input
                placeholder='아티스트 검색...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                className='pr-10'
              />
              <Button
                size='sm'
                onClick={handleSearch}
                className='absolute right-1 top-1 h-8 w-8 p-0'
              >
                🔍
              </Button>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-600'>{totalPosts}개의 글</span>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                handleSortChange(sortBy === 'latest' ? 'popular' : 'latest')
              }
            >
              {sortBy === 'latest' ? '최신순' : '인기순'}
            </Button>
            {isAuthenticated && (
              <Button
                onClick={() => navigate('/community/create')}
                className='bg-blue-600 hover:bg-blue-700'
              >
                새 글 작성
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 포스트 목록 */}
      <div className='rounded-lg bg-white shadow-sm'>
        {/* 테이블 헤더 */}
        <div className='hidden gap-4 border-b bg-gray-50 p-4 text-sm font-medium text-gray-600 md:grid md:grid-cols-12'>
          <div className='col-span-1 text-center'>번호</div>
          <div className='col-span-5'>제목</div>
          <div className='col-span-2 text-center'>작성자</div>
          <div className='col-span-1 text-center'>조회</div>
          <div className='col-span-1 text-center'>좋아요</div>
          <div className='col-span-1 text-center'>싫어요</div>
          <div className='col-span-1 text-center'>작성일</div>
        </div>

        {posts.length === 0 && !isLoading ? (
          <div className='py-12 text-center text-gray-500'>
            <p className='text-lg'>아직 작성된 글이 없습니다.</p>
            {isAuthenticated && (
              <Button
                onClick={onWritePost}
                className='mt-4 bg-blue-600 hover:bg-blue-700'
              >
                첫 번째 글을 작성해보세요!
              </Button>
            )}
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              className='hidden cursor-pointer gap-4 border-b p-4 transition-colors hover:bg-gray-50 md:grid md:grid-cols-12'
              onClick={() => onPostClick(post.id)}
            >
              {/* 번호 */}
              <div className='col-span-1 text-center text-sm text-gray-500'>
                {totalPosts - (currentPage - 1) * 20 - index}
              </div>

              {/* 제목 */}
              <div className='col-span-5'>
                <div className='mb-1 flex items-center gap-2'>
                  <Badge variant='secondary' className='text-xs'>
                    {post.category}
                  </Badge>
                  {post.isHot && (
                    <Badge variant='destructive' className='text-xs'>
                      HOT
                    </Badge>
                  )}
                </div>
                <h3 className='line-clamp-1 text-sm font-medium hover:text-blue-600'>
                  {post.title}
                  {post.replies > 0 && (
                    <span className='ml-1 text-blue-600'>[{post.replies}]</span>
                  )}
                </h3>
              </div>

              {/* 작성자 */}
              <div className='col-span-2 text-center text-sm text-gray-600'>
                {post.author}
              </div>

              {/* 조회수 */}
              <div className='col-span-1 text-center text-sm text-gray-500'>
                {post.views.toLocaleString()}
              </div>

              {/* 좋아요 */}
              <div className='col-span-1 text-center text-sm text-gray-500'>
                <div className='flex items-center justify-center gap-1'>
                  <span className='text-red-500'>❤️</span>
                  <span>{post.likes}</span>
                </div>
              </div>

              {/* 싫어요 */}
              <div className='col-span-1 text-center text-sm text-gray-500'>
                <div className='flex items-center justify-center gap-1'>
                  <span className='text-blue-500'>👎</span>
                  <span>{post.dislikes}</span>
                </div>
              </div>

              {/* 작성일 */}
              <div className='col-span-1 text-center text-sm text-gray-500'>
                {post.timeAgo}
              </div>
            </div>
          ))
        )}

        {/* 모바일 레이아웃 */}
        {posts.length > 0 && (
          <div className='md:hidden'>
            {posts.map((post, index) => (
              <div
                key={post.id}
                className='cursor-pointer border-b p-4 transition-colors hover:bg-gray-50'
                onClick={() => onPostClick(post.id)}
              >
                <div className='flex items-start gap-3'>
                  {/* 번호 */}
                  <div className='w-8 flex-shrink-0 text-center text-sm text-gray-500'>
                    {totalPosts - (currentPage - 1) * 20 - index}
                  </div>

                  <div className='min-w-0 flex-1'>
                    {/* 카테고리 및 핫 배지 */}
                    <div className='mb-2 flex items-center gap-1'>
                      <Badge variant='secondary' className='text-xs'>
                        {post.category}
                      </Badge>
                      {post.isHot && (
                        <Badge variant='destructive' className='text-xs'>
                          HOT
                        </Badge>
                      )}
                    </div>

                    {/* 제목 */}
                    <h3 className='mb-2 line-clamp-2 text-sm font-medium hover:text-blue-600'>
                      {post.title}
                      {post.replies > 0 && (
                        <span className='ml-1 text-blue-600'>
                          [{post.replies}]
                        </span>
                      )}
                    </h3>

                    {/* 하단 정보 */}
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <div className='flex items-center gap-2'>
                        <span>{post.author}</span>
                        <span>·</span>
                        <span>{post.timeAgo}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='flex items-center gap-1'>
                          <span>👁️</span>
                          <span>
                            {post.views > 999
                              ? `${Math.floor(post.views / 1000)}k`
                              : post.views}
                          </span>
                        </span>
                        <span className='flex items-center gap-1'>
                          <span className='text-red-500'>❤️</span>
                          <span>{post.likes}</span>
                        </span>
                        <span className='flex items-center gap-1'>
                          <span className='text-blue-500'>👎</span>
                          <span>{post.dislikes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 더 보기 버튼 */}
      {posts.length > 0 && posts.length < totalPosts && (
        <div className='text-center'>
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant='outline'
            className='px-8 py-3'
          >
            {isLoading ? '로딩 중...' : '더 많은 글 보기'}
          </Button>
        </div>
      )}
    </div>
  );
};
