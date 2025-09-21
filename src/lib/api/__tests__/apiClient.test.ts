import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { ApiClient } from '../api';
import type { ApiResponse } from '@/shared/types';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const createAxiosInstance = (baseURL: string, requestImpl?: jest.Mock) => {
  const request =
    requestImpl ??
    jest.fn(async () => ({ data: { success: true } as ApiResponse }));

  const instance = {
    defaults: { baseURL },
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    request,
  } as unknown as AxiosInstance;

  mockedAxios.create.mockReturnValueOnce(instance);

  return { instance, request };
};

describe('ApiClient endpoint normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes the leading slash when baseURL already ends with /api', async () => {
    const { request } = createAxiosInstance('https://api.example.com/api');
    const client = new ApiClient();

    await client.request('/community/posts');

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'community/posts' }),
    );
  });

  it('deduplicates api prefix for endpoints defined with /api/*', async () => {
    const { request } = createAxiosInstance('https://api.example.com/api');
    const client = new ApiClient();

    await client.request('/api/batch');

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'batch' }),
    );
  });

  it('keeps absolute URLs untouched', async () => {
    const { request } = createAxiosInstance('https://api.example.com/api');
    const client = new ApiClient();

    await client.request('https://other.service.dev/hooks');

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://other.service.dev/hooks' }),
    );
  });

  it('drops the api segment entirely when requesting the API root', async () => {
    const { request } = createAxiosInstance('https://api.example.com/api');
    const client = new ApiClient();

    await client.request('api');

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ url: '' }));
  });

  it('preserves query strings when trimming redundant api prefixes', async () => {
    const { request } = createAxiosInstance('https://api.example.com/api');
    const client = new ApiClient();

    await client.request('/api?health=true');

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '?health=true' }),
    );
  });
});
