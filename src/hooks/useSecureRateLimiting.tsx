
import { useMutation } from "@tanstack/react-query";
import { useSecureAuth } from "./useSecureAuth";
import { handleError, createAppError } from "@/utils/errorHandler";

interface RateLimitOptions {
  actionType: string;
  maxRequests?: number;
  windowMinutes?: number;
  userSpecific?: boolean;
}

interface RateLimitRecord {
  actionType: string;
  timestamp: number;
  userId?: string;
}

// In-memory rate limiting for additional security
const rateLimitCache = new Map<string, RateLimitRecord[]>();

export const useSecureRateLimiting = (options: RateLimitOptions) => {
  const { user, isAuthenticated } = useSecureAuth();

  const checkRateLimit = useMutation({
    mutationFn: async () => {
      const storageKey = options.userSpecific && user 
        ? `rate_limit_${user.id}_${options.actionType}`
        : `rate_limit_${options.actionType}`;
      
      const windowMs = (options.windowMinutes || 10) * 60 * 1000;
      const maxRequests = options.maxRequests || 5;
      const now = Date.now();

      // Check both localStorage and memory cache
      const existingRecords: RateLimitRecord[] = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );
      
      const memoryRecords = rateLimitCache.get(storageKey) || [];
      const allRecords = [...existingRecords, ...memoryRecords];

      // Filter out expired records
      const validRecords = allRecords.filter(
        record => now - record.timestamp < windowMs
      );

      // Check if limit exceeded
      if (validRecords.length >= maxRequests) {
        const resetTime = Math.ceil((windowMs - (now - Math.min(...validRecords.map(r => r.timestamp)))) / 1000 / 60);
        throw createAppError(
          `Rate limit exceeded. Try again in ${resetTime} minutes.`,
          "RATE_LIMIT_EXCEEDED"
        );
      }

      // Add new record
      const newRecord: RateLimitRecord = {
        actionType: options.actionType,
        timestamp: now,
        userId: user?.id
      };
      
      validRecords.push(newRecord);
      
      // Store in both localStorage and memory
      localStorage.setItem(storageKey, JSON.stringify(validRecords.slice(-maxRequests)));
      rateLimitCache.set(storageKey, validRecords.slice(-maxRequests));

      return true;
    },
    onError: (error) => {
      handleError(error, 'secure rate limiting');
    }
  });

  return {
    checkRateLimit: checkRateLimit.mutateAsync,
    isChecking: checkRateLimit.isPending,
    error: checkRateLimit.error,
    canPerformAction: isAuthenticated || !options.userSpecific
  };
};
