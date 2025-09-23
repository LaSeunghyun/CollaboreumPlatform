import React from 'react';
import { Button } from '@/shared/ui/Button';

interface AccountLoggedOutStateProps {
  onLogin?: () => void;
}

export const AccountLoggedOutState: React.FC<AccountLoggedOutStateProps> = ({
  onLogin,
}) => (
  <div className='py-12 text-center'>
    <h2 className='mb-4 text-2xl font-bold'>로그인이 필요합니다</h2>
    <p className='mb-6 text-muted-foreground'>
      마이페이지를 이용하려면 로그인해주세요.
    </p>
    <Button variant='indigo' onClick={onLogin}>
      로그인하기
    </Button>
  </div>
);
