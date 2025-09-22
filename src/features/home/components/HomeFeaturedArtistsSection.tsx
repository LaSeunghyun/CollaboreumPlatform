import React from 'react';
import { Users2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { ArtistCard } from '@/components/molecules/ArtistCard';
import { SkeletonGrid } from '@/components/organisms/States';
import type { ArtistSummary } from '../types';

interface HomeFeaturedArtistsSectionProps {
  artists: ArtistSummary[];
  isLoading: boolean;
  hasError: boolean;
  onReload: () => void;
  onArtistSelect: (artistId: string) => void;
  onRegisterArtist: () => void;
  onViewAll?: () => void;
}

export const HomeFeaturedArtistsSection: React.FC<HomeFeaturedArtistsSectionProps> = ({
  artists,
  isLoading,
  hasError,
  onReload,
  onArtistSelect,
  onRegisterArtist,
  onViewAll,
}) => {
  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>주목받는 아티스트</h2>
        <Button variant='outline' size='sm' onClick={onViewAll}>
          더보기
        </Button>
      </div>

      {isLoading ? (
        <SkeletonGrid count={3} cols={3} />
      ) : hasError ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
              <Users2 className='h-8 w-8 text-indigo' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>아티스트 정보를 불러올 수 없습니다</h3>
              <p className='mb-6 text-muted-foreground'>서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.</p>
            </div>
            <Button variant='indigo' onClick={onReload}>
              <Users2 className='mr-2 h-4 w-4' />
              새로고침
            </Button>
          </CardContent>
        </Card>
      ) : artists.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='space-y-6 p-12 text-center'>
            <div className='bg-indigo/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full'>
              <Users2 className='h-8 w-8 text-indigo' />
            </div>
            <div>
              <h3 className='mb-2 text-xl font-semibold'>아직 등록된 아티스트가 없습니다</h3>
              <p className='mb-6 text-muted-foreground'>첫 번째 아티스트가 되어보세요! 창의적인 작품을 세상에 알려보세요.</p>
            </div>
            <Button variant='indigo' onClick={onRegisterArtist}>
              <Users2 className='mr-2 h-4 w-4' />
              아티스트 등록하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3'>
          {artists.slice(0, 3).map(artist => (
            <ArtistCard key={artist.id} {...artist} onClick={() => onArtistSelect(artist.id)} />
          ))}
        </div>
      )}
    </section>
  );
};
