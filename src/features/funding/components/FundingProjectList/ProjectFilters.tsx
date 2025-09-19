import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/Select";
import { Checkbox } from "@/shared/ui/Checkbox";
import { Search, Filter, X, RotateCcw } from "lucide-react";

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
  onReset
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
    { value: 'other', label: '기타' }
  ];

  const statusOptions = [
    { value: 'collecting', label: '모금 중' },
    { value: 'succeeded', label: '성공' },
    { value: 'executing', label: '집행 중' },
    { value: 'distributing', label: '분배 중' },
    { value: 'closed', label: '종료' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: '최신순' },
    { value: 'progress', label: '진행률순' },
    { value: 'currentAmount', label: '모금액순' },
    { value: 'backerCount', label: '후원자수순' },
    { value: 'endDate', label: '마감일순' }
  ];

  const popularTags = [
    '음악', '앨범', '공연', '재즈', '록', '클래식',
    '미술', '전시', '회화', '조각', '사진',
    '영화', '단편영화', '다큐멘터리', '애니메이션',
    '디자인', '그래픽', '패션', '제품'
  ];

  const handleFilterChange = (key: keyof ProjectFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
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
        tags: []
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
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">필터</h3>
            {hasActiveFilters && (
              <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                {(filters.status?.length || 0) + (filters.tags?.length || 0) + (filters.search ? 1 : 0) + (filters.category ? 1 : 0) + (filters.minAmount || filters.maxAmount ? 1 : 0)}개 적용됨
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                초기화
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '접기' : '더보기'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 검색 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">검색</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="프로젝트 제목, 설명 검색..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 기본 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">카테고리</label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">전체</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">정렬</label>
            <div className="flex space-x-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">↓</SelectItem>
                  <SelectItem value="asc">↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 확장된 필터 */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            {/* 상태 필터 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">상태</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 금액 범위 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">목표 금액 범위</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="최소 금액"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="최대 금액"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
              </div>
            </div>

            {/* 인기 태그 */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">인기 태그</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.tags?.includes(tag)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="hover:text-primary-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
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