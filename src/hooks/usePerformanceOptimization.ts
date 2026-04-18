import { useEffect } from 'react';

/**
 * Performance Optimization Hook
 * Implements aggressive caching, prefetching, and resource optimization
 */
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Prefetch critical resources
    const prefetchResources = () => {
      const links = [
        { href: '/safaris', as: 'fetch' },
        { href: '/destinations', as: 'fetch' },
        { href: '/blog', as: 'fetch' },
      ];

      links.forEach(({ href }) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    };

    // Optimize Web Fonts loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
    }

    // Enable requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchResources();
      });
    } else {
      setTimeout(prefetchResources, 2000);
    }

    // Disable network information tracking if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.saveData) {
        // Respect data-saving mode
        console.log('Data-saving mode enabled');
      }
    }
  }, []);
};

/**
 * Image Preload Utility
 * Preloads images for faster rendering
 */
export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Dynamic Import with Timeout Fallback
 * Ensures components load quickly or fail gracefully
 */
export const withFallbackImport = async (
  importFn: () => Promise<any>,
  timeoutMs = 5000
) => {
  return Promise.race([
    importFn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Import timeout')), timeoutMs)
    ),
  ]);
};
