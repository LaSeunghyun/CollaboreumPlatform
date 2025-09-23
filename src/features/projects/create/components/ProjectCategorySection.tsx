import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { Label } from '@radix-ui/react-label';
import type { ProjectCategoryOption } from '../types';

interface ProjectCategorySectionProps {
  category: string;
  options: ProjectCategoryOption[];
  loading?: boolean;
  hasError?: boolean;
  onRetry?: () => void | Promise<unknown>;
  onCategoryChange: (value: string) => void;
}

export const ProjectCategorySection: React.FC<ProjectCategorySectionProps> = ({
  category,
  options = [],
  loading = false,
  hasError = false,
  onRetry,
  onCategoryChange,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2 text-foreground'>
        카테고리 선택
      </CardTitle>
    </CardHeader>
    <CardContent className='space-y-4'>
      <div className='space-y-2'>
        <Label
          htmlFor='category'
          className='text-sm font-semibold text-foreground'
        >
          카테고리 <span className='text-danger-500'>*</span>
        </Label>
        <Select
          value={category}
          onValueChange={onCategoryChange}
          disabled={loading || options.length === 0}
        >
          <SelectTrigger aria-busy={loading} aria-invalid={hasError}>
            <SelectValue
              placeholder={
                loading
                  ? '카테고리를 불러오는 중...'
                  : options.length === 0
                    ? '사용 가능한 카테고리가 없습니다'
                    : '카테고리를 선택하세요'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasError && (
        <div className='rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-600'>
          <p>카테고리를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>
          {onRetry ? (
            <Button
              type='button'
              variant='ghost'
              tone='danger'
              size='xs'
              className='mt-2'
              onClick={() => {
                void onRetry();
              }}
            >
              다시 시도
            </Button>
          ) : null}
        </div>
      )}
    </CardContent>
  </Card>
);
