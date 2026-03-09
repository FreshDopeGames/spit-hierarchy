import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  is_public: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMemberJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ["member-journal", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_journal_entries")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (entry: { title: string; content: string; is_public: boolean; status: string }) => {
      const slug = entry.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        + "-" + Date.now();
      const excerpt = entry.content.substring(0, 200);
      const { data, error } = await supabase
        .from("member_journal_entries")
        .insert({
          user_id: user!.id,
          title: entry.title,
          content: entry.content,
          excerpt,
          slug,
          is_public: entry.is_public,
          status: entry.status,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-journal"] });
      toast.success("Journal entry saved!");
    },
    onError: () => toast.error("Failed to save entry"),
  });

  const updateEntry = useMutation({
    mutationFn: async (entry: { id: string; title: string; content: string; is_public: boolean; status: string }) => {
      const excerpt = entry.content.substring(0, 200);
      const { data, error } = await supabase
        .from("member_journal_entries")
        .update({
          title: entry.title,
          content: entry.content,
          excerpt,
          is_public: entry.is_public,
          status: entry.status,
        })
        .eq("id", entry.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-journal"] });
      toast.success("Entry updated!");
    },
    onError: () => toast.error("Failed to update entry"),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("member_journal_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-journal"] });
      toast.success("Entry deleted");
    },
    onError: () => toast.error("Failed to delete entry"),
  });

  return { entries: entriesQuery.data || [], isLoading: entriesQuery.isLoading, createEntry, updateEntry, deleteEntry };
};
