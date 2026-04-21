import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  quality?: number;
  fetchPriority?: "high" | "low" | "auto";
  sizes?: string;
}

// Ultra-fast LQIP (Low Quality Image Placeholder) - 1px data URL
const generateLQIP = (color = '#e5e7eb') => 
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  quality = 75,
  fetchPriority = "auto",
  sizes,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        // Start loading earlier so slide changes don't reveal not-yet-decoded images.
        rootMargin: '300px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const getOptimizedSrc = (originalSrc: string) => {
    const formatUrl = (url: string) => encodeURI(url);

    if (originalSrc.includes('unsplash.com')) {
      const separator = originalSrc.includes('?') ? '&' : '?';
      return formatUrl(
        `${originalSrc}${separator}auto=format&fit=crop&w=${width || 800}&h=${height || 600}&q=${quality}`
      );
    }
    if (originalSrc.includes('cloudinary')) {
      const separator = originalSrc.includes('?') ? '&' : '?';
      return formatUrl(
        `${originalSrc}${separator}q=${quality}&w=${width || 800}&h=${height || 600}&f_auto`
      );
    }
    return formatUrl(originalSrc);
  };

  const optimizedSrc = getOptimizedSrc(src);
  const lqip = generateLQIP();

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex items-center justify-center bg-muted border border-border rounded-lg',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)}>
      {/* Ultra-fast LQIP background - shows instantly while image loads */}
      {!isLoaded && (
        <div 
          className="absolute inset-0" 
          style={{ backgroundImage: `url('${lqip}')`, backgroundSize: 'cover' }}
        />
      )}

      {/* Actual image — rendered only after the container enters the viewport */}
      {isInView && (
        <>
          <img
            src={optimizedSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? "high" : fetchPriority}
            sizes={sizes}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              objectFit: 'cover',
            }}
          />
        </>
      )}
    </div>
  );
};

export default OptimizedImage;
