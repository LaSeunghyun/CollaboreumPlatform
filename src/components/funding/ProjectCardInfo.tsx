import { Star, MapPin, Calendar } from 'lucide-react';
import { getFirstChar } from '@/utils/typeGuards';
import { FundingProject } from '@/types/funding';
import { Avatar, Badge } from '@/shared/ui';

interface ProjectCardInfoProps {
    project: FundingProject;
}

export const ProjectCardInfo = ({ project }: ProjectCardInfoProps) => (
    <div className='p-6'>
        <div className='mb-4 flex items-center gap-4'>
            <Avatar className='h-12 w-12'>
                <AvatarImage src={project.artistAvatar || ''} alt={project.artist} />
                <AvatarFallback>{getFirstChar(project.artist)}</AvatarFallback>
            </Avatar>
            <div className='flex-1'>
                <h3 className='line-clamp-1 text-lg font-semibold text-foreground'>
                    {project.title}
                </h3>
                <div className='flex items-center gap-2'>
                    <p className='text-sm text-muted-foreground'>by {project.artist}</p>
                    <div className='flex items-center gap-1'>
                        <Star className='h-3 w-3 fill-current text-primary' />
                        <span className='text-xs text-muted-foreground'>
                            {project.artistRating || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <p className='text-foreground/80 mb-4 line-clamp-2 text-sm leading-relaxed'>
            {project.description}
        </p>

        <div className='mb-6 flex flex-wrap gap-2'>
            {(project.tags || []).map((tag: string, index: number) => (
                <Badge
                    key={index}
                    variant='secondary'
                    className='bg-secondary/80 rounded-lg px-3 py-1 text-xs text-foreground'
                >
                    {tag}
                </Badge>
            ))}
        </div>

        <div className='mb-6 flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
                <MapPin className='h-4 w-4' />
                <span>{project.location || '위치 정보 없음'}</span>
            </div>
            <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>~{project.endDate}</span>
            </div>
        </div>
    </div>
);
