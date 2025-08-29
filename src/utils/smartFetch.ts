/**
 * API 호출 실패 시 mock 데이터로 fallback하는 스마트 fetch 함수
 * @param apiCall API 호출 함수
 * @param mockData Mock 데이터 함수
 * @returns API 응답 또는 mock 데이터
 */
export const smartFetch = async <T>(
    apiCall: () => Promise<T>,
    mockData: () => Promise<T>
): Promise<T> => {
    try {
        return await apiCall();
    } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return await mockData();
    }
};
