import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Heart, MessageSquare, Award } from 'lucide-react';

interface AccountStatsGridProps {
  ongoingProjects: number;
  backedProjects: number;
}

export const AccountStatsGrid: React.FC<AccountStatsGridProps> = ({
  ongoingProjects,
  backedProjects,
}) => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
    <Card>
      <CardContent className='p-4 text-center'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <BarChart3 className='h-4 w-4 text-indigo' />
          <span className='text-sm text-muted-foreground'>진행 중인 프로젝트</span>
        </div>
        <p className='text-2xl font-bold'>{ongoingProjects}개</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className='p-4 text-center'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <Heart className='h-4 w-4 text-red-500' />
          <span className='text-sm text-muted-foreground'>후원한 프로젝트</span>
        </div>
        <p className='text-2xl font-bold'>{backedProjects}개</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className='p-4 text-center'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <MessageSquare className='h-4 w-4 text-sky' />
          <span className='text-sm text-muted-foreground'>커뮤니티 활동</span>
        </div>
        <p className='text-2xl font-bold'>0개</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className='p-4 text-center'>
        <div className='mb-2 flex items-center justify-center gap-2'>
          <Award className='h-4 w-4 text-yellow-500' />
          <span className='text-sm text-muted-foreground'>달성한 목표</span>
        </div>
        <p className='text-2xl font-bold'>0개</p>
      </CardContent>
    </Card>
  </div>
);
