import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  lazy = true,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground text-sm',
          className
        )}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'object-cover w-full h-full'
          )}
          loading={lazy ? 'lazy' : 'eager'}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}