import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ArtistProfile } from '@/components/ArtistProfile';

export const ArtistProfileRoute: React.FC = () => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle?: string }>();

  const artistId = useMemo(() => {
    if (!handle) {
      return 0;
    }

    const parsed = Number(handle);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [handle]);

  return <ArtistProfile artistId={artistId} onBack={() => navigate(-1)} />;
};
