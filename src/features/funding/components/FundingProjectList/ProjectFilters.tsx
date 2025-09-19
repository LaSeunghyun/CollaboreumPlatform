import React from 'react';
import { FundingFilters } from '../../types/funding.types';
import { Select, Input, Button } from '@/shared/ui';

interface ProjectFiltersProps {
  filters: FundingFilters;
  onFiltersChange: (filters: Partial<FundingFilters>) => void;
}

const CATEGORIES = [
  { value: '', label: '전체 카테고리' },
  { value: '음악', label: '음악' },
  { value: '미술', label: '미술' },
  { value: '영화', label: '영화' },
  { value: '게임', label: '게임' },
  { value: '기술', label: '기술' },
  { value: '기타', label: '기타' },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '진행중' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'ending', label: '마감임박순' },
  { value: 'amount', label: '금액순' },
];

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = React.useState<FundingFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FundingFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: FundingFilters = {};
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카테고리 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <Select
            value={localFilters.category || ''}
            onValueChange={(value) => handleFilterChange('category', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 상태 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상태
          </label>
          <Select
            value={localFilters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 금액 범위 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최소 금액
          </label>
          <Input
            type="number"
            placeholder="최소 금액"
            value={localFilters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            최대 금액
          </label>
          <Input
            type="number"
            placeholder="최대 금액"
            value={localFilters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <Select
            value={localFilters.sortBy || 'newest'}
            onValueChange={(value) => handleFilterChange('sortBy', value as any)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={localFilters.sortOrder || 'desc'}
            onValueChange={(value) => handleFilterChange('sortOrder', value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="정렬 순서" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">내림차순</SelectItem>
              <SelectItem value="asc">오름차순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleResetFilters}
          >
            초기화
          </Button>
          <Button
            onClick={handleApplyFilters}
          >
            적용
          </Button>
        </div>
      </div>
    </div>
  );
};
