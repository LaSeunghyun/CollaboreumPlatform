import React from 'react';
import { useNavigate } from 'react-router-dom';

import CommunityMain from '@/features/community/components/CommunityMain';
import { CommunityPost } from '@/features/community/types';

export const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePostClick = (post: CommunityPost) => {
    navigate(`/community/${post.id}`);
  };

  return <CommunityMain onPostClick={handlePostClick} />;
};
