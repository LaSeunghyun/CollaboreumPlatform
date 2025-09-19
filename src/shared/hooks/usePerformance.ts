import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useDebounce, useThrottle, usePerformanceMeasure } from '../lib/performance';

/**
 * 성능 최적화를 위한 커스텀 훅들
 */

/**
 * 디바운스된 검색 훅
 */
export function useDebouncedSearch<T>(
  items: T[],
  searchFn: (items: T[], query: string) => T[],
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(items);

  const debouncedSearch = useDebounce(
    useCallback((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(items);
        return;
      }
      
      const filtered = searchFn(items, searchQuery);
      setResults(filtered);
    }, [items, searchFn]),
    delay
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
  };
}

/**
 * 가상화된 리스트 훅
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll,
  };
}

/**
 * 무한 스크롤 훅
 */
export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => void,
  hasMore: boolean = true,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver>();

  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setIsLoading(true);
            loadMore();
          }
        },
        {
          threshold: 0.1,
          rootMargin: `${threshold}px`,
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, hasMore, loadMore, threshold]
  );

  useEffect(() => {
    setIsLoading(false);
  }, [items.length]);

  return {
    lastItemRef,
    isLoading,
  };
}

/**
 * 메모이제이션된 정렬 및 필터링 훅
 */
export function useMemoizedData<T>(
  items: T[],
  sortKey?: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc',
  filterFn?: (item: T) => boolean
) {
  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    
    return [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortOrder]);

  const filteredItems = useMemo(() => {
    if (!filterFn) return sortedItems;
    return sortedItems.filter(filterFn);
  }, [sortedItems, filterFn]);

  return filteredItems;
}

/**
 * 성능 측정 훅
 */
export function usePerformanceTracker(componentName: string) {
  const { startMeasure, endMeasure } = usePerformanceMeasure(componentName);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} 렌더링 횟수: ${renderCount.current}`);
    }
  });

  return {
    startMeasure,
    endMeasure,
    renderCount: renderCount.current,
  };
}

/**
 * 이미지 지연 로딩 훅
 */
export function useLazyImage(src: string, fallback?: string) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

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
  }, [src]);

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

  return {
    imgRef,
    imageSrc,
    isLoaded,
    hasError,
    handleLoad,
    handleError,
  };
}

/**
 * 쓰로틀된 이벤트 핸들러 훅
 */
export function useThrottledHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number
): T {
  return useThrottle(handler, delay);
}

/**
 * 디바운스된 이벤트 핸들러 훅
 */
export function useDebouncedHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number
): T {
  return useDebounce(handler, delay);
}

/**
 * 리사이즈 이벤트 훅
 */
export function useResize() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = useThrottle(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, 100);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return dimensions;
}

/**
 * 스크롤 이벤트 훅
 */
export function useScroll() {
  const [scrollPosition, setScrollPosition] = useState({
    x: window.scrollX,
    y: window.scrollY,
  });

  const handleScroll = useThrottle(() => {
    setScrollPosition({
      x: window.scrollX,
      y: window.scrollY,
    });
  }, 16); // 60fps

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return scrollPosition;
}
