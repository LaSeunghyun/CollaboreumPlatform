import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/shared/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2 } from 'lucide-react';
import { ProjectCardData } from '@/features/artist-dashboard/hooks/useArtistDashboard';

const statusToneClassMap: Record<ProjectCardData['statusTone'], string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
};

interface ProjectsListProps {
  projects: ProjectCardData[];
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  return (
    <div className='space-y-6'>
      {projects.map(project => (
        <Card key={project.id}>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='mb-2'>{project.title}</CardTitle>
                <Badge className={statusToneClassMap[project.statusTone]}>
                  {project.status}
                </Badge>
              </div>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm'>
                  <Edit className='h-4 w-4' />
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-red-600 text-red-600'
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {!project.isCompleted && (
                <>
                  <div>
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm text-gray-600'>펀딩 진행률</span>
                      <span className='text-sm font-medium'>
                        {project.progressLabel}
                      </span>
                    </div>
                    <Progress value={project.progressValue} className='h-3' />
                  </div>

                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-sm text-gray-600'>목표 금액</p>
                      <p className='font-bold'>{project.goalLabel}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>모금액</p>
                      <p className='font-bold text-blue-600'>
                        {project.raisedLabel}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>후원자</p>
                      <p className='font-bold'>{project.backersLabel}</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between rounded-lg bg-yellow-50 p-3'>
                    <span className='text-sm text-yellow-800'>
                      수익 공유율: <strong>{project.revenueShareLabel}</strong>
                    </span>
                    <span className='text-sm text-yellow-800'>
                      마감까지 <strong>{project.daysLeftLabel}</strong>
                    </span>
                  </div>
                </>
              )}

              {project.isCompleted && project.completionSummary && (
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>펀딩 결과</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span>목표 금액:</span>
                        <span>{project.completionSummary.goalLabel}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>최종 모금액:</span>
                        <span className='font-medium text-green-600'>
                          {project.completionSummary.raisedLabel}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>후원자 수:</span>
                        <span>{project.completionSummary.backersLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <h4 className='font-medium'>수익 현황</h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span>총 매출:</span>
                        <span>
                          {project.completionSummary.totalRevenueLabel}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>후원자 분배:</span>
                        <span className='text-blue-600'>
                          {project.completionSummary.sharedRevenueLabel}
                        </span>
                      </div>
                      <div className='flex justify-between font-medium'>
                        <span>순 수익:</span>
                        <span className='text-green-600'>
                          {project.completionSummary.netRevenueLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
