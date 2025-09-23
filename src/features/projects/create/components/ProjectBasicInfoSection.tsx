import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from '@/shared/ui';
import { Label } from '@radix-ui/react-label';

interface ProjectBasicInfoSectionProps {
  title: string;
  description: string;
  tags: string;
  onChange: (field: 'title' | 'description' | 'tags', value: string) => void;
}

export const ProjectBasicInfoSection: React.FC<ProjectBasicInfoSectionProps> = ({
  title,
  description,
  tags,
  onChange,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2 text-foreground'>
        기본 정보
      </CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <div className='space-y-2'>
        <Label
          htmlFor='title'
          className='text-sm font-semibold text-foreground'
        >
          프로젝트 제목 <span className='text-danger-500'>*</span>
        </Label>
        <Input
          id='title'
          value={title}
          onChange={event => onChange('title', event.target.value)}
          placeholder='프로젝트 제목을 입력하세요'
          required
        />
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='description'
          className='text-sm font-semibold text-foreground'
        >
          프로젝트 설명 <span className='text-danger-500'>*</span>
        </Label>
        <Textarea
          id='description'
          value={description}
          onChange={event => onChange('description', event.target.value)}
          placeholder='프로젝트에 대한 상세한 설명을 입력하세요'
          rows={6}
          required
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='tags' className='text-sm font-semibold text-foreground'>
          태그
        </Label>
        <Input
          id='tags'
          value={tags}
          onChange={event => onChange('tags', event.target.value)}
          placeholder='태그를 쉼표로 구분하여 입력하세요 (예: 음악, 앨범, 인디)'
        />
      </div>
    </CardContent>
  </Card>
);
