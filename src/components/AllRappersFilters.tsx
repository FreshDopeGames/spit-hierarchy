
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";

interface AllRappersFiltersProps {
  searchInput: string;
  searchTerm: string;
  locationFilter: string;
  sortBy: string;
  sortOrder: string;
  onSearchInput: (value: string) => void;
  onLocationFilter: (value: string) => void;
  onSortChange: (value: string) => void;
  onOrderChange: (value: string) => void;
}

const AllRappersFilters = ({
  searchInput,
  searchTerm,
  locationFilter,
  sortBy,
  sortOrder,
  onSearchInput,
  onLocationFilter,
  onSortChange,
  onOrderChange,
}: AllRappersFiltersProps) => {
  return (
    <div className="bg-black/40 border border-purple-500/20 rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search rappers..."
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            className="pl-10 bg-black/60 border-purple-500/30 text-white placeholder-gray-400"
          />
          {searchInput !== searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Location Filter */}
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => onLocationFilter(e.target.value)}
          className="bg-black/60 border-purple-500/30 text-white placeholder-gray-400"
        />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-purple-500/30 text-white">
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="votes">Vote Count</SelectItem>
            <SelectItem value="origin">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onOrderChange}>
          <SelectTrigger className="bg-black/60 border-purple-500/30 text-white">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-purple-500/30 text-white">
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AllRappersFilters;
