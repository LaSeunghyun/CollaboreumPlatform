import * as React from 'react';

declare namespace HelmetAsync {
  interface HelmetProps {
    children?: React.ReactNode;
    prioritizeSeoTags?: boolean;
  }

  interface HelmetProviderProps {
    children?: React.ReactNode;
  }
}

export const HelmetProvider: React.FC<HelmetAsync.HelmetProviderProps>;
export const Helmet: React.FC<HelmetAsync.HelmetProps>;
declare const _default: {
  HelmetProvider: typeof HelmetProvider;
  Helmet: typeof Helmet;
};
export default _default;
