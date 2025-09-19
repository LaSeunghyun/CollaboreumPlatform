import { calculateSuccessRate } from '@/utils/fundingUtils';
import { FundingProject } from '@/types/funding';

interface ProjectCardStatsProps {
    project: FundingProject;
}

export const ProjectCardStats = ({ project }: ProjectCardStatsProps) => {
    const successRate = calculateSuccessRate(project.currentAmount, project.targetAmount);

    return (
        <div className='mb-6 grid grid-cols-3 gap-4 text-center text-sm'>
            <div>
                <p className='text-lg font-bold text-foreground'>{project.backers}</p>
                <p className='font-medium text-muted-foreground'>후원자</p>
            </div>
            <div>
                <p className='text-lg font-bold text-foreground'>{project.daysLeft}</p>
                <p className='font-medium text-muted-foreground'>일 남음</p>
            </div>
            <div>
                <p className='text-lg font-bold text-foreground'>{successRate}%</p>
                <p className='font-medium text-muted-foreground'>성공률</p>
            </div>
        </div>
    );
};
