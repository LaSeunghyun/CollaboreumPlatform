import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent } from "@/shared/ui/Card";
import { User, Settings, LogOut, Bell, Heart, Bookmark, UserCircle } from "lucide-react";

interface UserMenuProps {
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  onNotificationsClick?: () => void;
  onFavoritesClick?: () => void;
  onBookmarksClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onProfileClick,
  onSettingsClick,
  onLogout,
  onNotificationsClick,
  onFavoritesClick,
  onBookmarksClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (callback?: () => void) => {
    if (callback) {
      callback();
    }
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          로그인
        </Button>
        <Button variant="solid" size="sm">
          회원가입
        </Button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleMenuToggle}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-6 h-6 text-primary-600" />
          )}
        </div>
        <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 z-50 shadow-lg border-0">
          <CardContent className="p-0">
            {/* 사용자 정보 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                    {user.role === 'admin' ? '관리자' : 
                     user.role === 'artist' ? '아티스트' : '팬'}
                  </span>
                </div>
              </div>
            </div>

            {/* 메뉴 아이템들 */}
            <div className="py-2">
              <button
                onClick={() => handleMenuItemClick(onProfileClick)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>프로필</span>
              </button>

              <button
                onClick={() => handleMenuItemClick(onFavoritesClick)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span>좋아요</span>
              </button>

              <button
                onClick={() => handleMenuItemClick(onBookmarksClick)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>북마크</span>
              </button>

              <button
                onClick={() => handleMenuItemClick(onNotificationsClick)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span>알림</span>
              </button>

              <button
                onClick={() => handleMenuItemClick(onSettingsClick)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>설정</span>
              </button>
            </div>

            {/* 로그아웃 */}
            <div className="border-t border-gray-100 py-2">
              <button
                onClick={() => handleMenuItemClick(onLogout)}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserMenu;