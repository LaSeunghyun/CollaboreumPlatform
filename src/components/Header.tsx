import { Button } from "./ui/button";
import { Menu, Search, Bell, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { UserMenu } from "./Header/UserMenu";
import { MobileMenu } from "./Header/MobileMenu";
import { NAVIGATION_ITEMS } from "./Header/constants";
import { UserRole } from "../utils/auth";
import { useAuth } from "../contexts/AuthContext";
import { interactionAPI } from "../services/api";

interface HeaderProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
  userRole?: UserRole;
  onLogin?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export function Header({
  activeSection,
  onNavigate,
  isLoggedIn = false,
  userRole = 'fan',
  onLogin,
  onGoBack,
  canGoBack = false
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth();

  // 알림 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      const loadNotifications = async () => {
        try {
          const response = await interactionAPI.getNotifications({ limit: 10, read: false }) as any;
          if (response.success && response.data) {
            setUnreadCount(response.data.unreadCount || 0);
          }
        } catch (error) {
          console.error('알림 로드 실패:', error);
        }
      };

      loadNotifications();
    }
  }, [isAuthenticated]);

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsMenuOpen(false);
  };

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        // 검색 결과 페이지로 이동
        window.location.hash = `search=${encodeURIComponent(searchQuery.trim())}`;
      } catch (error) {
        console.error('검색 처리 실패:', error);
      }
    }
  };

  return (
    <header className="glass-morphism sticky top-0 z-50 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('home')}
              className="text-2xl font-semibold text-foreground hover:text-primary transition-all duration-200 cursor-pointer tracking-tight"
            >
              Collaboreum
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`relative px-4 py-2.5 text-base font-medium transition-all duration-200 cursor-pointer rounded-xl whitespace-nowrap ${activeSection === item.id
                  ? 'text-primary bg-primary/10 shadow-apple'
                  : 'text-foreground/80 hover:text-foreground hover:bg-secondary/60'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden xl:flex items-center bg-input-background/80 rounded-2xl px-5 py-3 min-w-[280px] backdrop-blur-sm border border-border/30">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="아티스트, 프로젝트 검색..."
                className="bg-transparent outline-none text-base flex-1 text-foreground placeholder-muted-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="relative h-11 w-11 rounded-full hover:bg-secondary/60 transition-colors"
                onClick={() => {
                  // 알림 드롭다운 또는 모달 표시
                  console.log('알림 클릭');
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white rounded-full text-xs min-w-[20px] h-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <UserMenu
                userRole={user.role as UserRole}
                onNavigate={handleNavigation}
                onLogout={logout}
              />
            ) : (
              <Button
                onClick={onLogin}
                className="hidden lg:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 h-11 rounded-2xl shadow-apple transition-all duration-200 text-base"
              >
                로그인
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-11 w-11 rounded-full hover:bg-secondary/60"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-menu-container">
            <MobileMenu
              isLoggedIn={isAuthenticated}
              userRole={user?.role as UserRole}
              onNavigate={handleNavigation}
              onLogin={onLogin}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSearch={handleSearch}
              unreadCount={unreadCount}
              onNotificationClick={() => {
                // 알림 드롭다운 또는 모달 표시
                console.log('알림 클릭');
              }}
            />
          </div>
        )}
      </div>
    </header>
  );
}