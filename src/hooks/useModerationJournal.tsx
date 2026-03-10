import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useModerationJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const flagEntry = useMutation({
    mutationFn: async ({ entryId, reason }: { entryId: string; reason: string }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("member_journal_entries")
        .update({
          is_flagged: true,
          flagged_by: user.id,
          flagged_at: new Date().toISOString(),
          flag_reason: reason,
          status: "draft",
        } as any)
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-journal"] });
      queryClient.invalidateQueries({ queryKey: ["public-journal-entries"] });
      toast.success("Entry flagged and unpublished");
    },
    onError: () => toast.error("Failed to flag entry"),
  });

  const unflagEntry = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("member_journal_entries")
        .update({
          is_flagged: false,
          flagged_by: null,
          flagged_at: null,
          flag_reason: null,
        } as any)
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-journal"] });
      queryClient.invalidateQueries({ queryKey: ["public-journal-entries"] });
      toast.success("Entry restored");
    },
    onError: () => toast.error("Failed to restore entry"),
  });

  return { flagEntry, unflagEntry };
};
