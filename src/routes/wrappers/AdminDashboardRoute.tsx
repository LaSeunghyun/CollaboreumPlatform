import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export const AdminDashboardRoute: React.FC = () => {
  const navigate = useNavigate();

  return <AdminDashboard onBack={() => navigate(-1)} />;
};
