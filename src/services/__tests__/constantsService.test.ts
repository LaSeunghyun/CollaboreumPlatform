import { dynamicConstantsService } from '../constantsService';
import { constantsAPI } from '../api';

jest.mock('../api', () => ({
  constantsAPI: {
    getSortOptions: jest.fn(),
  },
}));

const mockedConstantsApi = constantsAPI as jest.Mocked<typeof constantsAPI>;

describe('DynamicConstantsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalises sort options returned from the API', async () => {
    mockedConstantsApi.getSortOptions.mockResolvedValue({
      success: true,
      data: [
        { value: 'popular', label: '인기순' },
        { id: 'amount', name: '모금액순' },
      ],
    });

    const options = await dynamicConstantsService.getSortOptions('funding');

    expect(mockedConstantsApi.getSortOptions).toHaveBeenCalledWith('funding');
    expect(options).toEqual([
      { value: 'popular', label: '인기순', icon: undefined },
      { value: 'amount', label: '모금액순', icon: undefined },
    ]);
  });

  it('throws when the API does not return an array', async () => {
    mockedConstantsApi.getSortOptions.mockResolvedValue({ success: true, data: null });

    await expect(
      dynamicConstantsService.getSortOptions('project'),
    ).rejects.toThrow('정렬 옵션 데이터가 배열이 아닙니다.');
  });
});
