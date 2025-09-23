import { PropsWithChildren } from 'react';

import { Card, CardContent } from '@/shared/ui/Card';

interface FanProfileGuardProps {
  isAuthenticated: boolean;
}

export const FanProfileGuard = ({
  isAuthenticated,
  children,
}: PropsWithChildren<FanProfileGuardProps>) => {
  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto max-w-3xl p-6'>
          <Card>
            <CardContent className='space-y-4 p-8 text-center'>
              <h2 className='text-2xl font-semibold text-gray-900'>로그인이 필요합니다</h2>
              <p className='text-gray-600'>팬 마이페이지를 확인하려면 먼저 로그인해주세요.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
