import { useState } from "react";
import { Star } from "lucide-react";
import { ThemedButton } from "@/components/ui/themed-button";
import { useAlbumRatingStats } from "@/hooks/useAlbumRating";
import { useAuth } from "@/hooks/useAuth";
import AlbumVoteModal from "./AlbumVoteModal";
import { useNavigate } from "react-router-dom";

interface AlbumRatingButtonProps {
  albumId: string;
  albumTitle: string;
}

const AlbumRatingButton = ({ albumId, albumTitle }: AlbumRatingButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data } = useAlbumRatingStats(albumId);
  const [open, setOpen] = useState(false);

  const avg = data?.averageRating;
  const total = data?.totalRatings ?? 0;
  const display = avg != null && total > 0 ? avg.toFixed(1) : "N/A";

  const handleClick = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[hsl(var(--theme-text))]">
          <Star className="w-5 h-5 fill-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]" />
          <span className="text-2xl font-bold">{display}</span>
          <span className="text-sm text-muted-foreground">
            {total === 1 ? "1 rating" : `${total} ratings`}
          </span>
        </div>
        <ThemedButton
          onClick={handleClick}
          size="sm"
          className="!bg-[hsl(var(--theme-primary))] !text-black hover:!bg-[hsl(var(--theme-primaryLight))] !border-0"
        >
          <Star className="w-4 h-4 mr-2" />
          {user ? "Rate This Album" : "Sign In to Rate"}
        </ThemedButton>
      </div>
      {open && (
        <AlbumVoteModal
          isOpen={open}
          onClose={() => setOpen(false)}
          albumId={albumId}
          albumTitle={albumTitle}
        />
      )}
    </>
  );
};

export default AlbumRatingButton;
