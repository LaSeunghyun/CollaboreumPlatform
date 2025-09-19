declare module 'msw/node' {
  export const setupServer: (...handlers: any[]) => unknown;
}

declare module 'msw';
