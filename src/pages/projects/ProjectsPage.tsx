import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { SegmentedTabs } from '@/shared/ui/shadcn/SegmentedTabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Plus, Clock, Star, TrendingUp } from 'lucide-react';
import { FundingProjectCard } from '../../components/molecules/FundingProjectCard';
import { useProjects } from '../../lib/api/useProjects';
import {
  ErrorState,
  EmptyProjectsState,
  SkeletonGrid,
} from '../../components/organisms/States';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthRedirect();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [projectSort, setProjectSort] = useState('deadline');

  // API 훅들
  const {
    data: ongoingProjects,
    isLoading: ongoingLoading,
    error: ongoingError,
  } = useProjects({
    status: 'ongoing',
    sortBy: projectSort,
    order: projectSort === 'deadline' ? 'asc' : 'desc',
  });

  const {
    data: allProjects,
    isLoading: allLoading,
    error: allError,
  } = useProjects({
    sortBy: projectSort,
    order: projectSort === 'deadline' ? 'asc' : 'desc',
  });

  const handleCreateProject = () => {
    requireAuth(() => {
      // 프로젝트 생성 페이지로 이동
      navigate('/projects/create');
    });
  };

  const renderProjects = (projects: any[], loading: boolean, error: any) => {
    if (loading) {
      return <SkeletonGrid count={6} cols={3} />;
    }

    if (error) {
      return (
        <ErrorState
          title='프로젝트 정보를 불러올 수 없습니다'
          description='잠시 후 다시 시도해주세요.'
        />
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <EmptyProjectsState
          action={
            isAuthenticated
              ? {
                  label: '새 프로젝트 만들기',
                  onClick: handleCreateProject,
                }
              : undefined
          }
        />
      );
    }

    return (
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {projects.map((project: any) => (
          <FundingProjectCard key={project.id} {...project} />
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>펀딩 프로젝트</h1>
          <p className='text-muted-foreground'>
            아티스트의 꿈을 응원하고 함께 성장하세요
          </p>
        </div>
        {isAuthenticated && (
          <Button
            variant='indigo'
            className='hover-scale transition-button shadow-sm'
            onClick={handleCreateProject}
          >
            <Plus className='mr-2 h-4 w-4' />
            프로젝트 등록
          </Button>
        )}
      </div>

      <div className='space-y-6'>
        <SegmentedTabs
          value={activeTab}
          onValueChange={setActiveTab}
          options={[
            { value: 'ongoing', label: '진행 중인 펀딩' },
            { value: 'all', label: '전체 프로젝트' },
          ]}
          size='md'
          variant='segmented'
        />

        <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
          <Select value={projectSort} onValueChange={setProjectSort}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='정렬 방식' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='deadline'>마감임박순</SelectItem>
              <SelectItem value='amount'>후원액순</SelectItem>
              <SelectItem value='new'>신규등록순</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex gap-2'>
            <Badge
              variant='secondary'
              className='border-red-200 bg-red-50 text-red-700'
            >
              <Clock className='mr-1 h-3 w-3' />
              마감임박
            </Badge>
            <Badge
              variant='secondary'
              className='border-green-200 bg-green-50 text-green-700'
            >
              <Star className='mr-1 h-3 w-3' />
              추천
            </Badge>
            <Badge
              variant='secondary'
              className='border-blue-200 bg-blue-50 text-blue-700'
            >
              <TrendingUp className='mr-1 h-3 w-3' />
              인기
            </Badge>
          </div>
        </div>

        {activeTab === 'ongoing' && (
          <div className='space-y-6'>
            {renderProjects(
              (ongoingProjects as any)?.data?.projects ||
                (ongoingProjects as any)?.projects ||
                [],
              ongoingLoading,
              ongoingError,
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className='space-y-6'>
            {renderProjects(
              (allProjects as any)?.data?.projects ||
                (allProjects as any)?.projects ||
                [],
              allLoading,
              allError,
            )}
          </div>
        )}
      </div>
    </div>
  );
};
