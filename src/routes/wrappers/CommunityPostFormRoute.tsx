import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityPostForm } from '@/components/CommunityPostForm';

export const CommunityPostFormRoute: React.FC = () => {
  const navigate = useNavigate();

  return <CommunityPostForm onBack={() => navigate(-1)} />;
};
