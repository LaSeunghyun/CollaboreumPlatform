import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import { RealTimeAlert } from '@/types/admin';

export const useAdminAlerts = () => {
    return useQuery({
        queryKey: ['admin', 'alerts'],
        queryFn: () => adminAPI.getAlerts() as Promise<RealTimeAlert[]>,
        refetchInterval: 30000, // 30초마다 새로고침
        staleTime: 10000, // 10초간 캐시 유지
    });
};

export const useDismissAlert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (alertId: string) => adminAPI.dismissAlert(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
        },
    });
};
