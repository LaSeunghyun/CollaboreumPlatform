import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User } from "lucide-react";
import { NAVIGATION_ITEMS } from "./constants";
import { getRoleBadge, getUserAvatar, UserRole } from "./utils";

interface MobileMenuProps {
  isLoggedIn: boolean;
  userRole: UserRole;
  onNavigate: (section: string) => void;
  onLogin: () => void;
}

export function MobileMenu({ isLoggedIn, userRole, onNavigate, onLogin }: MobileMenuProps) {
  return (
    <div className="md:hidden py-4 border-t">
      <nav className="flex flex-col space-y-3">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="text-left text-gray-700 hover:text-primary cursor-pointer"
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
                className="text-left text-gray-700 hover:text-primary w-full mb-2 cursor-pointer"
              >
                마이페이지
              </button>
              {(userRole === 'artist' || userRole === 'admin') && (
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="text-left text-gray-700 hover:text-primary w-full mb-2 cursor-pointer"
                >
                  대시보드
                </button>
              )}
              {userRole === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className="text-left text-gray-700 hover:text-primary w-full mb-2 cursor-pointer"
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