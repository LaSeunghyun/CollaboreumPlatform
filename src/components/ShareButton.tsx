import React, { useState } from 'react';
import { Button } from './ui/button';
import { Link, Share, Check } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ShareButton({
  url,
  title,
  description,
  variant = 'ghost',
  size = 'sm',
  className,
  onClick: onClickProp,
}: ShareButtonProps) {
  const [isShared, setIsShared] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events
    onClickProp?.(e); // Call the optional onClick prop
    const fullUrl = `${window.location.origin}${url}`;

    // Try native share API first (mobile)
    if (
      navigator.share &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
        return;
      } catch (error) {
        // Fall back to copy URL if share is cancelled or fails
      }
    }

    // Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(fullUrl);
      setIsShared(true);

      // Reset icon after 2 seconds
      setTimeout(() => setIsShared(false), 2000);
    } catch (error) {
      console.error('링크 복사에 실패했습니다');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
      title='공유하기'
    >
      {isShared ? (
        <Check className='h-4 w-4 text-green-500' />
      ) : (
        <Link className='h-4 w-4' />
      )}
      {size !== 'icon' && <span className='ml-2'>공유</span>}
    </Button>
  );
}
