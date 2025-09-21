import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../shared/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/Tabs';
import {
  Search,
  ArrowLeft,
  User,
  Palette,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useSearch } from '../../lib/api/useUser';
import { format } from 'date-fns';

interface SearchResult {
  type: 'artist' | 'project' | 'event' | 'post';
  id: string;
  title: string;
  description?: string;
  author?: string;
  category?: string;
  createdAt?: string;
  image?: string;
  tags?: string[];
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');

  // 디바운싱된 검색어
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // React Query를 사용한 검색 (디바운싱된 쿼리 사용)
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
    isError,
    failureCount,
  } = useSearch(debouncedQuery.trim());

  // URL 파라미터와 동기화
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]); // query 의존성 제거로 무한루프 방지

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // 검색 결과 처리
  const results = (searchResults as SearchResult[]) || [];
  const filteredResults =
    activeTab === 'all'
      ? results
      : results.filter(result => result.type === activeTab);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'artist':
        return <User className='h-4 w-4' />;
      case 'project':
        return <Palette className='h-4 w-4' />;
      case 'event':
        return <Calendar className='h-4 w-4' />;
      case 'post':
        return <MessageSquare className='h-4 w-4' />;
      default:
        return <Search className='h-4 w-4' />;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case 'artist':
        return `/artists/${result.id}`;
      case 'project':
        return `/projects/${result.id}`;
      case 'event':
        return `/events/${result.id}`;
      case 'post':
        return `/community/post/${result.id}`;
      default:
        return '#';
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <div className='mb-4 flex items-center gap-4'>
          <Button variant='ghost' onClick={handleBack} className='p-2'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-3xl font-bold'>검색 결과</h1>
        </div>

        <form onSubmit={handleSearch} className='max-w-2xl'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='검색어를 입력하세요...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='pl-10'
            />
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className='py-12 text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>검색 중...</p>
        </div>
      ) : isError ? (
        <div className='py-12 text-center'>
          <p className='text-red-500'>
            {error?.message || '검색 중 오류가 발생했습니다.'}
          </p>
          {failureCount > 0 && (
            <p className='mt-2 text-sm text-gray-500'>
              재시도 횟수: {failureCount}/3
            </p>
          )}
          <Button onClick={() => refetch()} className='mt-4'>
            다시 시도
          </Button>
        </div>
      ) : results.length === 0 && query ? (
        <div className='py-12 text-center'>
          <p className='text-gray-500'>검색 결과가 없습니다.</p>
          <p className='mt-2 text-sm text-gray-400'>
            다른 검색어로 시도해보세요.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className='space-y-6'>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className='grid w-full grid-cols-5'>
              <TabsTrigger value='all'>전체</TabsTrigger>
              <TabsTrigger value='artist'>아티스트</TabsTrigger>
              <TabsTrigger value='project'>프로젝트</TabsTrigger>
              <TabsTrigger value='event'>이벤트</TabsTrigger>
              <TabsTrigger value='post'>게시글</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className='mt-6'>
              <div className='space-y-4'>
                {filteredResults.map(result => (
                  <Card
                    key={`${result.type}-${result.id}`}
                    className='transition-shadow hover:shadow-md'
                  >
                    <CardContent className='p-6'>
                      <div className='flex gap-4'>
                        <div className='flex-shrink-0'>
                          {result.image ? (
                            <Avatar className='h-12 w-12'>
                              <AvatarImage src={result.image} />
                              <AvatarFallback>
                                {getResultIcon(result.type)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
                              {getResultIcon(result.type)}
                            </div>
                          )}
                        </div>

                        <div className='flex-1'>
                          <div className='mb-2 flex items-start justify-between'>
                            <h3
                              className='cursor-pointer text-lg font-semibold hover:text-blue-600'
                              onClick={() => navigate(getResultLink(result))}
                            >
                              {result.title}
                            </h3>
                            <Badge variant='outline'>{result.type}</Badge>
                          </div>

                          {result.description && (
                            <p className='mb-3 line-clamp-2 text-gray-600'>
                              {result.description}
                            </p>
                          )}

                          <div className='flex items-center gap-4 text-sm text-gray-500'>
                            {result.author && (
                              <div className='flex items-center gap-1'>
                                <User className='h-4 w-4' />
                                {result.author}
                              </div>
                            )}
                            {result.category && (
                              <Badge variant='secondary' className='text-xs'>
                                {result.category}
                              </Badge>
                            )}
                            {result.createdAt && (
                              <div className='flex items-center gap-1'>
                                <Calendar className='h-4 w-4' />
                                {format(new Date(result.createdAt), 'MM/dd')}
                              </div>
                            )}
                          </div>

                          {result.tags && result.tags.length > 0 && (
                            <div className='mt-3 flex flex-wrap gap-1'>
                              {result.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant='secondary'
                                  className='text-xs'
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;
