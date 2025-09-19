import { setupServer } from 'msw/node';
import { handlers, errorHandlers } from './handlers';

// MSW 서버 설정
export const server = setupServer(...handlers);

// 에러 테스트를 위한 서버
export const errorServer = setupServer(...errorHandlers);

// 테스트용 서버 설정 함수
export const setupTestServer = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

// 에러 테스트용 서버 설정 함수
export const setupErrorTestServer = () => {
  beforeAll(() => errorServer.listen());
  afterEach(() => errorServer.resetHandlers());
  afterAll(() => errorServer.close());
};
