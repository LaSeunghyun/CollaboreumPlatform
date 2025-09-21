import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Search, Filter, X, RotateCcw } from 'lucide-react';

interface ProjectFiltersProps {
  filters: ProjectFiltersState;
  onFiltersChange: (newFilters: ProjectFiltersState) => void;
  onReset?: () => void;
}

export interface ProjectFiltersState {
  search?: string;
  category?: string;
  status?: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
  sortBy?: 'newest' | 'popular' | 'ending' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
  page?: number;
  limit?: number;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { value: 'music', label: '음악' },
    { value: 'art', label: '미술' },
    { value: 'film', label: '영화' },
    { value: 'literature', label: '문학' },
    { value: 'design', label: '디자인' },
    { value: 'technology', label: '기술' },
    { value: 'fashion', label: '패션' },
    { value: 'food', label: '푸드' },
    { value: 'other', label: '기타' },
  ];

  const statusOptions = [
    { value: 'collecting', label: '모금 중' },
    { value: 'succeeded', label: '성공' },
    { value: 'executing', label: '집행 중' },
    { value: 'distributing', label: '분배 중' },
    { value: 'closed', label: '종료' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: '최신순' },
    { value: 'progress', label: '진행률순' },
    { value: 'currentAmount', label: '모금액순' },
    { value: 'backerCount', label: '후원자수순' },
    { value: 'endDate', label: '마감일순' },
  ];

  const popularTags = [
    '음악',
    '앨범',
    '공연',
    '재즈',
    '록',
    '클래식',
    '미술',
    '전시',
    '회화',
    '조각',
    '사진',
    '영화',
    '단편영화',
    '다큐멘터리',
    '애니메이션',
    '디자인',
    '그래픽',
    '패션',
    '제품',
  ];

  const handleFilterChange = (key: keyof ProjectFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleStatusToggle = (status: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];

    handleFilterChange('status', newStatus);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    handleFilterChange('tags', newTags);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onFiltersChange({
        search: '',
        category: '',
        status: [],
        minAmount: null,
        maxAmount: null,
        sortBy: 'newest',
        sortOrder: 'desc',
        tags: [],
      });
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    (filters.status && filters.status.length > 0) ||
    filters.minAmount ||
    filters.maxAmount ||
    (filters.tags && filters.tags.length > 0);

  return (
    <Card className='mb-6'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Filter className='h-5 w-5 text-muted-foreground' />
            <h3 className='text-lg font-semibold text-foreground'>필터</h3>
            {hasActiveFilters && (
              <span className='rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700'>
                {(filters.status?.length || 0) +
                  (filters.tags?.length || 0) +
                  (filters.search ? 1 : 0) +
                  (filters.category ? 1 : 0) +
                  (filters.minAmount || filters.maxAmount ? 1 : 0)}
                개 적용됨
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            {hasActiveFilters && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleReset}
                className='text-muted-foreground hover:text-foreground'
              >
                <RotateCcw className='mr-1 h-4 w-4' />
                초기화
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-muted-foreground hover:text-foreground'
            >
              {isExpanded ? '접기' : '더보기'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* 검색 */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-muted-foreground'>
            검색
          </label>
          <div className='relative'>
            <Search className='text-muted-foreground/70 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              placeholder='프로젝트 제목, 설명 검색...'
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {/* 기본 필터 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              카테고리
            </label>
            <Select
              value={filters.category}
              onValueChange={value => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='카테고리 선택' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>전체</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              정렬
            </label>
            <div className='flex space-x-2'>
              <Select
                value={filters.sortBy}
                onValueChange={value => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className='flex-1'>
                  <SelectValue placeholder='정렬 기준' />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={value =>
                  handleFilterChange('sortOrder', value as 'asc' | 'desc')
                }
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='desc'>↓</SelectItem>
                  <SelectItem value='asc'>↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 확장된 필터 */}
        {isExpanded && (
          <div className='border-border/60 space-y-6 border-t pt-4'>
            {/* 상태 필터 */}
            <div className='space-y-3'>
              <label className='text-sm font-medium text-muted-foreground'>
                상태
              </label>
              <div className='flex flex-wrap gap-2'>
                {statusOptions.map(option => (
                  <label
                    key={option.value}
                    className='flex cursor-pointer items-center space-x-2'
                  >
                    <Checkbox
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <span className='text-sm text-muted-foreground'>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 금액 범위 */}
            <div className='space-y-3'>
              <label className='text-sm font-medium text-muted-foreground'>
                목표 금액 범위
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Input
                    type='number'
                    placeholder='최소 금액'
                    value={filters.minAmount || ''}
                    onChange={e =>
                      handleFilterChange(
                        'minAmount',
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </div>
                <div>
                  <Input
                    type='number'
                    placeholder='최대 금액'
                    value={filters.maxAmount || ''}
                    onChange={e =>
                      handleFilterChange(
                        'maxAmount',
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* 인기 태그 */}
            <div className='space-y-3'>
              <label className='text-sm font-medium text-muted-foreground'>
                인기 태그
              </label>
              <div className='flex flex-wrap gap-2'>
                {popularTags.map(tag => (
                  <Button
                    key={tag}
                    type='button'
                    size='sm'
                    variant={filters.tags?.includes(tag) ? 'solid' : 'outline'}
                    onClick={() => handleTagToggle(tag)}
                    className='rounded-full'
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                  {filters.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant='outline'
                      className='inline-flex items-center gap-1 rounded-full border-primary-200 bg-primary-50 text-primary-700'
                    >
                      <span>#{tag}</span>
                      <Button
                        variant='ghost'
                        size='icon-sm'
                        className='size-5 rounded-full text-primary-700 hover:bg-primary-100'
                        onClick={() => handleTagToggle(tag)}
                        aria-label={`태그 ${tag} 제거`}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectFilters;
