
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="bg-rap-carbon border-2 border-rap-gold rounded-lg p-6 mb-8 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Mic className="text-rap-silver w-6 h-6" />
        <h3 className="text-rap-silver font-graffiti text-xl animate-text-glow">Search The Greatest</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-rap-burgundy via-rap-forest to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rap-silver w-4 h-4" />
          <Input placeholder="Search the culture..." value={searchInput} onChange={e => onSearchInput(e.target.value)} className="pl-10 bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum placeholder-rap-smoke focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street !text-rap-platinum" />
          {searchInput !== searchTerm && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-rap-silver animate-spin" />
            </div>}
        </div>

        {/* Location Filter (Debounced now) */}
        <div className="relative">
          <Input placeholder="Filter by city/state..." value={locationInput} onChange={e => onLocationInput(e.target.value)} className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum placeholder-rap-smoke focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street !text-rap-platinum" />
          {locationInput !== locationFilter && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-rap-silver animate-spin" />
            </div>}
        </div>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm">
            <SelectItem value="name" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Name</SelectItem>
            <SelectItem value="rating" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Rating</SelectItem>
            <SelectItem value="votes" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Vote Count</SelectItem>
            <SelectItem value="origin" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={onOrderChange}>
          <SelectTrigger className="bg-rap-carbon/90 border-rap-forest/60 text-rap-platinum focus:border-rap-burgundy focus:ring-rap-burgundy/30 font-street">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 backdrop-blur-sm">
            <SelectItem value="asc" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Ascending</SelectItem>
            <SelectItem value="desc" className="focus:bg-gray-100 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-100 font-street">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AllRappersFilters;
