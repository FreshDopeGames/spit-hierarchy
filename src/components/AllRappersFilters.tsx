
import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedInput } from "@/components/ui/themed-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Mic } from "lucide-react";

interface AllRappersFiltersProps {
  searchInput: string;
  searchTerm: string;
  locationInput: string;
  locationFilter: string;
  sortBy: string;
  sortOrder: string;
  onSearchInput: (value: string) => void;
  onLocationInput: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
}

const AllRappersFilters = ({
  searchInput,
  searchTerm,
  locationInput,
  locationFilter,
  sortBy,
  sortOrder,
  onSearchInput,
  onLocationInput,
  onSortChange,
  onOrderChange
}: AllRappersFiltersProps) => {
  return (
    <div className="bg-[var(--theme-surface)] border-2 border-[var(--theme-primary)] rounded-lg p-6 mb-8 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Mic className="text-[var(--theme-textMuted)] w-6 h-6" />
        <h3 className="text-[var(--theme-textMuted)] font-[var(--theme-fontPrimary)] text-xl animate-text-glow">Search The Greatest</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[var(--theme-secondary)] via-[var(--theme-accent)] to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--theme-textMuted)] w-4 h-4" />
          <ThemedInput placeholder="Search the culture..." value={searchInput} onChange={e => onSearchInput(e.target.value)} className="pl-10 bg-[var(--theme-surface)]/90 border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-textMuted)] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)] !text-[var(--theme-text)]" />
          {searchInput !== searchTerm && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[var(--theme-textMuted)] animate-spin" />
            </div>}
        </div>

        {/* Location Filter (Debounced now) */}
        <div className="relative">
          <ThemedInput placeholder="Filter by city/state..." value={locationInput} onChange={e => onLocationInput(e.target.value)} className="bg-[var(--theme-surface)]/90 border-[var(--theme-border)] text-[var(--theme-text)] placeholder-[var(--theme-textMuted)] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)] !text-[var(--theme-text)]" />
          {locationInput !== locationFilter && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[var(--theme-textMuted)] animate-spin" />
            </div>}
        </div>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-[var(--theme-surface)]/90 border-[var(--theme-border)] text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-text)] backdrop-blur-sm">
            <SelectItem value="name" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Name</SelectItem>
            <SelectItem value="rating" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Rating</SelectItem>
            <SelectItem value="votes" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Vote Count</SelectItem>
            <SelectItem value="origin" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onOrderChange}>
          <SelectTrigger className="bg-[var(--theme-surface)]/90 border-[var(--theme-border)] text-[var(--theme-text)] focus:border-[var(--theme-primary)] focus:ring-[var(--theme-primary)]/30 font-[var(--theme-fontSecondary)]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-text)] backdrop-blur-sm">
            <SelectItem value="asc" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Ascending</SelectItem>
            <SelectItem value="desc" className="focus:bg-[var(--theme-backgroundLight)] focus:text-[var(--theme-text)] font-[var(--theme-fontSecondary)]">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AllRappersFilters;
