
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enableBackground?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

export const useOptimizedQuery = <T,>(options: OptimizedQueryOptions<T>) => {
  const [isVisible, setIsVisible] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('4g');

  useEffect(() => {
    // Page visibility optimization
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Network-aware queries
    const handleConnection = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || '4g');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleConnection);
    window.addEventListener('offline', handleConnection);
    
    handleConnection(); // Initial check

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleConnection);
      window.removeEventListener('offline', handleConnection);
    };
  }, []);

  // Adjust query behavior based on conditions
  const optimizedOptions: UseQueryOptions<T> = {
    ...options,
    // Reduce polling on slow connections
    refetchInterval: options.refetchInterval && connectionType === 'slow-2g' 
      ? (options.refetchInterval as number) * 2 
      : options.refetchInterval,
    
    // Disable background refetch if page is not visible
    refetchIntervalInBackground: options.enableBackground && isVisible,
    
    // Adjust stale time based on priority
    staleTime: options.priority === 'high' 
      ? 1000 * 30 // 30 seconds for high priority
      : options.priority === 'low'
      ? 1000 * 60 * 10 // 10 minutes for low priority  
      : options.staleTime || 1000 * 60 * 2, // 2 minutes default
    
    // Reduce retries on slow connections
    retry: connectionType === 'slow-2g' ? 1 : options.retry ?? 3,
  };

  return useQuery(optimizedOptions);
};
