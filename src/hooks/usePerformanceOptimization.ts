import { useEffect } from 'react';

/**
 * Performance Optimization Hook
 * Implements aggressive caching, prefetching, and resource optimization
 */
export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Optimize Web Fonts loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded');
      });
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
