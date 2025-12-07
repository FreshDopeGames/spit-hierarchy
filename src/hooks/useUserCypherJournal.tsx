import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CypherVerse {
  id: string;
  comment_text: string;
  created_at: string;
  bars_count: number;
}

export interface CypherJournalStats {
  totalVerses: number;
  totalBars: number;
  averageBarsPerVerse: number;
}

export interface CypherJournalData {
  verses: CypherVerse[];
  stats: CypherJournalStats;
}

export const useUserCypherJournal = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-cypher-journal", userId],
    queryFn: async (): Promise<CypherJournalData> => {
      if (!userId) {
        return {
          verses: [],
          stats: { totalVerses: 0, totalBars: 0, averageBarsPerVerse: 0 }
        };
      }

      // Fetch user's cypher comments (parent comments only, not replies)
      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          id,
          comment_text,
          created_at,
          comment_likes (id)
        `)
        .eq("user_id", userId)
        .eq("content_type", "cypher")
        .eq("content_id", "community-cypher")
        .is("parent_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include bars count
      const verses: CypherVerse[] = (comments || []).map((comment) => ({
        id: comment.id,
        comment_text: comment.comment_text,
        created_at: comment.created_at,
        bars_count: comment.comment_likes?.length || 0
      }));

      // Calculate stats
      const totalVerses = verses.length;
      const totalBars = verses.reduce((sum, verse) => sum + verse.bars_count, 0);
      const averageBarsPerVerse = totalVerses > 0 
        ? Math.round((totalBars / totalVerses) * 10) / 10 
        : 0;

      return {
        verses,
        stats: {
          totalVerses,
          totalBars,
          averageBarsPerVerse
        }
      };
    },
    enabled: !!userId
  });
};
