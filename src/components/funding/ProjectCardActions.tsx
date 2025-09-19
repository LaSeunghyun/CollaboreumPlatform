import { Heart, Eye } from 'lucide-react';
import { FundingProject } from '@/types/funding';
import { Button } from '@/shared/ui';

interface ProjectCardActionsProps {
    project: FundingProject;
    onBackProject: (project: FundingProject) => void;
    onViewProject: (project: FundingProject) => void;
    onLikeProject: (project: FundingProject) => void;
}

export const ProjectCardActions = ({
    project,
    onBackProject,
    onViewProject,
    onLikeProject
}: ProjectCardActionsProps) => (
    <div className='flex gap-3'>
        <Button
            className='hover:bg-primary/90 flex-1 rounded-xl bg-primary font-medium text-primary-foreground'
            onClick={() => onBackProject(project)}
            aria-label={`${project.title} 프로젝트 후원하기`}
        >
            후원하기
        </Button>
        <Button
            variant='outline'
            size='sm'
            className='hover:bg-secondary/50 cursor-pointer rounded-xl px-4'
            onClick={() => onViewProject(project)}
            aria-label={`${project.title} 프로젝트 상세보기`}
        >
            <Eye className='h-4 w-4' />
        </Button>
        <Button
            variant='outline'
            size='sm'
            className={`hover:bg-secondary/50 cursor-pointer rounded-xl px-4 ${project.isLiked ? 'text-primary' : ''}`}
            onClick={() => onLikeProject(project)}
            aria-label={`${project.title} 프로젝트 좋아요${project.isLiked ? '취소' : ''}`}
        >
            <Heart className={`h-4 w-4 ${project.isLiked ? 'fill-current' : ''}`} />
        </Button>
    </div>
);
