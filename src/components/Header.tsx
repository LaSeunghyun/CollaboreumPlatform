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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigation('home')}
              className="text-xl font-bold text-primary hover:text-blue-600 transition-colors"
            >
              Collaboreum
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`transition-colors ${activeSection === item.id
                  ? 'text-primary font-medium'
                  : 'text-gray-700 hover:text-primary'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="아티스트, 프로젝트 검색..."
                className="bg-transparent outline-none text-sm w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearch}
                className="ml-2"
              >
                검색
              </Button>
            </div>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => {
                  // 알림 드롭다운 또는 모달 표시
                  console.log('알림 클릭');
                }}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
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
              <Button onClick={onLogin} className="hidden md:inline-flex">
                로그인
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && onLogin && (
          <MobileMenu
            isLoggedIn={isAuthenticated}
            userRole={user?.role as UserRole}
            onNavigate={handleNavigation}
            onLogin={onLogin}
          />
        )}
      </div>
    </header>
  );
}