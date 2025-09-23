import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui';
import { Label } from '@radix-ui/react-label';

interface ProjectMediaSectionProps {
  image: File | null;
  onImageSelect: (file: File | null) => void;
}

export const ProjectMediaSection: React.FC<ProjectMediaSectionProps> = ({
  image,
  onImageSelect,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2 text-foreground'>
        프로젝트 이미지
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label
            htmlFor='image'
            className='text-sm font-semibold text-foreground'
          >
            대표 이미지 업로드
          </Label>
          <Input
            id='image'
            type='file'
            accept='image/*'
            onChange={event => onImageSelect(event.target.files?.[0] ?? null)}
          />
        </div>
        {image && (
          <div className='mt-2'>
            <img
              src={URL.createObjectURL(image)}
              alt='프로젝트 미리보기'
              className='h-32 w-32 rounded-2xl object-cover'
            />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);
