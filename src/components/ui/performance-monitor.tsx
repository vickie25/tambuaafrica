import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const metricsData = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    };

    const updateMetrics = () => {
      setMetrics({ ...metricsData });
      
      if (import.meta.env.DEV) {
        console.log('🚀 Final Performance Metrics:', metricsData);
      }
    };

    // FCP & Paint metrics
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metricsData.firstContentfulPaint = entry.startTime;
        }
      });
      updateMetrics();
    });
    paintObserver.observe({ type: 'paint', buffered: true });

    // LCP metric
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metricsData.largestContentfulPaint = lastEntry.startTime;
      updateMetrics();
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // CLS metric
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: LayoutShift) => {
        if (!entry.hadRecentInput) {
          metricsData.cumulativeLayoutShift += entry.value;
        }
      });
      updateMetrics();
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // FID metric
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: PerformanceEventTiming) => {
        metricsData.firstInputDelay = entry.processingStart - entry.startTime;
      });
      updateMetrics();
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Navigation timing
    const handleLoad = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metricsData.loadTime = navigation.loadEventEnd - navigation.startTime;
        updateMetrics();
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      paintObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return metrics;
};

export const PerformanceReport: React.FC = () => {
  const metrics = usePerformanceMonitor();

  if (!import.meta.env.DEV) return null;

  const getScoreColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'text-green-600';
    if (value <= poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 text-xs">
      <h4 className="font-semibold mb-2">Performance</h4>
      <div className="space-y-1">
        <div className={getScoreColor(metrics.loadTime, 1000, 3000)}>
          Load: {metrics.loadTime.toFixed(0)}ms
        </div>
        <div className={getScoreColor(metrics.firstContentfulPaint, 1800, 3000)}>
          FCP: {metrics.firstContentfulPaint.toFixed(0)}ms
        </div>
        <div className={getScoreColor(metrics.largestContentfulPaint, 2500, 4000)}>
          LCP: {metrics.largestContentfulPaint.toFixed(0)}ms
        </div>
        <div className={getScoreColor(metrics.cumulativeLayoutShift, 0.1, 0.25)}>
          CLS: {metrics.cumulativeLayoutShift.toFixed(3)}
        </div>
        <div className={getScoreColor(metrics.firstInputDelay, 100, 300)}>
          FID: {metrics.firstInputDelay.toFixed(0)}ms
        </div>
      </div>
    </div>
  );
};
