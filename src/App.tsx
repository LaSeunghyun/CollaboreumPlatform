import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toast } from '@/components/organisms/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { AppRoutes } from '@/routes';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className='relative min-h-screen bg-background'>
              {/* 상단 흐림 → 중앙 짙음 그라데이션 */}
              <div className='bg-gradient-top-to-center-strong pointer-events-none absolute inset-0'></div>
              <Toast />
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
