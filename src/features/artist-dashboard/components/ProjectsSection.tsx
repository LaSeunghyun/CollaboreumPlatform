import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/shared/ui/Button';
import { Plus } from 'lucide-react';
import { ProjectsSectionData } from '@/features/artist-dashboard/hooks/useArtistDashboard';
import { ProjectsList } from './ProjectsList';

interface ProjectsSectionProps {
  data: ProjectsSectionData;
}

export const ProjectsSection = ({ data }: ProjectsSectionProps) => {
  const { title, ctaLabel, emptyState, projects } = data;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{title}</h2>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          {ctaLabel}
        </Button>
      </div>

      {emptyState.isEmpty ? (
        <Card>
          <CardContent className='p-8 text-center'>
            <p className='mb-4 text-gray-500'>{emptyState.message}</p>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              {emptyState.actionLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProjectsList projects={projects} />
      )}
    </div>
  );
};
