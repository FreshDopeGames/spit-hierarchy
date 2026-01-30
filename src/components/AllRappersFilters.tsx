
import React from "react";
import { ThemedInput } from "@/components/ui/themed-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Mic, ArrowUp, ArrowDown } from "lucide-react";
import { getAllZodiacSigns } from "@/utils/zodiacUtils";
import { useAllRapperTags } from "@/hooks/useAllRapperTags";

interface AllRappersFiltersProps {
  searchInput: string;
  searchTerm: string;
  locationInput: string;
  locationFilter: string;
  sortBy: string;
  sortOrder: string;
  zodiacFilter: string;
  tagFilter: string;
  onSearchInput: (value: string) => void;
  onLocationInput: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onZodiacFilterChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
}

const AllRappersFilters = ({
  searchInput,
  searchTerm,
  locationInput,
  locationFilter,
  sortBy,
  sortOrder,
  zodiacFilter,
  tagFilter,
  onSearchInput,
  onLocationInput,
  onSortChange,
  onOrderChange,
  onZodiacFilterChange,
  onTagFilterChange
}: AllRappersFiltersProps) => {
  const zodiacSigns = getAllZodiacSigns();
  const { data: allTags = [] } = useAllRapperTags();

  return (
    <div className="bg-black border-2 border-[hsl(var(--theme-primary))] rounded-lg p-3 sm:p-4 mb-8 backdrop-blur-sm shadow-lg overflow-hidden min-w-0 max-w-full">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 min-w-0">
        <Mic className="text-[hsl(var(--theme-textMuted))] w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        <h3 className="text-[hsl(var(--theme-textMuted))] font-[var(--theme-fontPrimary)] text-lg sm:text-xl animate-text-glow truncate">Search The Greatest</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(var(--theme-secondary))] via-[hsl(var(--theme-accent))] to-transparent min-w-0"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 min-w-0 max-w-full">
        {/* Search */}
        <div className="relative min-w-0 col-span-2 sm:col-span-1">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--theme-textMuted))] w-4 h-4" />
          <ThemedInput placeholder="Search..." value={searchInput} onChange={e => onSearchInput(e.target.value)} className="pl-8 sm:pl-10 pr-8 bg-black border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] placeholder-[hsl(var(--theme-textMuted))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] !text-[hsl(var(--theme-text))] text-sm truncate" />
          {searchInput !== searchTerm && <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[hsl(var(--theme-textMuted))] animate-spin" />
            </div>}
        </div>

        {/* Location Filter (Debounced now) */}
        <div className="relative min-w-0">
          <ThemedInput placeholder="Location" value={locationInput} onChange={e => onLocationInput(e.target.value)} className="pr-8 bg-black border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] placeholder-[hsl(var(--theme-textMuted))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] !text-[hsl(var(--theme-text))] text-sm truncate" />
          {locationInput !== locationFilter && <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[hsl(var(--theme-textMuted))] animate-spin" />
            </div>}
        </div>

        {/* Zodiac Filter */}
        <div className="min-w-0 max-w-full">
          <Select value={zodiacFilter} onValueChange={onZodiacFilterChange}>
            <SelectTrigger className="bg-black/95 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Zodiac" />
            </SelectTrigger>
            <SelectContent className="bg-black border-2 border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))] z-50 max-h-60">
              <SelectItem value="all" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">All Signs</SelectItem>
              {zodiacSigns.map((sign) => (
                <SelectItem 
                  key={sign.name} 
                  value={sign.name}
                  className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm"
                >
                  {sign.symbol} {sign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rap Style Filter */}
        <div className="min-w-0 max-w-full">
          <Select value={tagFilter || "all"} onValueChange={onTagFilterChange}>
            <SelectTrigger className="bg-black/95 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent className="bg-black border-2 border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))] z-50 max-h-60">
              <SelectItem value="all" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">All Styles</SelectItem>
              {allTags.map((tag) => (
                <SelectItem 
                  key={tag.id} 
                  value={tag.slug}
                  className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm"
                >
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="min-w-0 max-w-full">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="bg-black/95 border-[hsl(var(--theme-border))] text-[hsl(var(--theme-text))] focus:border-[hsl(var(--theme-primary))] focus:ring-[hsl(var(--theme-primary))]/30 font-[var(--theme-fontSecondary)] text-sm w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-black border-2 border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))] z-50">
              <SelectItem value="activity" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Activity</SelectItem>
              <SelectItem value="name" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Name</SelectItem>
              <SelectItem value="rating" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Rating</SelectItem>
              <SelectItem value="votes" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Votes</SelectItem>
              <SelectItem value="origin" className="bg-transparent text-[hsl(var(--theme-text))] focus:bg-[hsl(var(--theme-backgroundLight))] focus:text-[hsl(var(--theme-text))] font-[var(--theme-fontSecondary)] text-sm">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order Toggle Button */}
        <div className="min-w-0 max-w-full">
          <Button
            variant="outline"
            onClick={() => onOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full h-10 bg-[hsl(var(--theme-primary))] border-[hsl(var(--theme-primary))] text-black font-bold hover:bg-[hsl(var(--theme-primary))]/80 hover:text-black font-[var(--theme-fontSecondary)] text-sm"
          >
            {sortOrder === 'asc' ? (
              <>
                <ArrowUp className="w-4 h-4 mr-1" />
                Asc
              </>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 mr-1" />
                Desc
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AllRappersFilters;
