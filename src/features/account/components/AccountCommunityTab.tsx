import React from 'react';
import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { MessageSquare } from 'lucide-react';

export const AccountCommunityTab: React.FC = () => (
  <Card>
    <CardContent className='p-0'>
      <div className='divide-y'>
        <div className='p-6 text-center text-muted-foreground'>
          <MessageSquare className='mx-auto mb-2 h-8 w-8' />
          <p>커뮤니티 활동 내역이 없습니다.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
