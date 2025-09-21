import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityFull } from '@/components/CommunityFull';

export const CommunityFullRoute: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CommunityFull
      onBack={() => navigate(-1)}
      onSelectArtist={artistId => navigate(`/artists/${artistId}`)}
    />
  );
};
