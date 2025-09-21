import * as React from 'react';
import { Card, CardContent, CardHeader } from './Card';

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader>
        <div className='h-4 animate-pulse rounded bg-gray-200' />
        <div className='h-3 w-2/3 animate-pulse rounded bg-gray-200' />
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='h-3 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-4/5 animate-pulse rounded bg-gray-200' />
          <div className='h-3 w-3/5 animate-pulse rounded bg-gray-200' />
        </div>
      </CardContent>
    </Card>
  );
}
