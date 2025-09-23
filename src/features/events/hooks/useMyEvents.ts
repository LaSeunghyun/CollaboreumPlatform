import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { eventManagementAPI } from '@/services/api/events';
import { Event } from '@/features/events/types/event';

export const useMyEvents = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = useCallback(async () => {
    try {
      setLoading(true);
      const events = await eventManagementAPI.getEvents();
      setMyEvents(events as Event[]);
    } catch (error) {
      console.error('내 이벤트를 가져오는 중 오류 발생:', error);
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setMyEvents([]);
      setLoading(false);
      return;
    }

    fetchMyEvents();
  }, [fetchMyEvents, user]);

  return {
    myEvents,
    loading,
    refresh: fetchMyEvents,
  };
};
