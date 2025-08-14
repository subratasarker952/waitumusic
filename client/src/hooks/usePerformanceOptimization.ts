import { useCallback, useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PerformanceConfig {
  enableVirtualization?: boolean;
  chunkSize?: number;
  debounceMs?: number;
  cacheTimeout?: number;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {}) => {
  const {
    enableVirtualization = true,
    chunkSize = 50,
    debounceMs = 300,
    cacheTimeout = 300000 // 5 minutes
  } = config;

  const queryClient = useQueryClient();
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Debounced function factory
  const createDebouncedFunction = useCallback(
    <T extends (...args: any[]) => any>(fn: T, delay: number = debounceMs): T => {
      let timeoutId: NodeJS.Timeout;
      return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      }) as T;
    },
    [debounceMs]
  );

  // Chunked data processing
  const processDataInChunks = useCallback(
    <T>(data: T[], processor: (chunk: T[]) => void): Promise<void> => {
      return new Promise((resolve) => {
        setIsOptimizing(true);
        let index = 0;
        
        const processChunk = () => {
          const chunk = data.slice(index, index + chunkSize);
          if (chunk.length === 0) {
            setIsOptimizing(false);
            resolve();
            return;
          }
          
          processor(chunk);
          index += chunkSize;
          
          // Use requestAnimationFrame for smooth UI updates
          requestAnimationFrame(processChunk);
        };
        
        processChunk();
      });
    },
    [chunkSize]
  );

  // Memoized virtual list calculator
  const calculateVirtualItems = useMemo(() => {
    return (
      containerHeight: number,
      itemHeight: number,
      totalItems: number,
      scrollTop: number
    ) => {
      if (!enableVirtualization) {
        return { start: 0, end: totalItems, visibleItems: totalItems };
      }

      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + visibleCount + 2, totalItems); // Buffer items
      
      return {
        start: Math.max(0, start - 1), // Pre-buffer
        end,
        visibleItems: end - start
      };
    };
  }, [enableVirtualization]);

  // Cache management utilities
  const optimizeCache = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const now = Date.now();
    
    queries.forEach(query => {
      const lastUpdated = query.state.dataUpdatedAt;
      if (now - lastUpdated > cacheTimeout) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient, cacheTimeout]);

  // Automatic cache cleanup
  useEffect(() => {
    const interval = setInterval(optimizeCache, cacheTimeout);
    return () => clearInterval(interval);
  }, [optimizeCache, cacheTimeout]);

  // Performance monitoring
  const measurePerformance = useCallback(
    <T>(operation: () => T, operationName: string): T => {
      const start = performance.now();
      const result = operation();
      const end = performance.now();
      
      if (end - start > 100) { // Log slow operations
        console.warn(`Slow operation detected: ${operationName} took ${end - start}ms`);
      }
      
      return result;
    },
    []
  );

  // Memory usage monitoring
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100,
        total: Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100,
        limit: Math.round((memory.jsHeapSizeLimit / 1048576) * 100) / 100
      };
    }
    return null;
  }, []);

  return {
    isOptimizing,
    createDebouncedFunction,
    processDataInChunks,
    calculateVirtualItems,
    optimizeCache,
    measurePerformance,
    checkMemoryUsage
  };
};

// Hook for large dataset optimization
export const useLargeDatasetOptimization = <T>(
  data: T[],
  searchQuery: string = '',
  filterFn?: (item: T, query: string) => boolean
) => {
  const { createDebouncedFunction, processDataInChunks } = usePerformanceOptimization();
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const debouncedFilter = useMemo(
    () => createDebouncedFunction((query: string) => {
      setIsProcessing(true);
      
      if (!query.trim()) {
        setFilteredData(data);
        setIsProcessing(false);
        return;
      }

      const filterFunction = filterFn || ((item: any, q: string) => 
        JSON.stringify(item).toLowerCase().includes(q.toLowerCase())
      );

      const filtered: T[] = [];
      
      processDataInChunks(data, (chunk) => {
        const chunkFiltered = chunk.filter(item => filterFunction(item, query));
        filtered.push(...chunkFiltered);
      }).then(() => {
        setFilteredData(filtered);
        setIsProcessing(false);
      });
    }, 300),
    [data, filterFn, createDebouncedFunction, processDataInChunks]
  );

  useEffect(() => {
    debouncedFilter(searchQuery);
  }, [searchQuery, debouncedFilter]);

  return {
    filteredData,
    isProcessing,
    totalItems: data.length,
    filteredCount: filteredData.length
  };
};