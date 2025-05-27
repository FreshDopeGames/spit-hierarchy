
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
    <div className="bg-black/60 border-2 border-hip-hop-gold/30 rounded-lg p-6 mb-8 backdrop-blur-sm shadow-lg">
      <h3 className="text-hip-hop-gold font-street text-lg mb-4 text-center">Filter & Sort The Culture</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-hip-hop-gold w-4 h-4" />
          <Input
            placeholder="Search the culture..."
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            className="pl-10 bg-black/80 border-hip-hop-electric-blue/50 text-white placeholder-gray-400 focus:border-hip-hop-gold focus:ring-hip-hop-gold/30"
          />
          {searchInput !== searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-hip-hop-gold animate-spin" />
            </div>
          )}
        </div>

        {/* Location Filter */}
        <Input
          placeholder="Filter by city/state..."
          value={locationFilter}
          onChange={(e) => onLocationFilter(e.target.value)}
          className="bg-black/80 border-hip-hop-electric-blue/50 text-white placeholder-gray-400 focus:border-hip-hop-gold focus:ring-hip-hop-gold/30"
        />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-black/80 border-hip-hop-electric-blue/50 text-white focus:border-hip-hop-gold focus:ring-hip-hop-gold/30">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-hip-hop-gold/50 text-white backdrop-blur-sm">
            <SelectItem value="name" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Name</SelectItem>
            <SelectItem value="rating" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Rating</SelectItem>
            <SelectItem value="votes" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Vote Count</SelectItem>
            <SelectItem value="origin" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onOrderChange}>
          <SelectTrigger className="bg-black/80 border-hip-hop-electric-blue/50 text-white focus:border-hip-hop-gold focus:ring-hip-hop-gold/30">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-hip-hop-gold/50 text-white backdrop-blur-sm">
            <SelectItem value="asc" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Ascending</SelectItem>
            <SelectItem value="desc" className="focus:bg-hip-hop-gold/20 focus:text-hip-hop-gold">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AllRappersFilters;
