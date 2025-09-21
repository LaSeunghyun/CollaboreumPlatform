import { ComponentType, LazyExoticComponent } from 'react';

export type RouteComponent =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;

export interface RouteConfig {
  path: string;
  component?: RouteComponent;
  redirectTo?: string;
  layout?: 'app';
  suspense?: boolean;
}

export interface RouteGroup {
  name: string;
  routes: RouteConfig[];
}
