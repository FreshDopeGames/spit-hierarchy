import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { useTrendingRappers } from "@/hooks/useTrendingRappers";
import RapperAvatar from "@/components/RapperAvatar";
import { formatDistanceToNow } from "date-fns";

const TrendingRappersSection = () => {
  const { data: trending, isLoading } = useTrendingRappers();

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="h-48 rounded-lg bg-rap-carbon-light/40 animate-pulse" />
      </section>
    );
  }

  if (!trending || trending.length === 0) return null;

  const updatedLabel = formatDistanceToNow(new Date(trending[0].generated_at), {
    addSuffix: true,
  });

  return (
    <section className="mb-16">
      <h2 className="font-ceviche text-primary mb-2 sm:mb-3 tracking-wider text-4xl sm:text-6xl text-center leading-tight">
        TRENDING RAPPERS
      </h2>
      <p className="text-sm text-rap-smoke text-center mb-6 sm:mb-8">
        Most talked about in hip-hop media — past 3 days · Updated {updatedLabel}
      </p>


      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {trending.map((r) => (
          <Link
            key={r.id}
            to={`/rapper/${r.slug}`}
            className="group relative rounded-lg overflow-hidden bg-rap-carbon-light/50 border-2 border-[hsl(var(--theme-primary))]/40 hover:border-[hsl(var(--theme-primary))] transition-colors p-3 flex flex-col items-center text-center"
          >
            <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-[hsl(var(--theme-primary))] text-rap-carbon font-bold text-sm flex items-center justify-center">
              {r.rank}
            </div>
            <RapperAvatar
              rapper={{ id: r.rapper_id, name: r.name, slug: r.slug }}
              size="sm"
              imageUrl={r.image_url}
              variant="square"
            />
            <h3 className="mt-2 text-white font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-[hsl(var(--theme-primary))] transition-colors">
              {r.name}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-rap-smoke">
              <TrendingUp className="w-3 h-3" />
              <span>
                {r.mention_count} {r.mention_count === 1 ? "mention" : "mentions"}
              </span>
            </div>
            <div className="text-[10px] text-rap-smoke/70 mt-0.5">
              {r.sources.length} {r.sources.length === 1 ? "source" : "sources"}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default TrendingRappersSection;

