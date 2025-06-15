import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Mic } from "lucide-react";
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
  onOrderChange
}: AllRappersFiltersProps) => {
  return <div className="bg-carbon-fiber border-2 border-rap-burgundy/40 rounded-lg p-6 mb-8 backdrop-blur-sm shadow-lg py-[23px]">
      <div className="flex items-center gap-3 mb-4">
        <Mic className="text-rap-silver w-6 h-6" />
        <h3 className="text-rap-silver font-graffiti text-xl animate-text-glow">Find Your Flow</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-rap-burgundy via-rap-forest to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-silver w-4 h-4" />
          <Input placeholder="Search the culture..." value={searchInput} onChange={e => onSearchInput(e.target.value)} className="pl-10 bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum placeholder-rap-smoke focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street" />
          {searchInput !== searchTerm && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-rap-silver animate-spin" />
            </div>}
        </div>

        {/* Location Filter */}
        <Input placeholder="Filter by city/state..." value={locationFilter} onChange={e => onLocationFilter(e.target.value)} className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum placeholder-rap-smoke focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street" />

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-rap-carbon/95 border-rap-burgundy/50 text-rap-platinum backdrop-blur-sm">
            <SelectItem value="name" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Name</SelectItem>
            <SelectItem value="rating" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Rating</SelectItem>
            <SelectItem value="votes" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Vote Count</SelectItem>
            <SelectItem value="origin" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onOrderChange}>
          <SelectTrigger className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-rap-carbon/95 border-rap-burgundy/50 text-rap-platinum backdrop-blur-sm">
            <SelectItem value="asc" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Ascending</SelectItem>
            <SelectItem value="desc" className="focus:bg-rap-burgundy/20 focus:text-rap-silver font-street">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>;
};
export default AllRappersFilters;