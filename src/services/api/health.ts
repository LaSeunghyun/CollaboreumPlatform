import { api } from '@/lib/api/api';

export const isAPIAvailable = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ success: boolean }>('/health');

    if (response.data && typeof response.data.success === 'boolean') {
      return response.data.success;
    }

    return (response as unknown as { success?: boolean }).success ?? false;
  } catch {
    return false;
  }
};
