import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '../../lib/utils';

interface VirtualizedListProps {
    items: any[];
    itemHeight: number;
    containerHeight: number;
    renderItem: (item: any, index: number) => React.ReactNode;
    className?: string;
    overscan?: number; // 화면에 보이지 않는 아이템 수 (성능 최적화)
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
    items,
    itemHeight,
    containerHeight,
    renderItem,
    className,
    overscan = 5
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // items가 undefined이거나 배열이 아닌 경우 빈 배열로 처리
    const safeItems = Array.isArray(items) ? items : [];

    const visibleRange = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(
            safeItems.length - 1,
            Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
        );

        return { startIndex, endIndex };
    }, [scrollTop, itemHeight, containerHeight, safeItems.length, overscan]);

    const visibleItems = useMemo(() => {
        return safeItems.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
    }, [safeItems, visibleRange]);

    const totalHeight = safeItems.length * itemHeight;
    const offsetY = visibleRange.startIndex * itemHeight;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    };

    return (
        <div
            ref={containerRef}
            className={cn('overflow-auto', className)}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <div
                            key={visibleRange.startIndex + index}
                            style={{ height: itemHeight }}
                        >
                            {renderItem(item, visibleRange.startIndex + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
