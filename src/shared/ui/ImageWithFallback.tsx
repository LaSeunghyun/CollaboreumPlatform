import React, { useState } from 'react';
import { cn } from '../lib/cn';

const DEFAULT_FALLBACK_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=';

export interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Fallback으로 렌더링할 이미지 소스입니다. 지정하지 않으면 기본 아이콘을 사용합니다.
   */
  fallbackSrc?: string;
  /**
   * fallback 이미지를 감싸는 컨테이너 클래스명입니다.
   */
  wrapperClassName?: string;
  /**
   * fallback 이미지에 적용할 클래스명입니다.
   */
  fallbackClassName?: string;
  /**
   * 오류가 발생했을 때 fallback 이미지를 표시할지 여부입니다.
   */
  showErrorIcon?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  wrapperClassName,
  fallbackClassName,
  showErrorIcon = true,
  className,
  onError,
  src,
  alt,
  ...imgProps
}) => {
  const [didError, setDidError] = useState(false);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDidError(true);
    onError?.(event);
  };

  const shouldRenderFallback = didError || !src;

  if (shouldRenderFallback) {
    return (
      <div
        className={cn(
          'inline-flex h-full w-full items-center justify-center overflow-hidden rounded-md bg-muted',
          wrapperClassName,
        )}
        role='img'
        aria-label={alt ?? '이미지를 불러오지 못했습니다'}
      >
        {showErrorIcon ? (
          <img
            src={fallbackSrc}
            alt=''
            aria-hidden
            className={cn('h-12 w-12 object-contain opacity-70', fallbackClassName)}
            data-original-url={src ?? undefined}
          />
        ) : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('h-full w-full object-cover', className)}
      onError={handleError}
      {...imgProps}
    />
  );
};

ImageWithFallback.displayName = 'ImageWithFallback';
