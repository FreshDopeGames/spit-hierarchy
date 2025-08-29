
import { Button } from "@/components/ui/button";

interface RapperSortControlsProps {
  sortBy: "name" | "rating" | "votes";
  onSortChange: (sortBy: "name" | "rating" | "votes") => void;
}

const RapperSortControls = ({ sortBy, onSortChange }: RapperSortControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-[var(--theme-textMuted)] text-sm self-center mr-2">Sort by:</span>
      <Button
        variant={sortBy === "rating" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("rating")}
        className={sortBy === "rating" ? "bg-[var(--theme-primary)] text-[var(--theme-textInverted)]" : "border-[var(--theme-primary)]/30 text-[var(--theme-primary)]"}
      >
        Top Rated
      </Button>
      <Button
        variant={sortBy === "votes" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("votes")}
        className={sortBy === "votes" ? "bg-[var(--theme-primary)] text-[var(--theme-textInverted)]" : "border-[var(--theme-primary)]/30 text-[var(--theme-primary)]"}
      >
        Most Voted
      </Button>
      <Button
        variant={sortBy === "name" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("name")}
        className={sortBy === "name" ? "bg-[var(--theme-primary)] text-[var(--theme-textInverted)]" : "border-[var(--theme-primary)]/30 text-[var(--theme-primary)]"}
      >
        Alphabetical
      </Button>
    </div>
  );
};

export default RapperSortControls;
