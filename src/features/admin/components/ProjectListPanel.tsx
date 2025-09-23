import { Card, CardContent, CardHeader } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { ErrorMessage, ProjectListSkeleton } from '@/shared/ui';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import type { DashboardProject } from '../hooks/useAdminDashboardData';

interface ProjectListPanelProps {
  projects: DashboardProject[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onProjectAction?: (action: string, projectId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatCurrency: (value: unknown) => string;
}

export function ProjectListPanel({
  projects,
  loading,
  error,
  onRetry,
  onProjectAction,
  getStatusColor,
  getStatusText,
  formatCurrency,
}: ProjectListPanelProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className='text-lg font-semibold'>프로젝트 관리</h3>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ProjectListSkeleton />
        ) : error ? (
          <ErrorMessage error={error as Error} onRetry={onRetry} />
        ) : projects.length > 0 ? (
          <div className='space-y-4'>
            {projects.map(project => (
              <div
                key={project.id}
                className='flex items-center justify-between rounded-lg border border-gray-200 p-4'
              >
                <div className='flex-1'>
                  <h4 className='font-semibold text-gray-900'>
                    {project.title}
                  </h4>
                  <p className='text-sm text-gray-600'>by {project.artist}</p>
                  <div className='mt-2 flex items-center space-x-4 text-sm text-gray-500'>
                    <span>목표: {formatCurrency(project.targetAmount)}</span>
                    <span>•</span>
                    <span>현재: {formatCurrency(project.amount)}</span>
                    <span>•</span>
                    <span>후원자: {project.backers.toLocaleString()}명</span>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      project.status,
                    )}`}
                  >
                    {getStatusText(project.status)}
                  </span>
                  <div className='flex space-x-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onProjectAction?.('view', project.id)}
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onProjectAction?.('approve', project.id)}
                    >
                      <CheckCircle className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onProjectAction?.('reject', project.id)}
                    >
                      <XCircle className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className='text-sm text-gray-500'>검토할 프로젝트가 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
}
