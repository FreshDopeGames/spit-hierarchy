import { BadgeCheck } from "lucide-react";

interface VerifiedArtistBadgeProps {
  size?: "sm" | "md";
  withLabel?: boolean;
  className?: string;
}

const VerifiedArtistBadge = ({ size = "sm", withLabel = true, className = "" }: VerifiedArtistBadgeProps) => {
  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[hsl(var(--theme-primary))]/20 text-[hsl(var(--theme-primary))] border border-[hsl(var(--theme-primary))]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${className}`}
      title="Verified Artist"
    >
      <BadgeCheck className={iconSize} />
      {withLabel && <span>Verified Artist</span>}
    </span>
  );
};

export default VerifiedArtistBadge;
