import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventManagementAPI } from '@/services/api/events';
import { dynamicConstantsService } from '@/services/constantsService';
import {
  Event,
  EventCategoryOption,
} from '@/features/events/types/event';

const DEFAULT_CATEGORY: EventCategoryOption = { id: 'all', label: '전체' };

export const useEventFilters = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<EventCategoryOption[]>([
    DEFAULT_CATEGORY,
  ]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const eventsData = await eventManagementAPI.getEvents();
      setEvents(eventsData as Event[]);
    } catch (error) {
      console.error('이벤트를 가져오는 중 오류 발생:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const enums = await dynamicConstantsService.getEnums();
      const eventCategories = Object.entries(enums.EVENT_CATEGORIES || {}).map(
        ([key, value]) => ({
          id: key,
          label: value,
        }),
      );
      setCategories([DEFAULT_CATEGORY, ...eventCategories]);
    } catch (error) {
      console.error('카테고리를 가져오는 중 오류 발생:', error);
      setCategories([DEFAULT_CATEGORY]);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchCategories, fetchEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch =
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  return {
    events,
    filteredEvents,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    refreshEvents: fetchEvents,
  };
};
