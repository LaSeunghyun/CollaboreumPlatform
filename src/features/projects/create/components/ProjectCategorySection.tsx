import React from 'react';
import {
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

interface ProjectCategorySectionProps {
  category: string;
  onCategoryChange: (value: string) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'music', label: '음악' },
  { value: 'art', label: '미술' },
  { value: 'design', label: '디자인' },
  { value: 'writing', label: '글쓰기' },
  { value: 'video', label: '영상' },
  { value: 'other', label: '기타' },
];

export const ProjectCategorySection: React.FC<ProjectCategorySectionProps> = ({
  category,
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
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder='카테고리를 선택하세요' />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);
