import { Badge } from "../ui/badge";
import { USER_AVATARS } from "./constants";

export type UserRole = 'fan' | 'artist' | 'admin';

export const getRoleBadge = (userRole: UserRole) => {
  switch (userRole) {
    case 'artist':
      return <Badge className="bg-purple-100 text-purple-800 text-xs">아티스트</Badge>;
    case 'admin':
      return <Badge className="bg-red-100 text-red-800 text-xs">관리자</Badge>;
    default:
      return <Badge className="bg-blue-100 text-blue-800 text-xs">팬</Badge>;
  }
};

export const getUserAvatar = (userRole: UserRole): string => {
  return USER_AVATARS[userRole];
};