
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

      // Call the rate limit function we created in SQL
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('action_type', options.actionType)
        .gte('window_start', new Date(Date.now() - (options.windowMinutes || 60) * 60 * 1000).toISOString());

      if (error) {
        throw error;
      }

      const totalRequests = data?.reduce((sum, record) => sum + record.request_count, 0) || 0;
      
      if (totalRequests >= (options.maxRequests || 10)) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Insert new rate limit record
      const windowStart = new Date();
      windowStart.setMinutes(Math.floor(windowStart.getMinutes() / (options.windowMinutes || 60)) * (options.windowMinutes || 60));
      windowStart.setSeconds(0);
      windowStart.setMilliseconds(0);

      const { error: insertError } = await supabase
        .from('rate_limits')
        .upsert({
          user_id: user.id,
          action_type: options.actionType,
          window_start: windowStart.toISOString(),
          request_count: 1
        }, {
          onConflict: 'user_id,action_type,window_start',
          ignoreDuplicates: false
        });

      if (insertError) {
        throw insertError;
      }

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
