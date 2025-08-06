import { useState, useEffect, useRef, useMemo } from 'react';
import { ComponentLoader } from './LoadingSpinner';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
  onEndReached,
  endReachedThreshold = 10
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return { start: Math.max(0, start - overscan), end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  useEffect(() => {
    if (
      onEndReached &&
      visibleRange.end >= items.length - endReachedThreshold
    ) {
      onEndReached();
    }
  }, [visibleRange.end, items.length, onEndReached, endReachedThreshold]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
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
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
}

// Simplified version for basic use cases
export function SimpleVirtualList<T>({
  items,
  renderItem,
  className
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  return (
    <VirtualizedList
      items={items}
      renderItem={renderItem}
      itemHeight={60} // Default height
      containerHeight={400} // Default container height
      className={className}
    />
  );
}