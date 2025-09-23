import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminMyPage, ArtistMyPage, FanMyPage } from '@/features/profile/views';
import type { UserRole } from '@/features/profile/types/profile';

const roleToView: Record<UserRole, React.FC> = {
  admin: AdminMyPage,
  artist: ArtistMyPage,
  fan: FanMyPage,
};

export const UserProfileSystem: React.FC = () => {
  const { user } = useAuth();
  const role = (user?.role as UserRole) || 'fan';
  const View = roleToView[role] ?? FanMyPage;

  return <View />;
};

export default UserProfileSystem;
