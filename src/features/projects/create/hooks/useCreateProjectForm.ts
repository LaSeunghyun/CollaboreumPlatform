import { useCallback, useState } from 'react';
import { fundingAPI } from '@/api/modules/funding';
import { CreateProjectFormState } from '../types';

interface UseCreateProjectFormOptions {
  userId?: string;
  onSuccess?: () => void;
}

const INITIAL_FORM_STATE: CreateProjectFormState = {
  title: '',
  description: '',
  category: '',
  goal: '',
  duration: '',
  revenueShare: '',
  tags: '',
  image: null,
  fundingMode: 'all-or-nothing',
  secretPerks: '',
};

const formatNumericString = (value: string) => {
  const numeric = value.replace(/,/g, '');
  if (numeric === '' || Number.isNaN(Number(numeric))) {
    return value;
  }

  return Number(numeric).toLocaleString();
};

export const useCreateProjectForm = ({
  userId,
  onSuccess,
}: UseCreateProjectFormOptions) => {
  const [formData, setFormData] = useState<CreateProjectFormState>(
    INITIAL_FORM_STATE,
  );
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback(
    <Key extends keyof CreateProjectFormState>(field: Key, value: CreateProjectFormState[Key]) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleNumberChange = useCallback(
    (field: 'goal' | 'duration' | 'revenueShare', value: string) => {
      const numericValue = value.replace(/,/g, '');
      if (numericValue === '' || !Number.isNaN(Number(numericValue))) {
        setFormData(prev => ({
          ...prev,
          [field]: numericValue,
        }));
      }
    },
    [],
  );

  const handleImageSelect = useCallback((file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file,
    }));
  }, []);

  const formatNumberForDisplay = useCallback((value: string) => {
    return value ? formatNumericString(value) : '';
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!userId) {
        window.alert('로그인이 필요합니다.');
        return;
      }

      if (
        !formData.title ||
        !formData.description ||
        !formData.category ||
        !formData.goal ||
        !formData.duration
      ) {
        window.alert('제목, 설명, 카테고리, 목표 금액, 기간을 모두 입력해주세요.');
        return;
      }

      const goalAmount = parseInt(formData.goal.replace(/,/g, ''), 10);
      const duration = parseInt(formData.duration, 10);

      if (Number.isNaN(goalAmount) || goalAmount < 100000) {
        window.alert('목표 금액은 10만원 이상이어야 합니다.');
        return;
      }

      if (Number.isNaN(duration) || duration < 1) {
        window.alert('기간은 1일 이상이어야 합니다.');
        return;
      }

      try {
        setLoading(true);

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const secretPerks = formData.secretPerks
          .split('\n')
          .map(perk => perk.trim())
          .filter(Boolean);

        const projectData = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          goalAmount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          tags: formData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0),
          fundingMode: formData.fundingMode,
          secretPerks,
          rewards: [],
          executionPlan: formData.description,
        };

        const response = (await fundingAPI.createProject(projectData)) as any;

        if (response?.success) {
          window.alert('프로젝트가 성공적으로 등록되었습니다.');
          onSuccess?.();
        } else {
          window.alert('프로젝트 등록에 실패했습니다.');
        }
      } catch (error) {
        console.error('프로젝트 등록 오류:', error);
        window.alert('프로젝트 등록 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [formData, onSuccess, userId],
  );

  return {
    formData,
    loading,
    handleInputChange,
    handleNumberChange,
    handleImageSelect,
    handleSubmit,
    formatNumberForDisplay,
  };
};
