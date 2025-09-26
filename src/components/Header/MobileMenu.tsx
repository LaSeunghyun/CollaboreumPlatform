import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, Search, Bell } from 'lucide-react';
import { NAVIGATION_ITEMS } from './constants';
import { getRoleBadge, getUserAvatar } from './utils';
import type { UserRole } from '@/shared/types';

interface MobileMenuProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  onNavigate: (section: string) => void;
  onLogin?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  onSearch?: () => void;
  unreadCount?: number;
  onNotificationClick?: () => void;
}

export function MobileMenu({
  isLoggedIn,
  userRole,
  onNavigate,
  onLogin,
  searchQuery = '',
  onSearchQueryChange,
  onSearch,
  unreadCount = 0,
  onNotificationClick,
}: MobileMenuProps) {
  return (
    <div className='border-t bg-white py-4 md:hidden'>
      <nav className='flex flex-col space-y-3'>
        {/* 검색 기능 */}
        <div className='mb-4 flex items-center rounded-lg bg-gray-100 px-3 py-2'>
          <Search className='mr-2 h-4 w-4 text-gray-500' />
          <input
            type='text'
            placeholder='아티스트, 프로젝트 검색...'
            className='flex-1 bg-transparent text-sm outline-none'
            value={searchQuery}
            onChange={e => onSearchQueryChange?.(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && onSearch?.()}
          />
          <Button variant='ghost' size='sm' onClick={onSearch} className='ml-2'>
            검색
          </Button>
        </div>

        {/* 알림 버튼 (로그인한 사용자만) */}
        {isLoggedIn && onNotificationClick && (
          <div className='mb-3 flex items-center justify-between'>
            <span className='text-sm text-gray-600'>알림</span>
            <Button
              variant='ghost'
              size='sm'
              className='relative'
              onClick={onNotificationClick}
            >
              <Bell className='h-5 w-5' />
              {unreadCount > 0 && (
                <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        )}

        {/* 네비게이션 메뉴 */}
        {NAVIGATION_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className='min-h-[44px] w-full rounded-md px-3 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary'
          >
            {item.label}
          </button>
        ))}

        {isLoggedIn ? (
          <>
            <div className='mt-3 border-t pt-3'>
              <div className='mb-3 flex items-center gap-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={getUserAvatar(userRole)} />
                  <AvatarFallback>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                {getRoleBadge(userRole)}
              </div>
              <button
                onClick={() => onNavigate('mypage')}
                className='mb-2 min-h-[44px] w-full rounded-md px-3 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary'
              >
                마이페이지
              </button>
              {(userRole === 'artist' || userRole === 'admin') && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className='mb-2 min-h-[44px] w-full rounded-md px-3 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary'
                >
                  대시보드
                </button>
              )}
              {userRole === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className='mb-2 min-h-[44px] w-full rounded-md px-3 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50 hover:text-primary'
                >
                  관리자
                </button>
              )}
            </div>
          </>
        ) : (
          <div className='pt-2'>
            <Button onClick={onLogin} className='w-full'>
              로그인
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
}
