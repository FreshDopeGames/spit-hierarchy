
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
  ratedFilter: string;
  onSearchInput: (value: string) => void;
  onLocationInput: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onRatedFilterChange: (value: string) => void;
}

const AllRappersFilters = ({
  searchInput,
  searchTerm,
  locationInput,
  locationFilter,
  sortBy,
  sortOrder,
  ratedFilter,
  onSearchInput,
  onLocationInput,
  onSortChange,
  onOrderChange,
  onRatedFilterChange
}: AllRappersFiltersProps) => {
  return (
    <div className="bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))] rounded-lg p-3 sm:p-4 lg:p-6 mb-8 backdrop-blur-sm shadow-lg overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
        <Mic className="text-[hsl(var(--theme-textMuted))] w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <h3 className="text-[hsl(var(--theme-textMuted))] font-[var(--theme-fontPrimary)] text-lg sm:text-xl animate-text-glow truncate">Search The Greatest</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--theme-secondary))] via-[hsl(var(--theme-accent))] to-transparent min-w-0"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 min-w-0 overflow-hidden max-w-full">
        {/* Search */}
        <div className="relative min-w-0">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--theme-textMuted))] w-4 h-4" />
          <ThemedInput placeholder="Search..." value={searchInput} onChange={e => onSearchInput(e.target.value)} className="pl-8 sm:pl-10 pr-8 bg-[hsl(var(--theme-surface))]/90 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] placeholder-[hsl(var(--theme-textMuted))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] !text-[hsl(var(--theme-text))] text-sm truncate" />
          {searchInput !== searchTerm && <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[hsl(var(--theme-textMuted))] animate-spin" />
            </div>}
        </div>

        {/* Location Filter (Debounced now) */}
        <div className="relative min-w-0">
          <ThemedInput placeholder="City/state..." value={locationInput} onChange={e => onLocationInput(e.target.value)} className="pr-8 bg-[hsl(var(--theme-surface))]/90 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] placeholder-[hsl(var(--theme-textMuted))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] !text-[hsl(var(--theme-text))] text-sm truncate" />
          {locationInput !== locationFilter && <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[hsl(var(--theme-textMuted))] animate-spin" />
            </div>}
        </div>

        {/* Rated Filter */}
        <div className="min-w-0 max-w-full">
          <Select value={ratedFilter} onValueChange={onRatedFilterChange}>
            <SelectTrigger className="bg-[hsl(var(--theme-surface))]/90 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--theme-card))] border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] backdrop-blur-sm z-50">
              <SelectItem value="all" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">All Rappers</SelectItem>
              <SelectItem value="rated" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Rated by Me</SelectItem>
              <SelectItem value="not_rated" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Not Rated by Me</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="min-w-0 max-w-full">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-[hsl(var(--theme-surface))]/90 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--theme-card))] border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] backdrop-blur-sm z-50">
              <SelectItem value="activity" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Activity</SelectItem>
              <SelectItem value="name" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Name</SelectItem>
              <SelectItem value="rating" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Rating</SelectItem>
              <SelectItem value="votes" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Vote Count</SelectItem>
              <SelectItem value="origin" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="min-w-0 max-w-full">
          <Select value={sortOrder} onValueChange={onOrderChange}>
            <SelectTrigger className="bg-[hsl(var(--theme-surface))]/90 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--theme-card))] border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] backdrop-blur-sm z-50">
              <SelectItem value="asc" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Ascending</SelectItem>
              <SelectItem value="desc" className="focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AllRappersFilters;
