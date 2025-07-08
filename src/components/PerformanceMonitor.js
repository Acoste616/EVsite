import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          console.log(`[Performance] ${entry.name}:`, entry.value);
        }
      });

      // Observe different performance metrics
      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        console.log('[Performance] Some performance metrics not supported');
      }

      // Monitor memory usage if available
      if ('memory' in performance) {
        const logMemory = () => {
          const memory = performance.memory;
          console.log('[Performance] Memory:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB',
          });
        };

        // Log memory usage every 30 seconds
        const memoryInterval = setInterval(logMemory, 30000);

        return () => {
          observer.disconnect();
          clearInterval(memoryInterval);
        };
      }

      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
