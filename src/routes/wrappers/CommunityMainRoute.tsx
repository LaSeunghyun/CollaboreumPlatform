import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityMain } from '@/components/CommunityMain';

export const CommunityMainRoute: React.FC = () => {
  const navigate = useNavigate();

  return <CommunityMain onBack={() => navigate(-1)} />;
};
