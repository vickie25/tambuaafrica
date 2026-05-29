import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { encodePublicImageSrc, normalizePublicImagePath } from '@/lib/public-image-path';
import { fallbackSafariImage } from '@/lib/remote-media-fallbacks';
import { responsiveImages } from '@/generated/responsive-images';

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
  /** If the primary `src` fails to load (404, etc.), swap to this URL once. */
  fallbackSrc?: string;
  /** Used to pick a stable Unsplash fallback when `fallbackSrc` is omitted. */
  fallbackSeed?: string;
  /** IntersectionObserver rootMargin; smaller = fewer images load ahead of scroll (default 300px). */
  rootMargin?: string;
  /** Fill the parent box (for hero/carousel backgrounds). Parent must be positioned. */
  fill?: boolean;
  /** Reserve layout space before load (reduces CLS). e.g. "16/9", "4/3", "1/1". */
  aspectRatio?: string;
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
  fallbackSrc,
  fallbackSeed,
  rootMargin = '300px',
  fill = false,
  aspectRatio,
}) => {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);
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
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, rootMargin]);

  useEffect(() => {
    setIsLoaded(priority);
    setHasError(false);
    setActiveSrc(normalizePublicImagePath(src));
    setTriedFallback(false);
  }, [src, fallbackSrc, priority]);

  const resolvedFallback =
    fallbackSrc ||
    (fallbackSeed ? fallbackSafariImage(fallbackSeed) : undefined) ||
    (normalizePublicImagePath(src).startsWith('/images/')
      ? fallbackSafariImage(fallbackSeed || src)
      : undefined);

  const getOptimizedSrc = (originalSrc: string) => {
    const normalized = normalizePublicImagePath(originalSrc);
    const formatUrl = (url: string) => encodePublicImageSrc(url);

    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      if (normalized.includes('images.unsplash.com')) {
      try {
        const u = new URL(normalized);
        const w = width ?? 800;
        const h = height ?? Math.max(400, Math.round((w * 3) / 5));
        u.searchParams.set('auto', 'format');
        u.searchParams.set('fit', 'crop');
        u.searchParams.set('w', String(w));
        u.searchParams.set('h', String(h));
        u.searchParams.set('q', String(quality));
        return formatUrl(u.toString());
      } catch {
        /* fall through */
      }
      }
      if (normalized.includes('unsplash.com')) {
        const separator = normalized.includes('?') ? '&' : '?';
        return formatUrl(
          `${normalized}${separator}auto=format&fit=crop&w=${width || 800}&h=${height || 600}&q=${quality}`
        );
      }
      if (normalized.includes('cloudinary')) {
        const separator = normalized.includes('?') ? '&' : '?';
        return formatUrl(
          `${normalized}${separator}q=${quality}&w=${width || 800}&h=${height || 600}&f_auto`
        );
      }
      return normalized;
    }
    return formatUrl(normalized);
  };

  const optimizedActive = getOptimizedSrc(activeSrc);
  const normalizedActive = normalizePublicImagePath(activeSrc);
  const localVariants = responsiveImages[normalizedActive];
  const srcSet = localVariants?.length
    ? localVariants.map((variant) => `${encodePublicImageSrc(variant.src)} ${variant.width}w`).join(', ')
    : undefined;
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

  const showImage = priority || isLoaded;

  return (
    <div
      ref={containerRef}
      className={cn(fill ? 'absolute inset-0' : 'relative', 'overflow-hidden', className)}
      style={!fill && aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Ultra-fast LQIP background - shows instantly while image loads */}
      {!showImage && (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url('${lqip}')`, backgroundSize: 'cover' }}
        />
      )}

      {/* Actual image — priority/hero loads immediately; others when in view */}
      {isInView && (
        <img
            src={optimizedActive}
            srcSet={srcSet}
            alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          {...(priority || fetchPriority !== 'auto'
            ? { fetchpriority: (priority ? 'high' : fetchPriority) as 'high' | 'low' | 'auto' }
            : {})}
            sizes={sizes || (srcSet ? '100vw' : undefined)}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            if (resolvedFallback && !triedFallback) {
              setTriedFallback(true);
              setActiveSrc(resolvedFallback);
              setIsLoaded(priority);
              return;
            }
            setHasError(true);
          }}
          className={cn(
            fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full',
            !priority && 'transition-opacity duration-300',
            showImage ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
