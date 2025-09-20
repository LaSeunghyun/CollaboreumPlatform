/**
 * 성능 최적화 유틸리티 함수들
 */

import { useCallback, useMemo, useRef, useEffect } from 'react';
import type { Metric } from 'web-vitals';

/**
 * 디바운스 훅 - 연속된 호출을 지연시켜 성능 최적화
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * 쓰로틀 훅 - 일정 시간 간격으로만 함수 실행
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * 가상화를 위한 아이템 크기 계산
 */
export function calculateItemSize(
  itemCount: number,
  containerHeight: number,
  minItemHeight: number = 50
): number {
  const calculatedSize = Math.floor(containerHeight / itemCount);
  return Math.max(calculatedSize, minItemHeight);
}

/**
 * 이미지 지연 로딩을 위한 Intersection Observer
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
}

/**
 * 메모이제이션된 정렬 함수
 */
export function useMemoizedSort<T>(
  items: T[],
  sortKey: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  return useMemo(() => {
    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortOrder]);
}

/**
 * 메모이제이션된 필터링 함수
 */
export function useMemoizedFilter<T>(
  items: T[],
  filterFn: (item: T) => boolean
) {
  return useMemo(() => {
    return items.filter(filterFn);
  }, [items, filterFn]);
}

/**
 * 성능 측정을 위한 훅
 */
export function usePerformanceMeasure(name: string) {
  const startTime = useRef<number>(0);

  const startMeasure = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endMeasure = useCallback(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }, [name]);

  return { startMeasure, endMeasure };
}

/**
 * WebP 이미지 지원 확인
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * 이미지 최적화를 위한 URL 생성
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number,
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string {
  if (!originalUrl) return '';
  
  // Cloudinary URL 최적화
  if (originalUrl.includes('cloudinary.com')) {
    const baseUrl = originalUrl.split('/upload/')[0];
    const imagePath = originalUrl.split('/upload/')[1];
    
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`f_${format}`);
    transformations.push('q_auto');
    
    return `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`;
  }
  
  return originalUrl;
}

/**
 * 가상 스크롤을 위한 아이템 인덱스 계산
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
}

/**
 * 성능 모니터링을 위한 Web Vitals 측정
 */
export function measureWebVitals() {
  if (typeof window === 'undefined') return;

  import('web-vitals').then((vitals) => {
    const logMetric = (metric: Metric) => {
      console.log(`${metric.name}:`, metric);
    };

    vitals.onCLS(logMetric);
    vitals.onINP(logMetric);
    vitals.onFCP(logMetric);
    vitals.onLCP(logMetric);
    vitals.onTTFB(logMetric);
  });
}
