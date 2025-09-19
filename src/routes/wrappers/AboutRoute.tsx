import React from 'react';
import { useNavigate } from 'react-router-dom';

import { About } from '@/components/About';

export const AboutRoute: React.FC = () => {
  const navigate = useNavigate();

  return <About onBack={() => navigate(-1)} />;
};
