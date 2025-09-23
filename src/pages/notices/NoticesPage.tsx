import React, { useState } from 'react';
import { Input } from '@/shared/ui/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Search, AlertCircle } from 'lucide-react';
import { NoticePost } from '../../components/organisms/NoticePost';
import { useNotices } from '../../lib/api/useNotices';
import {
  LoadingState,
  ErrorState,
  EmptyNoticesState,
} from '../../components/organisms/States';

export const NoticesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // API 훅
  const {
    data: notices,
    isLoading,
    error,
  } = useNotices({
    search: searchQuery || undefined,
    sortBy: sortBy,
    order: sortBy === 'latest' ? 'desc' : 'desc',
  });

  const handleSearch = () => {
    // 검색 로직은 useNotices 훅이 자동으로 처리
  };

  const renderNotices = () => {
    if (isLoading) {
      return <LoadingState title='공지사항을 불러오는 중...' />;
    }

    if (error) {
      return (
        <ErrorState
          title='공지사항을 불러올 수 없습니다'
          description='잠시 후 다시 시도해주세요.'
        />
      );
    }

    if (
      !((notices as any)?.data?.posts || (notices as any)?.posts) ||
      ((notices as any)?.data?.posts || (notices as any)?.posts || [])
        .length === 0
    ) {
      return (
        <EmptyNoticesState
          action={{
            label: '새로고침',
            onClick: () => window.location.reload(),
          }}
        />
      );
    }

    return (
      <Card>
        <CardContent className='p-0'>
          <div className='divide-y'>
            {(
              (notices as any)?.data?.posts ||
              (notices as any)?.posts ||
              []
            ).map((notice: any) => (
              <NoticePost key={notice.id} {...notice} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>공지사항</h1>
          <p className='text-muted-foreground'>
            Collaboreum의 최신 소식과 정책을 확인하세요
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='secondary' className='bg-indigo/10 text-indigo'>
            <AlertCircle className='mr-1 h-3 w-3' />
            OFFICIAL
          </Badge>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative max-w-md flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
          <Input
            placeholder='공지사항 검색...'
            className='pl-10'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='latest'>최신순</SelectItem>
            <SelectItem value='views'>조회순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {renderNotices()}
    </div>
  );
};
