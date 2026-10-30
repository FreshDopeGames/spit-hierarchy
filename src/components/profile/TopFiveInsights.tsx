import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cake, Tags, Disc3, MapPin, CalendarDays } from "lucide-react";
import { average, favoriteRegion, rapperAge, topStyles } from "@/lib/topFiveInsights";

interface Props { rapperIds: string[] }

const Stat = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-[hsl(var(--theme-primary))]/25 bg-[hsl(var(--theme-surfaceSecondary))] p-3 flex flex-col items-center text-center gap-1">
    <Icon className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
    <div className="text-[11px] uppercase tracking-wider text-[hsl(var(--theme-textMuted))]">{label}</div>
    <div className="text-[hsl(var(--theme-text))] font-bold">{children}</div>
  </div>
);

const TopFiveInsights = ({ rapperIds }: Props) => {
  const key = [...rapperIds].sort().join(",");
  const { data, isLoading } = useQuery({
    queryKey: ["top-five-insights", key],
    enabled: rapperIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("id, origin, birth_year, death_year, career_start_year, rapper_tag_assignments(rapper_tags(name)), rapper_albums(albums(release_date, release_type))")
        .in("id", rapperIds);
      if (error) throw error;
      const rows = (data || []) as any[];
      const albumsPer = rows.map((r) =>
        (r.rapper_albums || []).map((ra: any) => ra.albums).filter((a: any) => a && a.release_type === "album")
      );
      return {
        age: average(rows.map((r) => rapperAge(r.birth_year, r.death_year))),
        styles: topStyles(rows.map((r) => (r.rapper_tag_assignments || []).map((t: any) => t.rapper_tags?.name).filter(Boolean))),
        albums: average(albumsPer.map((a) => a.length)),
        region: favoriteRegion(rows.map((r) => r.origin)),
        debut: average(rows.map((r, i) => {
          const years = albumsPer[i].map((a: any) => a.release_date && parseInt(a.release_date.slice(0, 4))).filter(Boolean);
          return years.length ? Math.min(...years) : r.career_start_year;
        })),
      };
    },
  });

  if (rapperIds.length === 0) return null;

  return (
    <div className="mt-6">
      <h4 className="text-center text-sm sm:text-base font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] mb-3">
        What Your Top 5 Says About You
      </h4>
      {isLoading || !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-lg bg-rap-carbon/30" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat icon={Cake} label="Avg Age">{data.age != null ? `${Math.round(data.age)} yrs` : "—"}</Stat>
          <Stat icon={Disc3} label="Avg Albums">{data.albums != null ? data.albums.toFixed(1) : "—"}</Stat>
          <Stat icon={CalendarDays} label="Avg Debut">{data.debut != null ? Math.round(data.debut) : "—"}</Stat>
          <Stat icon={MapPin} label="Favorite Region">{data.region ?? "—"}</Stat>
          <div className="col-span-2 lg:col-span-1">
            <Stat icon={Tags} label="Top Styles">
              {data.styles.length ? (
                <div className="flex flex-wrap justify-center gap-1">
                  {data.styles.map((s) => (
                    <span key={s} className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-[hsl(var(--theme-primary))] text-black">{s}</span>
                  ))}
                </div>
              ) : "—"}
            </Stat>
          </div>
        </div>
      )}
      {rapperIds.length < 5 && (
        <p className="text-center text-xs mt-2 text-[hsl(var(--theme-textMuted))]">Fill all 5 slots for the full picture.</p>
      )}
    </div>
  );
};

export default TopFiveInsights;
