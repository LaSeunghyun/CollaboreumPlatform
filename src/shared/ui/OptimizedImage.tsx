import React, { useState, useEffect, useRef } from 'react';
import { supportsWebP, getOptimizedImageUrl } from '../lib/performance';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'auto',
  lazy = true,
  placeholder,
  fallback = 'https://via.placeholder.com/400x300?text=이미지+없음',
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // WebP 지원 확인
  useEffect(() => {
    if (format === 'auto') {
      supportsWebP().then(setWebpSupported);
    } else {
      setWebpSupported(format === 'webp');
    }
  }, [format]);

  // 이미지 URL 최적화
  useEffect(() => {
    if (!src || webpSupported === null) return;

    const optimizedUrl = getOptimizedImageUrl(
      src,
      width,
      height,
      webpSupported ? 'webp' : 'jpg'
    );

    setImageSrc(optimizedUrl);
  }, [src, width, height, webpSupported]);

  // 지연 로딩
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy, src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    if (fallback) {
      setImageSrc(fallback);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
      
      {/* 로딩 상태 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* 에러 상태 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">이미지를 불러올 수 없습니다</div>
        </div>
      )}
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ImageGallery({
  images,
  alt,
  width = 300,
  height = 200,
  className = '',
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        width={width}
        height={height}
        className="w-full h-full object-cover"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            aria-label="이전 이미지"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            aria-label="다음 이미지"
          >
            →
          </button>
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
