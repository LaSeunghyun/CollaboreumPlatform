import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Settings, LogOut } from 'lucide-react';

interface AccountHeaderProps {
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({
  onOpenSettings,
  onLogout,
}) => (
  <div className='flex items-center justify-between'>
    <div>
      <h1 className='text-3xl font-bold'>마이페이지</h1>
      <p className='text-muted-foreground'>내 활동과 프로젝트를 관리하세요</p>
    </div>
    <div className='flex items-center gap-3'>
      <Button variant='outline' size='sm' onClick={onOpenSettings}>
        <Settings className='mr-2 h-4 w-4' />
        설정
      </Button>
      <Button variant='outline' size='sm' onClick={onLogout}>
        <LogOut className='mr-2 h-4 w-4' />
        로그아웃
      </Button>
    </div>
  </div>
);
