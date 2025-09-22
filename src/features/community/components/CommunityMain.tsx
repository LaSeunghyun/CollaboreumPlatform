import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useCreateCommunityPost } from '@/features/community/hooks/useCommunityPosts';
import { useCommunityPosts } from '@/lib/api/useCommunityPosts';
import { useCategories } from '@/lib/api/useCategories';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';
import { Input } from '@/shared/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { Search, Plus, Clock, Flame, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

import type {
  CommunityPost,
  CommunityPostListQuery,
  CreateCommunityPostData,
} from '../types';
import PostForm from './PostForm';
import PostTable from './PostTable';

interface CommunityMainProps {
  onPostClick?: (post: CommunityPost) => void;
  onCreatePost?: () => void;
}

const CommunityMain: React.FC<CommunityMainProps> = ({ onPostClick, onCreatePost }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'latest';
  const orderParam = searchParams.get('order');
  const searchParam = searchParams.get('search') || '';
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const statusParam = searchParams.get('status');
  const authorParam = searchParams.get('authorId');

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  const mapSortOption = useCallback(
    (option: string): Pick<CommunityPostListQuery, 'sortBy' | 'order'> => {
      switch (option) {
        case 'popular':
          return { sortBy: 'likes', order: 'desc' };
        case 'trending':
          return { sortBy: 'views', order: 'desc' };
        case 'latest':
        default:
          return { sortBy: 'createdAt', order: 'desc' };
      }
    },
    [],
  );

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);

        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            next.delete(key);
            return;
          }

          if (key === 'page' && value === '1') {
            next.delete(key);
            return;
          }

          next.set(key, value);
        });

        return next;
      });
    },
    [setSearchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      updateSearchParams({
        category: value === 'all' ? null : value,
        page: '1',
      });
    },
    [updateSearchParams],
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const { order } = mapSortOption(value);
      updateSearchParams({
        sort: value,
        order,
        page: '1',
      });
    },
    [mapSortOption, updateSearchParams],
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchInput(value);

      const normalized = value.trim();
      updateSearchParams({
        search: normalized ? normalized : null,
        page: '1',
      });
    },
    [updateSearchParams],
  );

  const query = useMemo<CommunityPostListQuery>(() => {
    const params: CommunityPostListQuery = {};

    if (categoryParam && categoryParam !== 'all') {
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
      params.status = statusParam as CommunityPostListQuery['status'];
    }

    if (authorParam) {
      params.authorId = authorParam;
    }

    const { sortBy, order } = mapSortOption(sortParam);
    if (sortBy) {
      params.sortBy = sortBy;
    }

    const normalizedOrder =
      (orderParam as CommunityPostListQuery['order']) || order;
    if (normalizedOrder) {
      params.order = normalizedOrder;
    }

    return params;
  }, [
    authorParam,
    categoryParam,
    limitParam,
    mapSortOption,
    orderParam,
    pageParam,
    searchParam,
    sortParam,
    statusParam,
  ]);

  const { data, isLoading, isFetching, error, refetch } = useCommunityPosts(query);

  const {
    data: categoriesData = [],
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();
  const { mutateAsync: createCommunityPost, isPending: isCreatePending } =
    useCreateCommunityPost();

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
      return [{ value: 'all', label: '전체' }];
    }

    const unique = new Map<string, { value: string; label: string }>();

    categoriesData.forEach(category => {
      const rawValue =
        (category as any).value ||
        (category as any).id ||
        (category as any).name ||
        (category as any).label;

      if (!rawValue || typeof rawValue !== 'string') {
        return;
      }

      const normalizedValue = rawValue.trim();
      if (!normalizedValue) {
        return;
      }

      const label =
        (category as any).label || (category as any).name || normalizedValue;

      if (!unique.has(normalizedValue)) {
        unique.set(normalizedValue, {
          value: normalizedValue,
          label,
        });
      }
    });

    return [{ value: 'all', label: '전체' }, ...Array.from(unique.values())];
  }, [categoriesData]);

  const allowedTabs = useMemo(
    () => tabItems.map(item => item.value),
    [tabItems],
  );
  const activeTab = allowedTabs.includes(categoryParam) ? categoryParam : 'all';
  const allowedSorts = ['latest', 'popular', 'trending'] as const;
  const normalizedSort = allowedSorts.includes(
    sortParam as (typeof allowedSorts)[number],
  )
    ? sortParam
    : 'latest';
  const handleCreatePost = useCallback(
    async (data: CreateCommunityPostData) => {
      try {
        await createCommunityPost(data);
        toast.success('게시글이 등록되었습니다.');
        setShowCreateForm(false);
        onCreatePost?.();
        refetch();
      } catch (mutationError) {
        console.error('게시글 생성 실패:', mutationError);
        const message =
          mutationError instanceof Error
            ? mutationError.message
            : '게시글 등록 중 오류가 발생했습니다.';
        toast.error(message);
      }
    },
    [
      createCommunityPost,
      onCreatePost,
      refetch,
    ],
  );

  const isCreatingPost = isCreatePending ?? false;

  const handlePostClick = (post: CommunityPost) => {
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const quickFilterOptions = useMemo(
    () => [
      {
        key: 'latest',
        label: '최신 글',
        description: '방금 등록된 글부터 확인해보세요.',
        icon: Clock,
      },
      {
        key: 'popular',
        label: '인기 글',
        description: '좋아요가 많은 글로 영감을 받아보세요.',
        icon: Flame,
      },
      {
        key: 'trending',
        label: '활발한 글',
        description: '지금 대화가 활발한 글을 모았어요.',
        icon: MessageCircle,
      },
    ],
    [],
  );

  const handleQuickFilter = useCallback(
    (value: string) => {
      handleSortChange(value);
    },
    [handleSortChange],
  );

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-7xl p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>커뮤니티</h1>
              <p className='mt-1 text-gray-600'>
                아티스트들과 소통하고 협업하세요
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className='flex items-center space-x-2'
            >
              <Plus className='h-4 w-4' />
              <span>글쓰기</span>
            </Button>
          </div>

          {/* 검색 및 필터 */}
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  placeholder='게시글 검색...'
                  value={searchInput}
                  onChange={handleSearchChange}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={normalizedSort} onValueChange={handleSortChange}>
              <SelectTrigger className='w-full sm:w-48'>
                <SelectValue placeholder='정렬 방식' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='latest'>최신순</SelectItem>
                <SelectItem value='popular'>인기순</SelectItem>
                <SelectItem value='trending'>트렌딩</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {quickFilterOptions.map(option => {
            const Icon = option.icon;
            const isActive = normalizedSort === option.key;
            return (
              <button
                key={option.key}
                type='button'
                onClick={() => handleQuickFilter(option.key)}
                className='group flex h-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-primary-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              >
                <span
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 transition group-hover:bg-primary-100'
                  aria-hidden='true'
                >
                  <Icon className='h-5 w-5' />
                </span>
                <span className='flex flex-col gap-1'>
                  <span className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
                    {option.label}
                    {isActive && (
                      <span className='rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700'>
                        적용됨
                      </span>
                    )}
                  </span>
                  <span className='text-xs text-gray-500'>{option.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 탭 및 게시글 목록 */}
        <div className='space-y-6'>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className='flex w-full flex-wrap gap-2'>
              {tabItems.map(item => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className='flex-1 sm:flex-none'
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categoriesError && (
              <div className='mt-2 flex items-center justify-end gap-2 text-xs text-gray-500'>
                <span>카테고리를 불러오지 못했습니다.</span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => refetchCategories()}
                  className='h-6 px-2 text-xs'
                >
                  다시 시도
                </Button>
              </div>
            )}

            <TabsContent value={activeTab} className='mt-6'>
              {showCreateForm ? (
                <PostForm
                  onSubmit={handleCreatePost}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={isCreatingPost}
                />
              ) : (
                <div className='space-y-4'>
                  {isLoading ? (
                    <ProjectListSkeleton />
                  ) : error ? (
                    <ErrorMessage
                      error={error as Error}
                      onRetry={() => refetch()}
                    />
                  ) : posts.length > 0 ? (
                    <PostTable posts={posts} onPostClick={handlePostClick} />
                  ) : (
                    <Card>
                      <CardContent className='p-8 text-center'>
                        <p className='text-gray-500'>게시글이 없습니다.</p>
                      </CardContent>
                    </Card>
                  )}

                  {!isLoading && !error && isFetching && (
                    <Card>
                      <CardContent className='p-4 text-center text-sm text-gray-500'>
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
