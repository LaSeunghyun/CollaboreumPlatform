import { DollarSign } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/shared/ui/Card';

import {
  FanProfileActivity,
  FanProfileMonthlySummary,
} from '../hooks/useFanProfile';

interface FanProfileOverviewProps {
  activities: FanProfileActivity[];
  monthlySummary: FanProfileMonthlySummary;
}

export const FanProfileOverview = ({
  activities,
  monthlySummary,
}: FanProfileOverviewProps) => {
  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>최근 활동</h3>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className='space-y-4'>
              {activities.map((activity) => (
                <div key={activity.id} className='flex items-center space-x-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100'>
                    <DollarSign className='h-4 w-4 text-primary-600' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{activity.description}</p>
                    <p className='text-xs text-gray-500'>{activity.relativeTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-500'>최근 활동 내역이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>이번 달 활동</h3>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>후원 횟수</span>
              <span className='font-semibold'>{monthlySummary.backingCount}회</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>후원 금액</span>
              <span className='font-semibold'>{monthlySummary.formattedBackingAmount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>총 팔로잉</span>
              <span className='font-semibold text-green-600'>
                {monthlySummary.followingCount.toLocaleString()}명
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>총 후원 프로젝트</span>
              <span className='font-semibold text-blue-600'>
                {monthlySummary.totalPledges.toLocaleString()}개
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
