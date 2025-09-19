import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ProjectDetail } from '@/components/ProjectDetail';

export const ProjectDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const projectId = useMemo(() => {
    if (!slug) {
      return 0;
    }

    const parsed = Number(slug);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [slug]);

  return <ProjectDetail projectId={projectId} onBack={() => navigate(-1)} />;
};
