import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User, Search, Bell } from "lucide-react";
import { NAVIGATION_ITEMS } from "./constants";
import { getRoleBadge, getUserAvatar } from "./utils";
import { UserRole } from "../../utils/auth";

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
  onNotificationClick
}: MobileMenuProps) {
  return (
    <div className="md:hidden py-4 border-t bg-white">
      <nav className="flex flex-col space-y-3">
        {/* 검색 기능 */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Search className="h-4 w-4 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="아티스트, 프로젝트 검색..."
            className="bg-transparent outline-none text-sm flex-1"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange?.(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch?.()}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearch}
            className="ml-2"
          >
            검색
          </Button>
        </div>

        {/* 알림 버튼 (로그인한 사용자만) */}
        {isLoggedIn && onNotificationClick && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">알림</span>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
        )}

        {/* 네비게이션 메뉴 */}
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="text-left text-gray-700 hover:text-primary py-3 px-3 rounded-md hover:bg-gray-50 transition-colors min-h-[44px] w-full"
          >
            {item.label}
          </button>
        ))}

        {isLoggedIn ? (
          <>
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={getUserAvatar(userRole)} />
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                {getRoleBadge(userRole)}
              </div>
              <button
                onClick={() => onNavigate('mypage')}
                className="text-left text-gray-700 hover:text-primary w-full mb-2 py-3 px-3 rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                마이페이지
              </button>
              {(userRole === 'artist' || userRole === 'admin') && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="text-left text-gray-700 hover:text-primary w-full mb-2 py-3 px-3 rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  대시보드
                </button>
              )}
              {userRole === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-left text-gray-700 hover:text-primary w-full mb-2 py-3 px-3 rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  관리자
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="pt-2">
            <Button onClick={onLogin} className="w-full">로그인</Button>
          </div>
        )}
      </nav>
    </div>
  );
}