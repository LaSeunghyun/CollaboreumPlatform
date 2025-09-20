declare module 'msw/node' {
  import type { RequestHandler } from 'msw';

  export interface SetupServerApi {
    listen: (options?: { onUnhandledRequest?: 'bypass' | 'warn' | 'error' }) => void;
    close: () => void;
    resetHandlers: (...nextHandlers: RequestHandler[]) => void;
    use: (...handlers: RequestHandler[]) => void;
    printHandlers: () => void;
  }

  export function setupServer(...handlers: RequestHandler[]): SetupServerApi;
}

declare module 'msw';
