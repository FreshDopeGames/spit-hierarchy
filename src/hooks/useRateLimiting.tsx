
import { useMutation } from "@tanstack/react-query";
import { useSecureAuth } from "./useSecureAuth";
import { handleError, createAppError } from "@/utils/errorHandler";

interface RateLimitOptions {
  actionType: string;
  maxRequests?: number;
  windowMinutes?: number;
}

interface RateLimitRecord {
  actionType: string;
  timestamp: number;
}

export const useRateLimiting = (options: RateLimitOptions) => {
  const { user } = useSecureAuth();

  const checkRateLimit = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw createAppError("User must be authenticated", "AUTH_REQUIRED");
      }

      const storageKey = `rate_limit_${user.id}_${options.actionType}`;
      const windowMs = (options.windowMinutes || 60) * 60 * 1000;
      const maxRequests = options.maxRequests || 10;
      const now = Date.now();

      // Get existing records from localStorage
      const existingRecords: RateLimitRecord[] = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      // Filter out expired records
      const validRecords = existingRecords.filter(
        record => now - record.timestamp < windowMs
      );

      // Check if limit exceeded
      if (validRecords.length >= maxRequests) {
        throw createAppError(
          "Rate limit exceeded. Please try again later.", 
          "RATE_LIMIT_EXCEEDED"
        );
      }

      // Add new record
      const newRecord: RateLimitRecord = {
        actionType: options.actionType,
        timestamp: now
      };
      
      validRecords.push(newRecord);
      
      // Store updated records
      localStorage.setItem(storageKey, JSON.stringify(validRecords));

      return true;
    },
    onError: (error) => {
      handleError(error, 'rate limiting');
    }
  });

  return {
    checkRateLimit: checkRateLimit.mutateAsync,
    isChecking: checkRateLimit.isPending,
    error: checkRateLimit.error
  };
};
