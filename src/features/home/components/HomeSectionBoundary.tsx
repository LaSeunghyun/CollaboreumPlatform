import React, { Suspense, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface HomeSectionBoundaryProps {
  loadingFallback: ReactNode;
  renderError: (reset: () => void) => ReactNode;
  children: ReactNode;
}

export const HomeSectionBoundary: React.FC<HomeSectionBoundaryProps> = ({
  loadingFallback,
  renderError,
  children,
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => renderError(resetErrorBoundary)}
          onReset={reset}
        >
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
