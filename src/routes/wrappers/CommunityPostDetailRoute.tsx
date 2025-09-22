import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CommunityPostDetail } from '@/components/CommunityPostDetail';

export const CommunityPostDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; postId?: string }>();
  const postId = useMemo(() => {
    const rawId = params.id ?? params.postId ?? '';
    if (!rawId) {
      return '';
    }

    const normalized = rawId.split(/[?#]/)[0]?.trim();
    return normalized ?? '';
  }, [params.id, params.postId]);

  useEffect(() => {
    if (!postId) {
      navigate('/community', { replace: true });
    }
  }, [navigate, postId]);

  return (
    postId ? (
      <CommunityPostDetail
        postId={postId}
        onBack={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/community');
          }
        }}
      />
    ) : null
  );
};
