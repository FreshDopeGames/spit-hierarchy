
import { useMutation } from "@tanstack/react-query";
import { useSecureAuth } from "./useSecureAuth";
import { handleError, createAppError } from "@/utils/errorHandler";
import { createRateLimiter } from "@/utils/securityUtils";

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
  ip?: string;
}

// Enhanced in-memory rate limiting with multiple strategies
const rateLimitCache = new Map<string, RateLimitRecord[]>();
const globalRateLimiter = createRateLimiter(100, 60000); // 100 requests per minute globally
const userRateLimiter = createRateLimiter(30, 60000); // 30 requests per minute per user

export const useSecureRateLimiting = (options: RateLimitOptions) => {
  const { user, isAuthenticated } = useSecureAuth();

  const checkRateLimit = useMutation({
    mutationFn: async () => {
      const identifier = options.userSpecific && user 
        ? `user_${user.id}_${options.actionType}`
        : `global_${options.actionType}`;
      
      const windowMs = (options.windowMinutes || 10) * 60 * 1000;
      const maxRequests = options.maxRequests || 5;
      const now = Date.now();

      // Get user's IP for additional rate limiting (in real app, this would come from server)
      const userAgent = navigator.userAgent;
      const fingerprintId = btoa(userAgent).slice(0, 10);

      // Multi-layer rate limiting
      
      // 1. Global rate limiting
      const globalCheck = globalRateLimiter(fingerprintId);
      if (!globalCheck.allowed) {
        throw createAppError(
          `Too many requests globally. Try again in ${Math.ceil((globalCheck.resetTime! - now) / 1000 / 60)} minutes.`,
          "GLOBAL_RATE_LIMIT_EXCEEDED"
        );
      }

      // 2. User-specific rate limiting
      if (user) {
        const userCheck = userRateLimiter(user.id);
        if (!userCheck.allowed) {
          throw createAppError(
            `Rate limit exceeded for your account. Try again in ${Math.ceil((userCheck.resetTime! - now) / 1000 / 60)} minutes.`,
            "USER_RATE_LIMIT_EXCEEDED"
          );
        }
      }

      // 3. Action-specific rate limiting
      const storageKey = identifier;
      
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
          `Rate limit exceeded for ${options.actionType}. Try again in ${resetTime} minutes.`,
          "ACTION_RATE_LIMIT_EXCEEDED"
        );
      }

      // Add new record
      const newRecord: RateLimitRecord = {
        actionType: options.actionType,
        timestamp: now,
        userId: user?.id,
        ip: fingerprintId
      };
      
      validRecords.push(newRecord);
      
      // Store in both localStorage and memory (with size limits)
      const recordsToStore = validRecords.slice(-maxRequests);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(recordsToStore));
      } catch (e) {
        // Storage quota exceeded, clear old entries
        console.warn('Storage quota exceeded, clearing rate limit cache');
        localStorage.removeItem(storageKey);
      }
      
      rateLimitCache.set(storageKey, recordsToStore);

      // Clean up old cache entries periodically
      if (Math.random() < 0.1) { // 10% chance to cleanup
        const cutoff = now - windowMs * 2; // Keep only recent entries
        for (const [key, records] of rateLimitCache.entries()) {
          const validEntries = records.filter(r => r.timestamp > cutoff);
          if (validEntries.length === 0) {
            rateLimitCache.delete(key);
          } else {
            rateLimitCache.set(key, validEntries);
          }
        }
      }

      return {
        allowed: true,
        remaining: maxRequests - validRecords.length,
        resetTime: now + windowMs
      };
    },
    onError: (error) => {
      handleError(error, 'secure rate limiting');
    }
  });

  const getRemainingQuota = () => {
    const identifier = options.userSpecific && user 
      ? `user_${user.id}_${options.actionType}`
      : `global_${options.actionType}`;
    
    const windowMs = (options.windowMinutes || 10) * 60 * 1000;
    const maxRequests = options.maxRequests || 5;
    const now = Date.now();
    
    const existingRecords: RateLimitRecord[] = JSON.parse(
      localStorage.getItem(identifier) || '[]'
    );
    
    const validRecords = existingRecords.filter(
      record => now - record.timestamp < windowMs
    );
    
    return {
      remaining: Math.max(0, maxRequests - validRecords.length),
      total: maxRequests,
      resetTime: validRecords.length > 0 ? 
        Math.min(...validRecords.map(r => r.timestamp)) + windowMs : 
        now + windowMs
    };
  };

  return {
    checkRateLimit: checkRateLimit.mutateAsync,
    isChecking: checkRateLimit.isPending,
    error: checkRateLimit.error,
    canPerformAction: isAuthenticated || !options.userSpecific,
    getRemainingQuota
  };
};

