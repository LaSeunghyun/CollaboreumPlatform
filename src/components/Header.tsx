import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import {
  Menu,
  X,
  Bell,
  Search,
  Shield,
  User,
  BarChart3,
  Palette,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../lib/api/useUser';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 알림 데이터 로드
  const { data: notifications } = useNotifications(
    {
      read: false,
      limit: 10,
    },
    {
      enabled: isAuthenticated,
    },
  );

  const unreadCount = (notifications as any)?.unreadCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { path: '/artists', label: '아티스트' },
    { path: '/projects', label: '프로젝트' },
    { path: '/notices', label: '공지사항' },
    { path: '/community', label: '커뮤니티' },
    { path: '/events', label: '이벤트' },
  ];

  // 관리자 전용 메뉴
  const adminNavigationItems = [
    { path: '/admin', label: '관리자', icon: 'Shield' },
  ];

  return (
    <header className='sticky top-0 z-50 border-b bg-white/95 backdrop-blur'>
      <div className='container mx-auto px-4 py-3 md:py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='cursor-pointer text-xl font-semibold text-indigo transition-opacity hover:opacity-80'
            >
              Collaboreum
            </Link>

            {/* Desktop Navigation */}
            <nav className='hidden items-center gap-6 md:flex'>
              {navigationItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm transition-colors hover:scale-105 ${
                    isActive(item.path)
                      ? 'font-medium text-indigo'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* 관리자 메뉴 */}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <div className='h-4 w-px bg-border' />
                  {adminNavigationItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 text-sm transition-colors hover:scale-105 ${
                        isActive(item.path)
                          ? 'font-medium text-indigo'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Shield className='h-4 w-4' />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className='flex items-center gap-3'>
            {/* Search Bar */}
            <form onSubmit={handleSearch} className='hidden md:block'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                <input
                  type='text'
                  placeholder='검색...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='focus:ring-indigo/20 focus:border-indigo/50 w-64 rounded-lg border border-border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2'
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className='hidden items-center gap-3 md:flex'>
              {isAuthenticated ? (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='relative hover:scale-105'
                  >
                    <Bell className='h-4 w-4' />
                    {unreadCount > 0 && (
                      <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className='flex h-auto items-center gap-2 rounded-full p-0 transition-colors hover:bg-gray-100'>
                        <Avatar className='h-8 w-8 cursor-pointer transition-transform hover:scale-105'>
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>
                            {user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-56'>
                      <DropdownMenuItem onClick={() => navigate('/account')}>
                        <User className='mr-2 h-4 w-4' />
                        마이페이지
                      </DropdownMenuItem>

                      {(user?.role === 'artist' || user?.role === 'admin') && (
                        <DropdownMenuItem
                          onClick={() => navigate('/dashboard')}
                        >
                          <BarChart3 className='mr-2 h-4 w-4' />
                          {user?.role === 'artist'
                            ? '아티스트 대시보드'
                            : '대시보드'}
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={() => navigate('/gallery')}>
                        <Palette className='mr-2 h-4 w-4' />
                        작품 갤러리
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {user?.role === 'admin' && (
                        <>
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Shield className='mr-2 h-4 w-4' />
                            어드민 관리
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}

                      <DropdownMenuItem>
                        <Settings className='mr-2 h-4 w-4' />
                        설정
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm('로그아웃하시겠습니까?')) {
                            handleLogout();
                          }
                        }}
                      >
                        <LogOut className='mr-2 h-4 w-4' />
                        로그아웃
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='transition-transform hover:scale-105'
                    onClick={() => navigate('/login')}
                  >
                    로그인
                  </Button>
                  <Button
                    size='sm'
                    variant='indigo'
                    className='shadow-sm transition-all hover:scale-105'
                    onClick={() => navigate('/signup')}
                  >
                    회원가입
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant='ghost'
              size='sm'
              className='md:hidden'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className='h-5 w-5' />
              ) : (
                <Menu className='h-5 w-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='mt-4 space-y-4 border-t border-border pb-4 pt-4 md:hidden'>
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                <input
                  type='text'
                  placeholder='검색...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='focus:ring-indigo/20 focus:border-indigo/50 w-full rounded-lg border border-border py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2'
                />
              </div>
            </form>

            <nav className='flex flex-col space-y-3'>
              {navigationItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo/10 font-medium text-indigo'
                      : 'text-muted-foreground hover:bg-surface'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* 모바일 관리자 메뉴 */}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <div className='my-2 h-px bg-border' />
                  {adminNavigationItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive(item.path)
                          ? 'bg-indigo/10 font-medium text-indigo'
                          : 'text-muted-foreground hover:bg-surface'
                      }`}
                    >
                      <Shield className='h-4 w-4' />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className='border-t border-border pt-3'>
              {isAuthenticated ? (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm font-medium'>
                      {user?.name || '사용자'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        navigate('/account');
                        setIsMenuOpen(false);
                      }}
                    >
                      마이페이지
                    </Button>
                    <Button variant='ghost' size='sm' className='relative'>
                      <Bell className='h-4 w-4' />
                      {unreadCount > 0 && (
                        <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    className='flex-1'
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className='flex-1'
                    variant='indigo'
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                  >
                    회원가입
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
