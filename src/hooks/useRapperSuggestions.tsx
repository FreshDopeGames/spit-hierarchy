import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useSecurityContext } from "./useSecurityContext";
import { toast } from "sonner";
import type { RapperSuggestion, RapperSuggestionWithUser } from "@/types/rapperSuggestion";

const DAILY_LIMIT = 5;
const STORAGE_KEY = "rapper_suggestions_count";

const checkDailyLimit = (): boolean => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) return true;
  
  try {
    const { date, count } = JSON.parse(stored);
    if (date !== today) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    return count < DAILY_LIMIT;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
};

const incrementDailyCount = () => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }));
    return;
  }
  
  try {
    const { date, count } = JSON.parse(stored);
    if (date !== today) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: count + 1 }));
    }
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }));
  }
};

export const useSuggestionSubmit = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rapper_name: string; additional_info?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      if (!checkDailyLimit()) {
        throw new Error("You've reached the daily limit of 5 suggestions. Try again tomorrow.");
      }

      const { data: result, error } = await supabase
        .from("rapper_suggestions")
        .insert({
          user_id: user.id,
          rapper_name: data.rapper_name,
          additional_info: data.additional_info,
        })
        .select()
        .single();

      if (error) throw error;
      
      incrementDailyCount();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-suggestions"] });
      toast.success("Suggestion submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit suggestion");
    },
  });
};

export const useUserSuggestions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-suggestions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("rapper_suggestions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RapperSuggestion[];
    },
    enabled: !!user?.id,
  });
};

export const useAdminSuggestions = (status?: string) => {
  const { user } = useAuth();
  const { isAdmin } = useSecurityContext();

  return useQuery({
    queryKey: ["admin-suggestions", status],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("rapper_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Only fetch user profiles if the current user is an admin
      if (!isAdmin) {
        return data.map(suggestion => ({
          ...suggestion,
          status: suggestion.status as 'pending' | 'approved' | 'rejected',
        }));
      }

      // Fetch user profiles for admins
      const userIds = [...new Set(data.map(s => s.user_id))];
      
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .rpc("get_profiles_batch", { profile_user_ids: userIds });

      const suggestionsWithUsers: RapperSuggestionWithUser[] = data.map(suggestion => ({
        ...suggestion,
        status: suggestion.status as 'pending' | 'approved' | 'rejected',
        username: profiles?.find((p: any) => p.id === suggestion.user_id)?.username,
        avatar_url: profiles?.find((p: any) => p.id === suggestion.user_id)?.avatar_url,
      }));

      return suggestionsWithUsers;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateSuggestionStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      status: "approved" | "rejected";
      admin_notes?: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("rapper_suggestions")
        .update({
          status: params.status,
          admin_notes: params.admin_notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suggestions"] });
      toast.success("Suggestion updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update suggestion");
    },
  });
};
