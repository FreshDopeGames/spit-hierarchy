import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useMostViewedRappers } from "@/hooks/useMostViewedRappers";
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedSkeleton } from "@/components/ui/themed-skeleton";
import RapperAvatar from "@/components/RapperAvatar";

const MostViewedCard = () => {
  const { data: rappers, isLoading } = useMostViewedRappers(5);

  if (isLoading) {
    return (
      <ThemedCard variant="dark" className="border-[hsl(var(--theme-primary))]/30 border-primary">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2 font-mogra">
            <Eye className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
            Most Viewed
          </ThemedCardTitle>
          <p className="text-xs text-[hsl(var(--theme-textMuted))]">Last 7 days</p>
        </ThemedCardHeader>
        <ThemedCardContent className="space-y-4">
          <ThemedSkeleton className="h-40 w-full" />
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  if (!rappers || rappers.length === 0) {
    return (
      <ThemedCard variant="dark" className="border-[hsl(var(--theme-primary))]/30 border-primary">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2 font-mogra">
            <Eye className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
            Most Viewed
          </ThemedCardTitle>
          <p className="text-xs text-[hsl(var(--theme-textMuted))]">Last 7 days</p>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-[hsl(var(--theme-textMuted))] text-sm">No page views recorded yet.</p>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  const [first, second, ...rest] = rappers;

  return (
    <ThemedCard variant="dark" className="border-[hsl(var(--theme-primary))]/30 border-primary">
      <ThemedCardHeader>
        <ThemedCardTitle className="flex items-center gap-2 font-mogra">
          <Eye className="h-5 w-5 text-[hsl(var(--theme-primary))]" />
          Most Viewed
        </ThemedCardTitle>
        <p className="text-xs text-[hsl(var(--theme-textMuted))]">Last 7 days</p>
      </ThemedCardHeader>
      <ThemedCardContent>
        {/* DESKTOP: all 5 in one row */}
        <div className="hidden lg:flex justify-center gap-6">
          {rappers.map((rapper, i) => (
            <div key={rapper.id} className="flex flex-col items-center gap-2 flex-1 min-w-0">
              <span className="text-[hsl(var(--theme-primary))] font-bold text-sm font-mogra">#{i + 1}</span>
              <RapperAvatar
                rapper={{ id: rapper.id, name: rapper.name, slug: rapper.slug }}
                size="md"
                imageUrl={rapper.image_url}
                variant="square"
              />
              <div className="text-center min-w-0 w-full">
                <Link
                  to={`/rapper/${rapper.slug}`}
                  className="text-sm font-semibold text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-primary))] truncate block font-mogra"
                >
                  {rapper.name}
                </Link>
                <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                  {rapper.view_count.toLocaleString()} views
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TABLET: top 2 on row 1, 3-5 on row 2 */}
        <div className="hidden md:flex lg:hidden flex-col gap-4">
          <div className="flex justify-center gap-8">
            {[first, second].filter(Boolean).map((rapper, i) => (
              <div key={rapper.id} className="flex flex-col items-center gap-2">
                <span className="text-[hsl(var(--theme-primary))] font-bold text-sm font-mogra">#{i + 1}</span>
                <RapperAvatar
                  rapper={{ id: rapper.id, name: rapper.name, slug: rapper.slug }}
                  size="md"
                  imageUrl={rapper.image_url}
                  variant="square"
                />
                <div className="text-center">
                  <Link
                    to={`/rapper/${rapper.slug}`}
                    className="text-sm font-semibold text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-primary))] truncate block font-mogra"
                  >
                    {rapper.name}
                  </Link>
                  <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                    {rapper.view_count.toLocaleString()} views
                  </p>
                </div>
              </div>
            ))}
          </div>
          {rest.length > 0 && (
            <div className="flex justify-center gap-6">
              {rest.map((rapper, i) => (
                <div key={rapper.id} className="flex flex-col items-center gap-2">
                  <span className="text-[hsl(var(--theme-primary))] font-bold text-xs font-mogra">#{i + 3}</span>
                  <RapperAvatar
                    rapper={{ id: rapper.id, name: rapper.name, slug: rapper.slug }}
                    size="sm"
                    imageUrl={rapper.image_url}
                    variant="square"
                  />
                  <div className="text-center">
                    <Link
                      to={`/rapper/${rapper.slug}`}
                      className="text-xs font-semibold text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-primary))] truncate block"
                    >
                      {rapper.name}
                    </Link>
                    <p className="text-[10px] text-[hsl(var(--theme-textMuted))]">
                      {rapper.view_count.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MOBILE: hero #1 + list #2-5 */}
        <div className="md:hidden">
          <div className="flex flex-col items-center gap-3 mb-6">
            <RapperAvatar
              rapper={{ id: first.id, name: first.name, slug: first.slug }}
              size="lg"
              imageUrl={first.image_url}
              variant="square"
            />
            <div className="text-center">
              <Link
                to={`/rapper/${first.slug}`}
                className="text-lg font-bold text-[hsl(var(--theme-primary))] hover:underline font-mogra"
              >
                {first.name}
              </Link>
              <p className="text-sm text-[hsl(var(--theme-textMuted))]">
                {first.view_count.toLocaleString()} views
              </p>
            </div>
          </div>
          {[second, ...rest].filter(Boolean).length > 0 && (
            <div className="space-y-3">
              {[second, ...rest].filter(Boolean).map((rapper, i) => (
                <div key={rapper.id} className="flex items-center gap-3">
                  <span className="text-[hsl(var(--theme-primary))] font-bold text-sm w-5 text-right font-mogra">
                    {i + 2}
                  </span>
                  <RapperAvatar
                    rapper={{ id: rapper.id, name: rapper.name, slug: rapper.slug }}
                    size="sm"
                    imageUrl={rapper.image_url}
                    variant="square"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/rapper/${rapper.slug}`}
                      className="text-sm font-semibold text-[hsl(var(--theme-text))] hover:text-[hsl(var(--theme-primary))] truncate block"
                    >
                      {rapper.name}
                    </Link>
                    <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                      {rapper.view_count.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default MostViewedCard;
