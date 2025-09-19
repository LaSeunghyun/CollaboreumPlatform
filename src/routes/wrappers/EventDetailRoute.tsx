import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { EventDetail } from '@/components/EventDetail';

export const EventDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  return <EventDetail eventId={id ?? ''} onBack={() => navigate(-1)} />;
};
