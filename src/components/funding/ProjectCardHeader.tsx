import { ImageWithFallback } from '../atoms/ImageWithFallback';
import { getProgressPercentage } from '@/utils/fundingUtils';
import { FundingProject } from '@/types/funding';
import { Badge, Progress } from '@/shared/ui';

interface ProjectCardHeaderProps {
    project: FundingProject;
}

export const ProjectCardHeader = ({ project }: ProjectCardHeaderProps) => {
    const progressPercentage = getProgressPercentage(project.currentAmount, project.targetAmount);

    return (
        <div className='relative aspect-video'>
            <ImageWithFallback
                src={project.image || project.thumbnail}
                alt={project.title}
                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
            />
            {project.featured && (
                <Badge className='absolute left-4 top-4 rounded-xl bg-warning font-medium text-warning-foreground'>
                    주목 프로젝트
                </Badge>
            )}
            <Badge
                className={`absolute right-4 top-4 rounded-xl font-medium ${project.category === '음악'
                    ? 'bg-primary text-primary-foreground'
                    : project.category === '미술'
                        ? 'bg-accent text-accent-foreground'
                        : project.category === '문학'
                            ? 'bg-success text-success-foreground'
                            : 'bg-destructive text-destructive-foreground'
                    }`}
            >
                {project.category}
            </Badge>
            <div className='absolute bottom-4 left-4 right-4'>
                <div className='glass-morphism rounded-2xl p-4 text-white'>
                    <div className='mb-2 flex justify-between text-sm'>
                        <span className='font-medium'>
                            ₩{(project.currentAmount || 0).toLocaleString()}
                        </span>
                        <span className='font-medium'>
                            {progressPercentage.toFixed(1)}%
                        </span>
                    </div>
                    <Progress
                        value={progressPercentage}
                        className='h-2 bg-white/20'
                        aria-label={`진행률 ${progressPercentage.toFixed(1)}%`}
                    />
                </div>
            </div>
        </div>
    );
};
