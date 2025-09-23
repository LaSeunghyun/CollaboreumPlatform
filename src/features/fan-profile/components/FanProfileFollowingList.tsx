import { User as UserIcon } from 'lucide-react';

import { Button } from '@/shared/ui/Button';
import { Card, CardContent } from '@/shared/ui/Card';

import { FanProfileFollowing } from '../hooks/useFanProfile';

interface FanProfileFollowingListProps {
  following: FanProfileFollowing[];
  onFollowArtist?: (artistId: string) => void;
}

export const FanProfileFollowingList = ({
  following,
  onFollowArtist,
}: FanProfileFollowingListProps) => {
  if (following.length === 0) {
    return (
      <p className='text-sm text-gray-500'>팔로잉 중인 아티스트가 없습니다.</p>
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {following.map(artist => (
        <Card key={artist.id} className='transition-shadow hover:shadow-md'>
          <CardContent className='p-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className='h-12 w-12 rounded-full object-cover'
                  />
                ) : (
                  <UserIcon className='h-6 w-6 text-primary-600' />
                )}
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-gray-900'>{artist.name}</h4>
                <p className='text-sm text-gray-600'>
                  {artist.followers.toLocaleString()}명 팔로워
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onFollowArtist?.(artist.id)}
              >
                팔로우
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
