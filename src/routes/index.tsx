import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';

import { PageLoading } from './PageLoading';
import routeGroups from './routeGroups';
import type { RouteConfig } from './types';

type LayoutKey = NonNullable<RouteConfig['layout']>;

const layoutRenderers: Record<LayoutKey, (children: React.ReactNode) => React.ReactElement> = {
  app: (children) => <AppLayout>{children}</AppLayout>,
};

const buildElement = (route: RouteConfig): React.ReactElement => {
  if (route.redirectTo) {
    return <Navigate to={route.redirectTo} replace />;
  }

  if (!route.component) {
    throw new Error(`Route component is not defined for path: ${route.path}`);
  }

  const Component = route.component;
  let element: React.ReactElement = <Component />;

  if (route.layout) {
    element = layoutRenderers[route.layout](element);
  }

  if (route.suspense ?? true) {
    element = <Suspense fallback={<PageLoading />}>{element}</Suspense>;
  }

  return element;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {routeGroups.flatMap(group => group.routes).map(route => (
        <Route key={route.path} path={route.path} element={buildElement(route)} />
      ))}
    </Routes>
  );
};
