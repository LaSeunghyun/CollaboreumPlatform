import React from 'react';
import { Toaster } from '../ui/sonner';

export const Toast: React.FC = () => {
  return (
    <Toaster
      position='top-center'
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #E2E8F0',
          color: '#0F172A',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        className: 'shadow-md',
      }}
      theme='light'
      richColors
    />
  );
};
