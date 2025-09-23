import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProjectForm } from '@/features/projects/create/hooks/useCreateProjectForm';
import { ProjectCategorySection } from '@/features/projects/create/components/ProjectCategorySection';
import { ProjectBasicInfoSection } from '@/features/projects/create/components/ProjectBasicInfoSection';
import { ProjectFundingModeSection } from '@/features/projects/create/components/ProjectFundingModeSection';
import { ProjectFundingSection } from '@/features/projects/create/components/ProjectFundingSection';
import { ProjectSecretPerksSection } from '@/features/projects/create/components/ProjectSecretPerksSection';
import { ProjectMediaSection } from '@/features/projects/create/components/ProjectMediaSection';
import { useProjectCategories } from '@/features/projects/create/hooks/useProjectCategories';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    categories: categoryOptions,
    isLoading: categoryLoading,
    isError: categoryError,
    refetch: refetchCategories,
  } = useProjectCategories();
  const {
    formData,
    loading,
    handleInputChange,
    handleNumberChange,
    handleImageSelect,
    handleSubmit,
    formatNumberForDisplay,
  } = useCreateProjectForm({
    userId: user?.id,
    onSuccess: () => navigate('/projects'),
  });

  return (
    <div className='min-h-screen bg-surface py-8'>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <Button
            variant='ghost'
            size='sm'
            tone='default'
            className='mb-4'
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />프로젝트 목록으로 돌아가기
          </Button>
          <h1 className='text-3xl font-bold text-foreground'>새 프로젝트 등록</h1>
          <p className='mt-2 text-base text-muted-foreground'>
            당신의 창작 프로젝트를 등록하고 후원을 받아보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          <ProjectCategorySection
            category={formData.category}
            options={categoryOptions}
            loading={categoryLoading}
            hasError={categoryError}
            onRetry={refetchCategories}
            onCategoryChange={value => handleInputChange('category', value)}
          />

          <ProjectBasicInfoSection
            title={formData.title}
            description={formData.description}
            tags={formData.tags}
            onChange={(field, value) => handleInputChange(field, value)}
          />

          <ProjectFundingModeSection
            fundingMode={formData.fundingMode}
            onChange={mode => handleInputChange('fundingMode', mode)}
          />

          <ProjectFundingSection
            goal={formData.goal}
            duration={formData.duration}
            revenueShare={formData.revenueShare}
            onNumberChange={handleNumberChange}
            onInputChange={(field, value) => handleInputChange(field, value)}
            formatNumber={formatNumberForDisplay}
          />

          <ProjectSecretPerksSection
            secretPerks={formData.secretPerks}
            onChange={value => handleInputChange('secretPerks', value)}
          />

          <ProjectMediaSection
            image={formData.image}
            onImageSelect={handleImageSelect}
          />

          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              tone='muted'
              onClick={() => navigate('/projects')}
            >
              취소
            </Button>
            <Button
              type='submit'
              variant='solid'
              tone='default'
              loading={loading}
              disabled={loading}
            >
              {loading ? '등록 중...' : '프로젝트 등록하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
