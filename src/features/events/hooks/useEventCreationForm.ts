import { useState, useEffect, useCallback } from 'react';
import { eventManagementAPI } from '@/services/api/events';
import { dynamicConstantsService } from '@/services/constantsService';
import { useAuth } from '@/contexts/AuthContext';
import {
  EventCategoryOption,
  EventFormState,
} from '@/features/events/types/event';

type FormField = keyof EventFormState;

type UseEventCreationFormOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const initialFormState: EventFormState = {
  title: '',
  description: '',
  category: '',
  tags: '',
  location: '',
  startDate: new Date(),
  endDate: new Date(),
  maxParticipants: 10,
};

export const useEventCreationForm = (
  options: UseEventCreationFormOptions = {},
) => {
  const { onSuccess, onError } = options;
  const [formData, setFormData] = useState<EventFormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EventCategoryOption[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const enums = await dynamicConstantsService.getEnums();
        const eventCategories = Object.entries(
          enums.EVENT_CATEGORIES || {},
        ).map(([key, value]) => ({
          id: key,
          label: value,
        }));
        setCategories(eventCategories);
      } catch (error) {
        console.error('카테고리를 가져오는 중 오류 발생:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = useCallback(
    (field: FormField, value: string | number | Date) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    },
    [errors],
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    }
    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요';
    }
    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요';
    }
    if (!formData.location.trim()) {
      newErrors.location = '장소를 입력해주세요';
    }
    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = '최대 참가자 수는 1명 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);
        const eventData = {
          ...formData,
          tags: formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean),
          organizer: user,
        };

        await eventManagementAPI.createEvent(eventData);
        resetForm();
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error('이벤트 생성 중 오류 발생:', error);
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [formData, onError, onSuccess, resetForm, user, validateForm],
  );

  return {
    formData,
    errors,
    loading,
    categories,
    loadingCategories,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
