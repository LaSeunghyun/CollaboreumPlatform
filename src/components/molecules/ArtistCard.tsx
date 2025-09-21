import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Heart, Users } from 'lucide-react';
import { ImageWithFallback } from '../atoms/ImageWithFallback';
import { ShareButton } from '../atoms/ShareButton';

interface ArtistCardProps {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  category: string;
  tags: string[];
  featuredWork?: string;
  followers: number;
  isFollowing?: boolean;
  isVerified?: boolean;
  bio?: string;
  onFollow?: () => void;
  onClick?: () => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  id,
  name,
  avatar,
  coverImage,
  category,
  tags,
  featuredWork,
  followers,
  isFollowing,
  isVerified,
  bio,
  onFollow,
  onClick,
}) => {
  return (
    <Card
      className='hover:shadow-apple-lg border-border/50 group cursor-pointer overflow-hidden rounded-3xl transition-all duration-300'
      onClick={onClick}
    >
      {/* Cover Image */}
      {coverImage && (
        <div className='relative h-36'>
          <ImageWithFallback
            src={coverImage}
            alt={`${name} cover`}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 to-transparent' />
        </div>
      )}

      <CardContent className='space-y-4 p-6'>
        {/* Artist Profile */}
        <div className='relative px-6 pb-6'>
          {/* Profile Image */}
          <div className='absolute -top-12 left-6'>
            <div className='shadow-apple h-24 w-24 overflow-hidden rounded-full border-4 border-background'>
              <Avatar className='h-full w-full'>
                <AvatarImage src={avatar} />
                <AvatarFallback>{name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Artist Info */}
          <div className='pt-16'>
            <div className='mb-3 flex items-start justify-between'>
              <div>
                <h3 className='text-xl font-bold text-foreground'>{name}</h3>
                <p className='font-medium text-muted-foreground'>{category}</p>
                {isVerified && (
                  <div className='mt-1 flex items-center gap-1'>
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-sky'>
                      <svg
                        className='h-2.5 w-2.5 text-white'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      인증됨
                    </span>
                  </div>
                )}
              </div>
              <div className='bg-primary/10 flex items-center rounded-full px-3 py-1'>
                <Users className='mr-1 h-4 w-4 text-primary' />
                <span className='text-sm font-medium text-primary'>
                  {followers.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className='text-foreground/80 mb-4 line-clamp-2 text-sm leading-relaxed'>
            {bio}
          </p>
        )}

        {/* Tags */}
        <div className='mb-5 flex flex-wrap gap-2'>
          {(Array.isArray(tags) ? tags : []).slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              variant='secondary'
              className='bg-secondary/60 rounded-lg px-2 py-1 text-xs text-foreground'
            >
              {tag}
            </Badge>
          ))}
          {Array.isArray(tags) && tags.length > 3 && (
            <Badge
              variant='secondary'
              className='bg-secondary/60 rounded-lg px-2 py-1 text-xs text-foreground'
            >
              +{tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Featured Work */}
        {featuredWork && (
          <div className='mb-4 space-y-2'>
            <p className='text-xs text-muted-foreground'>대표작</p>
            <p className='text-sm text-foreground'>{featuredWork}</p>
          </div>
        )}

        {/* Actions */}
        <div className='flex gap-3'>
          <Button
            variant={isFollowing ? 'secondary' : 'default'}
            size='sm'
            className={`hover:bg-primary/90 flex-1 rounded-xl bg-primary font-medium text-primary-foreground ${!isFollowing ? 'transition-transform hover:scale-105' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onFollow?.();
            }}
          >
            <Users className='mr-2 h-4 w-4' />
            {isFollowing ? '팔로잉' : '팔로우'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='hover:bg-secondary/50 rounded-xl border-border px-3'
          >
            <Heart className='h-4 w-4' />
          </Button>
          <ShareButton
            url={`/artists/${id}`}
            title={name}
            description={bio || `${name} 아티스트의 프로필을 확인해보세요`}
            variant='outline'
            size='sm'
            className='hover:bg-secondary/50 rounded-xl border-border px-3'
          />
        </div>
      </CardContent>
    </Card>
  );
};
