
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();

  const checkRateLimit = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated");
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
        throw new Error("Rate limit exceeded. Please try again later.");
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
    onError: (error: any) => {
      toast({
        title: "Rate Limit Exceeded",
        description: error.message || "You're making too many requests. Please slow down.",
        variant: "destructive",
      });
    }
  });

  return {
    checkRateLimit: checkRateLimit.mutateAsync,
    isChecking: checkRateLimit.isPending,
    error: checkRateLimit.error
  };
};
