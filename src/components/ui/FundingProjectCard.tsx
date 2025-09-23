import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { FundingProject } from '../../types/funding';
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_TEXTS,
} from '../../types/funding';
import {
  formatCurrency,
  formatDate,
  calculateSuccessRate,
} from '../../utils/fundingUtils';
import {
  calculateProjectStatus,
  getProjectStatusLabel,
  getProjectStatusColor,
  getDaysUntilStart,
  getDaysUntilEnd,
} from '../../utils/projectStatusUtils';
import { FundingProjectStatus } from '../../features/funding/types';

interface FundingProjectCardProps {
  project: FundingProject;
  onViewDetails: (projectId: string) => void;
}

export function FundingProjectCard({
  project,
  onViewDetails,
}: FundingProjectCardProps) {
  // 프로젝트 상태를 자동으로 계산
  const calculatedStatus = calculateProjectStatus(
    project.startDate,
    project.endDate,
  );
  const daysUntilStart = getDaysUntilStart(project.startDate);
  const daysUntilEnd = getDaysUntilEnd(project.endDate);

  const getProjectStatusIcon = (status: FundingProjectStatus) => {
    switch (status) {
      case FundingProjectStatus.SUCCEEDED:
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case FundingProjectStatus.FAILED:
        return <XCircle className='h-5 w-5 text-red-500' />;
      case FundingProjectStatus.COLLECTING:
        return <Clock className='h-5 w-5 text-blue-500' />;
      case FundingProjectStatus.DRAFT:
        return <Calendar className='h-5 w-5 text-gray-500' />;
      case FundingProjectStatus.CLOSED:
        return <AlertCircle className='h-5 w-5 text-gray-500' />;
      default:
        return <Clock className='h-5 w-5 text-gray-500' />;
    }
  };

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            {getProjectStatusIcon(calculatedStatus)}
            <Badge className={getProjectStatusColor(calculatedStatus)}>
              {getProjectStatusLabel(calculatedStatus)}
            </Badge>
            {calculatedStatus === FundingProjectStatus.DRAFT &&
              daysUntilStart > 0 && (
                <span className='text-xs text-muted-foreground'>
                  {daysUntilStart}일 후 시작
                </span>
              )}
            {calculatedStatus === FundingProjectStatus.COLLECTING &&
              daysUntilEnd > 0 && (
                <span className='text-xs text-muted-foreground'>
                  {daysUntilEnd}일 남음
                </span>
              )}
          </div>
          <Badge variant='outline' className='text-xs'>
            {project.category}
          </Badge>
        </div>

        <h4 className='mb-2 line-clamp-2 font-medium text-gray-900'>
          {project.title}
        </h4>

        <div className='mb-4 space-y-3'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>목표 금액</span>
            <span className='font-medium'>
              {formatCurrency(project.targetAmount)}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>달성 금액</span>
            <span className='font-medium text-blue-600'>
              {formatCurrency(project.currentAmount)}
            </span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>후원자 수</span>
            <span className='font-medium'>{project.backers}명</span>
          </div>
        </div>

        {calculatedStatus === FundingProjectStatus.SUCCEEDED &&
          project.result && (
            <div className='mb-3 rounded-lg bg-green-50 p-3'>
              <h5 className='mb-2 font-medium text-green-800'>프로젝트 성공</h5>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>달성률</span>
                  <span className='font-medium text-green-600'>
                    {project.result.successRate}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>완료일</span>
                  <span>{formatDate(project.result.completionDate!)}</span>
                </div>
              </div>
              <div className='mt-2'>
                <p className='mb-1 text-xs font-medium text-green-700'>
                  제공된 결과물:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {project.result.deliverables.map((deliverable, index) => (
                    <Badge
                      key={index}
                      variant='secondary'
                      className='bg-green-100 text-xs text-green-800'
                    >
                      {deliverable}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

        {calculatedStatus === FundingProjectStatus.FAILED && (
          <div className='mb-3 rounded-lg bg-red-50 p-3'>
            <h5 className='mb-2 font-medium text-red-800'>프로젝트 실패</h5>
            <div className='text-sm text-red-700'>
              <p>
                목표 금액의{' '}
                {Math.round(
                  calculateSuccessRate(
                    project.currentAmount,
                    project.targetAmount,
                  ),
                )}
                % 달성
              </p>
              <p>후원자 {project.backers}명 참여</p>
            </div>
          </div>
        )}

        {calculatedStatus === FundingProjectStatus.DRAFT && (
          <div className='mb-3 rounded-lg bg-gray-50 p-3'>
            <h5 className='mb-2 font-medium text-gray-800'>프로젝트 대기 중</h5>
            <div className='text-sm text-gray-700'>
              <p>시작 예정일: {formatDate(project.startDate)}</p>
              <p>{daysUntilStart}일 후 프로젝트가 시작됩니다.</p>
            </div>
          </div>
        )}

        {calculatedStatus === FundingProjectStatus.CLOSED && (
          <div className='mb-3 rounded-lg bg-gray-50 p-3'>
            <h5 className='mb-2 font-medium text-gray-800'>프로젝트 종료</h5>
            <div className='text-sm text-gray-700'>
              <p>종료일: {formatDate(project.endDate)}</p>
              <p>
                목표 금액의{' '}
                {Math.round(
                  calculateSuccessRate(
                    project.currentAmount,
                    project.targetAmount,
                  ),
                )}
                % 달성
              </p>
            </div>
          </div>
        )}

        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>
            {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onViewDetails(project.id.toString())}
          >
            <Eye className='mr-1 h-3 w-3' />
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
