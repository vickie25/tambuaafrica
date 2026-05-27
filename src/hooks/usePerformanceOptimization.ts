import { useEffect } from 'react';

/**
 * Performance Optimization Hook
 * Implements aggressive caching, prefetching, and resource optimization
 */
export const usePerformanceOptimization = () => {
  useEffect(() => {
    if ("fonts" in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add("fonts-loaded");
      });
    }

    // Defer non-critical work to reduce INP impact on first interaction
    const defer = (fn: () => void) => {
      if ("requestIdleCallback" in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(fn);
      } else {
        setTimeout(fn, 1);
      }
    };

    defer(() => {
      if ("connection" in navigator) {
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection?.saveData) {
          document.documentElement.classList.add("save-data");
        }
      }
    });
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
