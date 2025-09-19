import React from 'react';
import { useNavigate } from 'react-router-dom';

import { ArtistGallery } from '@/components/ArtistGallery';

export const ArtistGalleryRoute: React.FC = () => {
  const navigate = useNavigate();

  return <ArtistGallery onBack={() => navigate(-1)} />;
};
