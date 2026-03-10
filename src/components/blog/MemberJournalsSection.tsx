import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MemberJournalCard from "./MemberJournalCard";
import { BookOpen } from "lucide-react";

const JOURNAL_LIMIT = 6;

const MemberJournalsSection = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["public-journal-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_journal_entries")
        .select(`
          id,
          title,
          excerpt,
          slug,
          created_at,
          user_id
        `)
        .eq("is_public", true)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(JOURNAL_LIMIT);
      if (error) throw error;

      // Fetch profiles for these entries
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      return data.map(entry => ({
        ...entry,
        profiles: profileMap.get(entry.user_id) || { username: "unknown", full_name: null, avatar_url: null },
      }));
    },
  });

  if (isLoading || !entries || entries.length === 0) return null;

  return (
    <section className="mt-16 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-[var(--theme-primary)]" />
        <h2 className="font-[var(--theme-fontPrimary)] text-[var(--theme-text)] text-3xl">
          MEMBER JOURNALS
        </h2>
      </div>
      <p className="text-[var(--theme-textMuted)] font-[var(--theme-fontSecondary)] mb-6">
        Personal hip-hop listening journeys from our community members.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(entry => (
          <MemberJournalCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
};

export default MemberJournalsSection;
