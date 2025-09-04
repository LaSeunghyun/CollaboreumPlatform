import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { User, BarChart3, Palette, Shield, Settings, LogOut } from "lucide-react";
import { getRoleBadge, getUserAvatar, UserRole } from "./utils";

interface UserMenuProps {
  userRole: UserRole;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

export function UserMenu({ userRole, onNavigate, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getUserAvatar(userRole)} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            {getRoleBadge(userRole)}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onNavigate('mypage')}>
          <User className="mr-2 h-4 w-4" />
          마이페이지
        </DropdownMenuItem>
        
        {(userRole === 'artist' || userRole === 'admin') && (
          <DropdownMenuItem onClick={() => onNavigate('dashboard')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {userRole === 'artist' ? '아티스트 대시보드' : '대시보드'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onNavigate('gallery')}>
          <Palette className="mr-2 h-4 w-4" />
          작품 갤러리
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {userRole === 'admin' && (
          <>
            <DropdownMenuItem onClick={() => onNavigate('admin')}>
              <Shield className="mr-2 h-4 w-4" />
              관리자 페이지
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          설정
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}