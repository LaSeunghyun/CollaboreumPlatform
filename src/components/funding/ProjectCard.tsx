import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectCardInfo } from './ProjectCardInfo';
import { ProjectCardStats } from './ProjectCardStats';
import { ProjectCardActions } from './ProjectCardActions';
import { ProjectCardProps } from '@/types/funding';
import { Card } from '@/shared/ui';

export const ProjectCard = ({ project, onBackProject, onViewProject, onLikeProject }: ProjectCardProps) => (
    <Card className='hover:shadow-apple-lg group cursor-pointer overflow-hidden rounded-3xl transition-all duration-300' role='article' aria-label={`${project.title} 프로젝트`}>
        <ProjectCardHeader project={project} />
        <CardContent className='p-0'>
            <ProjectCardInfo project={project} />
            <div className='px-6'>
                <ProjectCardStats project={project} />
                <ProjectCardActions project={project} onBackProject={onBackProject} onViewProject={onViewProject} onLikeProject={onLikeProject} />
            </div>
        </CardContent>
    </Card>
);
