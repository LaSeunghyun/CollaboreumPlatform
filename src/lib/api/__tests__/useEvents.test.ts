import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents, useEvent, useUpcomingEvents } from '../useEvents';
import { eventManagementAPI } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api');
const mockEventManagementAPI = eventManagementAPI as jest.Mocked<typeof eventManagementAPI>;

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client= { createTestQueryClient() } >
    { children }
    </QueryClientProvider>
);

describe('useEvents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('이벤트 목록을 성공적으로 가져와야 한다', async () => {
        const mockData = {
            data: [
                {
                    id: '1',
                    title: '테스트 이벤트',
                    description: '테스트 이벤트 설명',
                    category: '음악',
                    startDate: '2024-12-31T19:00:00Z',
                    endDate: '2024-12-31T22:00:00Z',
                    time: '19:00',
                    location: '테스트 장소',
                    currentAttendees: 50,
                    maxAttendees: 100,
                    status: 'upcoming',
                    image: '',
                    tags: ['테스트']
                }
            ]
        };

        mockEventManagementAPI.getEvents.mockResolvedValue(mockData);

        const { result } = renderHook(() => useEvents(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockEventManagementAPI.getEvents).toHaveBeenCalledWith(undefined);
    });

    it('쿼리 파라미터를 올바르게 전달해야 한다', async () => {
        const params = {
            category: '음악',
            status: 'upcoming',
            page: 1,
            limit: 10
        };

        mockEventManagementAPI.getEvents.mockResolvedValue({ data: [] });

        const { result } = renderHook(() => useEvents(params), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockEventManagementAPI.getEvents).toHaveBeenCalledWith(params);
    });

    it('API 에러를 올바르게 처리해야 한다', async () => {
        const error = new Error('API Error');
        mockEventManagementAPI.getEvents.mockRejectedValue(error);

        const { result } = renderHook(() => useEvents(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
    });
});

describe('useEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('특정 이벤트를 성공적으로 가져와야 한다', async () => {
        const eventId = 'event-1';
        const mockData = {
            data: {
                id: eventId,
                title: '테스트 이벤트',
                description: '테스트 이벤트 설명',
                category: '음악',
                startDate: '2024-12-31T19:00:00Z',
                endDate: '2024-12-31T22:00:00Z',
                time: '19:00',
                location: '테스트 장소',
                currentAttendees: 50,
                maxAttendees: 100,
                status: 'upcoming',
                image: '',
                tags: ['테스트']
            }
        };

        mockEventManagementAPI.getEventById.mockResolvedValue(mockData);

        const { result } = renderHook(() => useEvent(eventId), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockEventManagementAPI.getEventById).toHaveBeenCalledWith(eventId);
    });

    it('eventId가 없으면 쿼리를 실행하지 않아야 한다', () => {
        const { result } = renderHook(() => useEvent(''), { wrapper });

        expect(result.current.isLoading).toBe(false);
        expect(mockEventManagementAPI.getEventById).not.toHaveBeenCalled();
    });

    it('API 에러를 올바르게 처리해야 한다', async () => {
        const eventId = 'event-1';
        const error = new Error('API Error');
        mockEventManagementAPI.getEventById.mockRejectedValue(error);

        const { result } = renderHook(() => useEvent(eventId), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
    });
});

describe('useUpcomingEvents', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('다가오는 이벤트를 성공적으로 가져와야 한다', async () => {
        const mockData = {
            data: [
                {
                    id: '1',
                    title: '다가오는 이벤트 1',
                    description: '다가오는 이벤트 설명',
                    category: '음악',
                    startDate: '2024-12-31T19:00:00Z',
                    endDate: '2024-12-31T22:00:00Z',
                    time: '19:00',
                    location: '테스트 장소',
                    currentAttendees: 50,
                    maxAttendees: 100,
                    status: 'upcoming',
                    image: '',
                    tags: ['테스트']
                }
            ]
        };

        mockEventManagementAPI.getEvents.mockResolvedValue(mockData);

        const { result } = renderHook(() => useUpcomingEvents(5), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockEventManagementAPI.getEvents).toHaveBeenCalledWith({
            status: 'upcoming',
            limit: 5,
            sortBy: 'startDate',
            order: 'asc'
        });
    });

    it('기본 limit 값이 3이어야 한다', async () => {
        mockEventManagementAPI.getEvents.mockResolvedValue({ data: [] });

        const { result } = renderHook(() => useUpcomingEvents(), { wrapper });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockEventManagementAPI.getEvents).toHaveBeenCalledWith({
            status: 'upcoming',
            limit: 3,
            sortBy: 'startDate',
            order: 'asc'
        });
    });

    it('API 에러를 올바르게 처리해야 한다', async () => {
        const error = new Error('API Error');
        mockEventManagementAPI.getEvents.mockRejectedValue(error);

        const { result } = renderHook(() => useUpcomingEvents(), { wrapper });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(error);
    });
});
