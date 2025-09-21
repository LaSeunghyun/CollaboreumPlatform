import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Heart,
  Share2,
  // Calendar,
  // Target,
  // Users,
  // TrendingUp
} from 'lucide-react';
import { FundingProject } from '@/types/fundingProject';

interface ProjectHeaderProps {
  project: FundingProject;
  onBack: () => void;
  onLike: () => void;
  onShare: () => void;
  onSupport: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onBack,
  onLike,
  onShare,
  onSupport,
}) => {
  const projectImage = project.image;
  const artistInitial = project.artist?.charAt?.(0) ?? '아';
  const progress = project.progressPercentage ?? 0;
  const currentAmount = project.currentAmount ?? 0;
  const backerCount = project.backers ?? 0;
  const daysLeft = project.daysLeft ?? 0;
  const category = project.category ?? '카테고리 미정';

  return (
    <div className='space-y-6'>
      {/* 뒤로가기 버튼 */}
      <Button
        variant='ghost'
        onClick={onBack}
        className='flex items-center gap-2'
      >
        <ArrowLeft className='h-4 w-4' />
        뒤로가기
      </Button>

      {/* 프로젝트 이미지 */}
      <div className='relative'>
        {projectImage ? (
          <img
            src={projectImage}
            alt={project.title || '프로젝트 이미지'}
            className='h-64 w-full rounded-lg object-cover'
          />
        ) : (
          <div className='flex h-64 w-full items-center justify-center rounded-lg bg-gray-200 text-gray-500'>
            이미지가 없습니다
          </div>
        )}
        <div className='absolute right-4 top-4 flex gap-2'>
          <Button
            variant='secondary'
            size='icon'
            onClick={onLike}
            className='bg-white/80 hover:bg-white'
          >
            <Heart className='h-4 w-4' />
          </Button>
          <Button
            variant='secondary'
            size='icon'
            onClick={onShare}
            className='bg-white/80 hover:bg-white'
          >
            <Share2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* 프로젝트 기본 정보 */}
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <h1 className='text-3xl font-bold'>
              {project.title || '제목 미정'}
            </h1>
            <p className='text-gray-600'>
              {project.description || '프로젝트 설명이 등록되지 않았습니다.'}
            </p>
          </div>
          <Badge variant='outline' className='text-sm'>
            {category}
          </Badge>
        </div>

        {/* 아티스트 정보 */}
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback>{artistInitial}</AvatarFallback>
          </Avatar>
          <div>
            <p className='font-medium'>
              {project.artist || '알 수 없는 아티스트'}
            </p>
            <p className='text-sm text-gray-500'>아티스트</p>
          </div>
        </div>

        {/* 진행률 */}
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* 통계 */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {currentAmount.toLocaleString()}원
            </div>
            <div className='text-sm text-gray-500'>모금액</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{backerCount}</div>
            <div className='text-sm text-gray-500'>후원자</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold'>{daysLeft}</div>
            <div className='text-sm text-gray-500'>남은 일수</div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className='flex gap-3'>
          <Button onClick={onSupport} className='flex-1' size='lg'>
            후원하기
          </Button>
          <Button
            variant='outline'
            onClick={onLike}
            className='flex items-center gap-2'
          >
            <Heart className='h-4 w-4' />
            좋아요
          </Button>
        </div>
      </div>
    </div>
  );
};
