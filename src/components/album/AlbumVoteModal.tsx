import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ThemedButton } from "@/components/ui/themed-button";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import {
  useAlbumVotingCategories,
  useUserAlbumVotes,
  useSubmitAlbumRatings,
} from "@/hooks/useAlbumRating";
import { useAuth } from "@/hooks/useAuth";

interface AlbumVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId: string;
  albumTitle: string;
}

const AlbumVoteModal = ({ isOpen, onClose, albumId, albumTitle }: AlbumVoteModalProps) => {
  const { user } = useAuth();
  const { data: categories } = useAlbumVotingCategories();
  const { data: existingVotes } = useUserAlbumVotes(albumId);
  const submit = useSubmitAlbumRatings();

  const [ratings, setRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!categories) return;
    const initial: Record<string, number> = {};
    categories.forEach((c) => {
      const found = existingVotes?.find((v) => v.category_id === c.id);
      initial[c.id] = found?.rating ?? 7;
    });
    setRatings(initial);
  }, [categories, existingVotes]);

  const hasAnyExisting = (existingVotes?.length ?? 0) > 0;

  const dirtyEntries = useMemo(() => {
    if (!categories) return [];
    return categories
      .map((c) => {
        const current = ratings[c.id];
        const existing = existingVotes?.find((v) => v.category_id === c.id);
        if (current == null) return null;
        if (existing && existing.rating === current) return null;
        return { categoryId: c.id, rating: current, existingId: existing?.id };
      })
      .filter(Boolean) as Array<{ categoryId: string; rating: number; existingId?: string }>;
  }, [categories, ratings, existingVotes]);

  const handleSubmit = async () => {
    if (dirtyEntries.length === 0) {
      onClose();
      return;
    }
    await submit.mutateAsync({ albumId, ratings: dirtyEntries });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[hsl(var(--theme-background))] border-[hsl(var(--theme-primary))]/40 max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--theme-text))]">
            Rate {albumTitle}
          </DialogTitle>
          <DialogDescription className="text-[hsl(var(--theme-textMuted))]">
            Score each category from 1 to 10.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <p className="text-sm text-[hsl(var(--theme-textMuted))]">
            Sign in to rate this album.
          </p>
        ) : (
          <div className="space-y-5 py-2">
            {categories?.map((c) => {
              const value = ratings[c.id] ?? 7;
              return (
                <div key={c.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[hsl(var(--theme-text))] font-semibold">
                      {c.name}
                    </Label>
                    <div className="flex items-center gap-1 text-[hsl(var(--theme-primary))]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{value}/10</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={value}
                    onChange={(e) =>
                      setRatings((prev) => ({
                        ...prev,
                        [c.id]: parseInt(e.target.value),
                      }))
                    }
                    className="w-full accent-[hsl(var(--theme-primary))]"
                  />
                  {c.description && (
                    <p className="text-xs text-[hsl(var(--theme-textMuted))]">
                      {c.description}
                    </p>
                  )}
                </div>
              );
            })}

            <ThemedButton
              onClick={handleSubmit}
              disabled={submit.isPending}
              className="w-full !bg-[hsl(var(--theme-primary))] !text-black hover:!bg-[hsl(var(--theme-primaryLight))] !border-0"
            >
              {submit.isPending
                ? "Saving..."
                : hasAnyExisting
                ? "Update Ratings"
                : "Submit Ratings"}
            </ThemedButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AlbumVoteModal;
