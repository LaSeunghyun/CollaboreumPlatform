import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { CommunityPostDetail } from '@/components/CommunityPostDetail';

export const CommunityPostDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id?: string; postId?: string }>();

  const postId = params.id ?? params.postId ?? '';

  return (
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
  );
};
