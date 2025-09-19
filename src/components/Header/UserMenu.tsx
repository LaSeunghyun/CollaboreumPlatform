import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { User, Palette, Shield, Settings, LogOut, Bell, BellRing, CreditCard, Bell as BellIcon } from "lucide-react";
import { getRoleBadge, getUserAvatar } from "./utils";
import { useNotifications } from "../../lib/api/useUser";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Avatar } from '@/shared/ui';

// 알림 타입 정의
interface NotificationResponse {
  unreadCount: number;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
  }>;
}

interface UserMenuProps {
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

export function UserMenu({ onNavigate, onLogout }: UserMenuProps) {
  // 사용자 정보 가져오기
  const { user } = useAuth();

  // 사용자 역할 가져오기 (AuthContext에서 직접)
  const userRole = user?.role || 'fan';

  // 알림 데이터 로드
  const { data: notifications, isLoading: _notificationsLoading } = useNotifications({
    read: false,
    limit: 10
  });

  // 타입 안전한 알림 카운트 계산
  const unreadCount = notifications &&
    typeof notifications === 'object' &&
    notifications !== null &&
    'unreadCount' in notifications
    ? (notifications as NotificationResponse).unreadCount
    : 0;

  // 역할에 따른 배지 텍스트 매핑
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'artist':
        return '아티스트';
      case 'admin':
        return '관리자';
      case 'fan':
      default:
        return '팬';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 알림 버튼 */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => onNavigate('notifications')}
        aria-label={`알림 ${unreadCount > 0 ? `${unreadCount}개의 새 알림` : '없음'}`}
        aria-describedby="notification-description"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-warning-600" aria-hidden="true" />
        ) : (
          <Bell className="h-5 w-5" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-danger-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            aria-label={`${unreadCount}개의 읽지 않은 알림`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span id="notification-description" className="sr-only">
          {unreadCount > 0 ? `${unreadCount}개의 새 알림이 있습니다` : '새 알림이 없습니다'}
        </span>
      </Button>

      {/* 사용자 메뉴 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            aria-label="사용자 메뉴 열기"
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={getUserAvatar(userRole)} alt={`${userRole} 사용자 아바타`} />
              <AvatarFallback><User className="h-4 w-4" aria-hidden="true" /></AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              {getRoleBadge(userRole)}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72" role="menu" aria-label="사용자 메뉴">
          {/* 사용자 정보 섹션 */}
          <div className="px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={getUserAvatar(userRole)} alt={`${userRole} 사용자 아바타`} />
                <AvatarFallback><User className="h-6 w-6" aria-hidden="true" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold truncate">
                    {user?.name || '사용자'}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {getRoleDisplayName(user?.role || userRole)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">활성 상태</p>
              </div>
            </div>
          </div>

          {/* 메뉴 아이템들 */}
          <div className="py-1" role="group" aria-label="주요 메뉴">
            <DropdownMenuItem
              onClick={() => onNavigate('mypage')}
              className="px-4 py-3 hover:bg-gray-50"
              role="menuitem"
              aria-label="마이페이지로 이동"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">마이페이지</div>
                <div className="text-xs text-muted-foreground">프로필 및 개인 정보</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onNavigate('gallery')}
              className="px-4 py-3 hover:bg-gray-50"
              role="menuitem"
              aria-label="작품 갤러리로 이동"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Palette className="h-4 w-4 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">작품 갤러리</div>
                <div className="text-xs text-muted-foreground">작품 둘러보기</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onNavigate('investment')}
              className="px-4 py-3 hover:bg-gray-50"
              role="menuitem"
              aria-label="투자 현황으로 이동"
            >
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <CreditCard className="h-4 w-4 text-orange-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">투자 현황</div>
                <div className="text-xs text-muted-foreground">펀딩 참여 내역</div>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          {userRole === 'admin' && (
            <>
              <DropdownMenuItem
                onClick={() => onNavigate('admin')}
                className="px-3 py-2"
                role="menuitem"
                aria-label="어드민 관리로 이동"
              >
                <Shield className="mr-3 h-4 w-4" aria-hidden="true" />
                <div>
                  <div className="font-medium">어드민 관리</div>
                  <div className="text-xs text-muted-foreground">시스템 관리</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <div className="py-1" role="group" aria-label="계정 관리">
            <DropdownMenuItem
              onClick={() => onNavigate('settings')}
              className="px-4 py-3 hover:bg-gray-50"
              role="menuitem"
              aria-label="설정으로 이동"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <Settings className="h-4 w-4 text-gray-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">설정</div>
                <div className="text-xs text-muted-foreground">계정 및 알림 설정</div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onNavigate('notifications')}
              className="px-4 py-3 hover:bg-gray-50"
              role="menuitem"
              aria-label="알림 설정으로 이동"
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <BellIcon className="h-4 w-4 text-yellow-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">알림 설정</div>
                <div className="text-xs text-muted-foreground">알림 관리</div>
              </div>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <div className="py-1" role="group" aria-label="로그아웃">
            <DropdownMenuItem
              onClick={() => {
                if (window.confirm('로그아웃하시겠습니까?')) {
                  onLogout();
                }
              }}
              className="px-4 py-3 hover:bg-gray-50 text-red-600 focus:text-red-600"
              role="menuitem"
              aria-label="로그아웃"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <LogOut className="h-4 w-4 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <div className="font-medium text-sm">로그아웃</div>
                <div className="text-xs text-muted-foreground">계정에서 로그아웃</div>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}