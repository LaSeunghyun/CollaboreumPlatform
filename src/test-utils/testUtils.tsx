import { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

type AllProvidersProps = { children: ReactNode };

type PerformanceMemory = {
  usedJSHeapSize: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
};

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const AllProviders = ({ children }: AllProvidersProps) => {
  const client = createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

export const measurePerformance = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

export const measureMemory = (): PerformanceMemory | null => {
  const perf = performance as Performance & { memory?: PerformanceMemory };
  return perf.memory ?? null;
};
