import React from 'react';
import { Badge } from '../ui/badge';
import { USER_AVATARS } from './constants';

import { UserRole } from '../../utils/auth';

export const getRoleBadge = (userRole: UserRole) => {
  switch (userRole) {
    case 'artist':
      return (
        <Badge className='bg-purple-100 text-xs text-purple-800'>
          {' '}
          아티스트{' '}
        </Badge>
      );
    case 'admin':
      return (
        <Badge className='bg-red-100 text-xs text-red-800'> 관리자 </Badge>
      );
    default:
      return <Badge className='bg-blue-100 text-xs text-blue-800'> 팬 </Badge>;
  }
};

export const getUserAvatar = (userRole: UserRole): string => {
  return USER_AVATARS[userRole];
};
