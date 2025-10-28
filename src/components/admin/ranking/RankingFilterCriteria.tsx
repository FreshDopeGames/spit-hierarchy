import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import { FilterCriteria } from "./rankingFormSchema";
import { Badge } from "@/components/ui/badge";

interface RankingFilterCriteriaProps {
  value: FilterCriteria;
  onChange: (filters: FilterCriteria) => void;
}

const DECADES = ["1980s", "1990s", "2000s", "2010s", "2020s"];
const ARTIST_TYPES = [
  { value: "solo", label: "Solo Artists" },
  { value: "group", label: "Groups" }
];

const RankingFilterCriteria = ({ value, onChange }: RankingFilterCriteriaProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch unique locations
  const { data: locations = [] } = useQuery({
    queryKey: ["rapper-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("origin")
        .not("origin", "is", null)
        .order("origin");
      
      if (error) throw error;
      
      // Get unique locations
      const uniqueLocations = [...new Set(data.map(r => r.origin))];
      return uniqueLocations.sort();
    }
  });
  
  // Fetch rapper tags for style filter
  const { data: rapperTags = [] } = useQuery({
    queryKey: ["rapper-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_tags")
        .select("id, name, slug")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });
  
  const handleLocationToggle = (location: string) => {
    const newLocations = value.locations?.includes(location)
      ? value.locations.filter(l => l !== location)
      : [...(value.locations || []), location];
    onChange({ ...value, locations: newLocations });
  };
  
  const handleDecadeToggle = (decade: string) => {
    const newDecades = value.decades?.includes(decade)
      ? value.decades.filter(d => d !== decade)
      : [...(value.decades || []), decade];
    onChange({ ...value, decades: newDecades });
  };
  
  const handleArtistTypeToggle = (type: string) => {
    const newTypes = value.artist_types?.includes(type)
      ? value.artist_types.filter(t => t !== type)
      : [...(value.artist_types || []), type];
    onChange({ ...value, artist_types: newTypes });
  };
  
  const handleTagToggle = (tagId: string) => {
    const newTags = value.tag_ids?.includes(tagId)
      ? value.tag_ids.filter(t => t !== tagId)
      : [...(value.tag_ids || []), tagId];
    onChange({ ...value, tag_ids: newTags });
  };
  
  const clearAllFilters = () => {
    onChange({
      locations: [],
      decades: [],
      artist_types: [],
      tag_ids: []
    });
  };
  
  const activeFilterCount = 
    (value.locations?.length || 0) + 
    (value.decades?.length || 0) + 
    (value.artist_types?.length || 0) + 
    (value.tag_ids?.length || 0);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-surface hover:bg-surface-hover rounded-lg transition-colors border border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <span className="font-heading text-foreground text-sm">
            Filter Criteria
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "transform rotate-180" : ""}`} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pt-4 space-y-6">
        <div className="text-xs text-muted-foreground mb-4">
          Apply filters to automatically populate this ranking with specific rappers. Leave all filters empty to include all rappers.
        </div>
        
        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all filters
          </button>
        )}
        
        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="font-heading text-foreground text-sm">Location</Label>
          <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 bg-background space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={value.locations?.includes(location)}
                  onCheckedChange={() => handleLocationToggle(location)}
                />
                <label
                  htmlFor={`location-${location}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {location}
                </label>
              </div>
            ))}
          </div>
          {value.locations && value.locations.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {value.locations.length} location{value.locations.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
        
        {/* Career Era Filter */}
        <div className="space-y-2">
          <Label className="font-heading text-foreground text-sm">Career Era</Label>
          <div className="space-y-2">
            {DECADES.map((decade) => (
              <div key={decade} className="flex items-center space-x-2">
                <Checkbox
                  id={`decade-${decade}`}
                  checked={value.decades?.includes(decade)}
                  onCheckedChange={() => handleDecadeToggle(decade)}
                />
                <label
                  htmlFor={`decade-${decade}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {decade}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Artist Type Filter */}
        <div className="space-y-2">
          <Label className="font-heading text-foreground text-sm">Artist Type</Label>
          <div className="space-y-2">
            {ARTIST_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={value.artist_types?.includes(type.value)}
                  onCheckedChange={() => handleArtistTypeToggle(type.value)}
                />
                <label
                  htmlFor={`type-${type.value}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Style/Tag Filter */}
        <div className="space-y-2">
          <Label className="font-heading text-foreground text-sm">Style/Genre Tags</Label>
          <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3 bg-background space-y-2">
            {rapperTags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tag.id}`}
                  checked={value.tag_ids?.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                />
                <label
                  htmlFor={`tag-${tag.id}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {tag.name}
                </label>
              </div>
            ))}
          </div>
          {value.tag_ids && value.tag_ids.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {value.tag_ids.length} tag{value.tag_ids.length > 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RankingFilterCriteria;