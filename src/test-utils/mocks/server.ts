// @ts-nocheck
import { setupServer } from 'msw/node';
import { handlers, errorHandlers } from './handlers';

// MSW ?쒕쾭 ?ㅼ젙
export const server = setupServer(...handlers);

// ?먮윭 ?뚯뒪?몃? ?꾪븳 ?쒕쾭
export const errorServer = setupServer(...errorHandlers);

// ?뚯뒪?몄슜 ?쒕쾭 ?ㅼ젙 ?⑥닔
export const setupTestServer = () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
};

// ?먮윭 ?뚯뒪?몄슜 ?쒕쾭 ?ㅼ젙 ?⑥닔
export const setupErrorTestServer = () => {
  beforeAll(() => errorServer.listen());
  afterEach(() => errorServer.resetHandlers());
  afterAll(() => errorServer.close());
};
