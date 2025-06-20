
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

interface RateLimitOptions {
  actionType: string;
  maxRequests?: number;
  windowMinutes?: number;
}

export const useRateLimiting = (options: RateLimitOptions) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const checkRateLimit = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { data, error } = await supabase.rpc('check_rate_limit', {
        _user_id: user.id,
        _action_type: options.actionType,
        _max_requests: options.maxRequests || 10,
        _window_minutes: options.windowMinutes || 60
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      return data;
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
