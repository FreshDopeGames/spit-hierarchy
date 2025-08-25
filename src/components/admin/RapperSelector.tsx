import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllRappers } from "@/hooks/useAllRappers";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RapperSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeIds: string[];
  placeholder?: string;
  required?: boolean;
}

const RapperSelector = ({
  label,
  value,
  onChange,
  excludeIds,
  placeholder = "Select rapper",
  required = false
}: RapperSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const { 
    rappersData, 
    isLoading: isLoadingRappers,
    handleSearchInput
  } = useAllRappers({
    itemsPerPage: 100
  });

  // Update search when query changes
  useEffect(() => {
    handleSearchInput(searchQuery);
  }, [searchQuery, handleSearchInput]);

  // Filter out excluded rappers and apply search
  const availableRappers = (rappersData?.rappers || [])
    .filter(rapper => !excludeIds.includes(rapper.id))
    .filter(rapper => 
      searchQuery.length < 2 || 
      rapper.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const selectedRapper = (rappersData?.rappers || []).find(r => r.id === value);

  const clearSelection = () => {
    onChange("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-rap-platinum">{label}</Label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search rappers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-rap-gold/30 text-black placeholder:text-gray-500"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Rapper Select */}
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger className="bg-white border-rap-gold/30 text-black">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className="bg-white border-rap-gold/30 max-h-60 z-50"
          position="popper"
          sideOffset={4}
        >
          {isLoadingRappers ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading rappers...</span>
              </div>
            </SelectItem>
          ) : availableRappers.length === 0 ? (
            <SelectItem value="no-results" disabled>
              {searchQuery.length >= 2 ? "No rappers found" : "Type to search rappers"}
            </SelectItem>
          ) : (
            availableRappers.map((rapper) => (
              <SelectItem 
                key={rapper.id} 
                value={rapper.id}
                className="text-black hover:bg-rap-gold/10 focus:bg-rap-gold/10"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{rapper.name}</span>
                  {rapper.real_name && (
                    <span className="text-sm text-gray-600">{rapper.real_name}</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {/* Clear Selection Button */}
      {value && selectedRapper && (
        <div className="flex items-center justify-between p-2 bg-rap-gold/10 rounded border border-rap-gold/30">
          <span className="text-sm text-rap-platinum">
            Selected: <strong>{selectedRapper.name}</strong>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs hover:bg-rap-gold/20"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default RapperSelector;