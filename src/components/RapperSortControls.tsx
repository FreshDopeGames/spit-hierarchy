
import { Button } from "@/components/ui/button";

interface RapperSortControlsProps {
  sortBy: "name" | "rating" | "votes";
  onSortChange: (sortBy: "name" | "rating" | "votes") => void;
}

const RapperSortControls = ({ sortBy, onSortChange }: RapperSortControlsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-gray-300 text-sm self-center mr-2">Sort by:</span>
      <Button
        variant={sortBy === "rating" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("rating")}
        className={sortBy === "rating" ? "bg-purple-600" : "border-purple-500/30 text-purple-300"}
      >
        Top Rated
      </Button>
      <Button
        variant={sortBy === "votes" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("votes")}
        className={sortBy === "votes" ? "bg-purple-600" : "border-purple-500/30 text-purple-300"}
      >
        Most Voted
      </Button>
      <Button
        variant={sortBy === "name" ? "default" : "outline"}
        size="sm"
        onClick={() => onSortChange("name")}
        className={sortBy === "name" ? "bg-purple-600" : "border-purple-500/30 text-purple-300"}
      >
        Alphabetical
      </Button>
    </div>
  );
};

export default RapperSortControls;
