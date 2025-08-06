import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 100
}: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetching) {
          setIsFetching(true);
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [hasMore, loading, isFetching, onLoadMore]);

  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return { sentinelRef, isFetching };
}