import { constantsService } from '../services/constants';

// 상태별 색상 반환 (백엔드에서 가져오기)
export const getStatusColor = async (status: string): Promise<string> => {
    try {
        const statusColors = await constantsService.getStatusColors();
        return statusColors[status] || 'bg-gray-100 text-gray-800'; // 기본값
    } catch (error) {
        console.error('상태 색상을 가져오는데 실패했습니다:', error);
        return 'bg-gray-100 text-gray-800'; // 기본값
    }
};

// 상태별 아이콘 반환 (백엔드에서 가져오기)
export const getStatusIcon = async (status: string): Promise<string> => {
    try {
        const statusIcons = await constantsService.getStatusIcons();
        return statusIcons[status] || 'Clock';
    } catch (error) {
        console.error('상태 아이콘을 가져오는데 실패했습니다:', error);
        return 'Clock'; // 기본값
    }
};

// 상태별 텍스트 색상 반환 (백엔드에서 가져오기)
export const getStatusTextColor = async (status: string): Promise<string> => {
    try {
        const statusColors = await constantsService.getStatusColors();
        // 색상에서 텍스트 색상 부분만 추출
        const color = statusColors[status] || 'text-gray-600';
        const textColorMatch = color.match(/text-[a-z]+-\d+/);
        return textColorMatch ? textColorMatch[0] : 'text-gray-600';
    } catch (error) {
        console.error('상태 텍스트 색상을 가져오는데 실패했습니다:', error);
        return 'text-gray-600';
    }
};

// 상태별 배경 색상 반환 (백엔드에서 가져오기)
export const getStatusBgColor = async (status: string): Promise<string> => {
    try {
        const statusColors = await constantsService.getStatusColors();
        // 색상에서 배경 색상 부분만 추출
        const color = statusColors[status] || 'bg-gray-50';
        const bgColorMatch = color.match(/bg-[a-z]+-\d+/);
        return bgColorMatch ? bgColorMatch[0] : 'bg-gray-50';
    } catch (error) {
        console.error('상태 배경 색상을 가져오는데 실패했습니다:', error);
        return 'bg-gray-50';
    }
};

// 상태별 진행률 색상 반환 (백엔드에서 가져오기)
export const getProgressColor = async (status: string): Promise<string> => {
    try {
        const statusColors = await constantsService.getStatusColors();
        const color = statusColors[status] || 'bg-gray-500';
        // 색상을 진행률 색상으로 변환
        if (color.includes('blue')) return 'bg-blue-500';
        if (color.includes('green')) return 'bg-green-500';
        if (color.includes('yellow')) return 'bg-yellow-500';
        if (color.includes('orange')) return 'bg-orange-500';
        if (color.includes('red')) return 'bg-red-500';
        return 'bg-gray-500';
    } catch (error) {
        console.error('상태 진행률 색상을 가져오는데 실패했습니다:', error);
        return 'bg-gray-500';
    }
};

// 상태가 완료 상태인지 확인 (백엔드에서 가져오기)
export const isCompletedStatus = async (status: string): Promise<boolean> => {
    try {
        const enums = await constantsService.getEnums();
        const completedStatuses = enums.STATUS_COMPLETED || ['완료', '지급완료', '성공', '분배완료'];
        return completedStatuses.includes(status);
    } catch (error) {
        console.error('완료 상태를 가져오는데 실패했습니다:', error);
        // 기본값 사용
        const defaultCompletedStatuses = ['완료', '지급완료', '성공', '분배완료'];
        return defaultCompletedStatuses.includes(status);
    }
};

// 상태가 진행 중인지 확인 (백엔드에서 가져오기)
export const isInProgressStatus = async (status: string): Promise<boolean> => {
    try {
        const enums = await constantsService.getEnums();
        const inProgressStatuses = enums.STATUS_IN_PROGRESS || ['진행중', '집행중', '분배완료'];
        return inProgressStatuses.includes(status);
    } catch (error) {
        console.error('진행 중 상태를 가져오는데 실패했습니다:', error);
        // 기본값 사용
        const defaultInProgressStatuses = ['진행중', '집행중', '분배완료'];
        return defaultInProgressStatuses.includes(status);
    }
};

// 상태가 대기 중인지 확인 (백엔드에서 가져오기)
export const isWaitingStatus = async (status: string): Promise<boolean> => {
    try {
        const enums = await constantsService.getEnums();
        const waitingStatuses = enums.STATUS_WAITING || ['대기', '계획중', '준비중', '예정', '보류'];
        return waitingStatuses.includes(status);
    } catch (error) {
        console.error('대기 중 상태를 가져오는데 실패했습니다:', error);
        // 기본값 사용
        const defaultWaitingStatuses = ['대기', '계획중', '준비중', '예정', '보류'];
        return defaultWaitingStatuses.includes(status);
    }
};

// 상태가 취소/실패인지 확인 (백엔드에서 가져오기)
export const isFailedStatus = async (status: string): Promise<boolean> => {
    try {
        const enums = await constantsService.getEnums();
        const failedStatuses = enums.STATUS_FAILED || ['취소', '실패'];
        return failedStatuses.includes(status);
    } catch (error) {
        console.error('실패 상태를 가져오는데 실패했습니다:', error);
        // 기본값 사용
        const defaultFailedStatuses = ['취소', '실패'];
        return defaultFailedStatuses.includes(status);
    }
};

// 상태별 우선순위 반환 (백엔드에서 가져오기)
export const getStatusPriority = async (status: string): Promise<number> => {
    try {
        const enums = await constantsService.getEnums();
        const priorities = enums.STATUS_PRIORITIES || {};
        return priorities[status] || 999;
    } catch (error) {
        console.error('상태 우선순위를 가져오는데 실패했습니다:', error);
        // 기본값 사용
        const defaultPriorities: Record<string, number> = {
            '진행중': 1,
            '집행중': 2,
            '분배완료': 3,
            '완료': 4,
            '지급완료': 5,
            '성공': 6,
            '대기': 7,
            '계획중': 8,
            '준비중': 9,
            '예정': 10,
            '보류': 11,
            '취소': 12,
            '실패': 13
        };
        return defaultPriorities[status] || 999;
    }
};

// 상태별 설명 텍스트 반환 (백엔드에서 가져오기)
export const getStatusDescription = async (status: string): Promise<string> => {
    try {
        const enums = await constantsService.getEnums();
        const descriptions = enums.STATUS_DESCRIPTIONS || {};
        return descriptions[status] || '상태 정보 없음';
    } catch (error) {
        console.error('상태 설명을 가져오는데 실패했습니다:', error);
        return '상태 정보 없음';
    }
};
