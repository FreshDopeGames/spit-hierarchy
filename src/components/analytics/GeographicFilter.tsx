import { MapPin } from "lucide-react";
import { PRIORITY_US_LOCATIONS, COUNTRIES } from "@/utils/geographicData";
import {
  ThemedSelect,
  ThemedSelectContent,
  ThemedSelectGroup,
  ThemedSelectItem,
  ThemedSelectLabel,
  ThemedSelectTrigger,
  ThemedSelectValue,
  ThemedSelectSeparator,
} from "@/components/ui/themed-select";
import { cn } from "@/lib/utils";

export interface GeoFilter {
  countryCode: string | null;
  region: string | null;
}

interface GeographicFilterProps {
  value: GeoFilter;
  onChange: (filter: GeoFilter) => void;
}

const GeographicFilter = ({ value, onChange }: GeographicFilterProps) => {
  const handleLocationChange = (val: string) => {
    if (val === "all") {
      onChange({ countryCode: null, region: null });
    } else if (val.startsWith("US-")) {
      // US state selected - country is US, region is the state
      onChange({ countryCode: "US", region: val.replace("US-", "") });
    } else {
      // Country selected
      onChange({ countryCode: val, region: null });
    }
  };

  const getSelectedLabel = () => {
    if (!value.countryCode) return "All Locations";
    
    // Check if it's a US state selection
    if (value.countryCode === "US" && value.region) {
      const stateOption = PRIORITY_US_LOCATIONS.find(
        (opt) => opt.value === `US-${value.region}`
      );
      if (stateOption) return stateOption.label;
    }
    
    // Check countries
    const countryOption = COUNTRIES.find((c) => c.value === value.countryCode);
    if (countryOption) return countryOption.label;
    
    // Check priority locations (US, Puerto Rico)
    const priorityOption = PRIORITY_US_LOCATIONS.find((opt) => opt.value === value.countryCode);
    if (priorityOption) return priorityOption.label;
    
    return value.countryCode;
  };

  const selectedLabel = getSelectedLabel();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MapPin className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
      <ThemedSelect 
        value={value.countryCode ? (value.region ? `US-${value.region}` : value.countryCode) : "all"} 
        onValueChange={handleLocationChange}
      >
        <ThemedSelectTrigger 
          className={cn(
            "w-[200px] h-9 text-sm",
            "bg-black border-2 border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]",
            "focus:ring-[hsl(var(--theme-primary))] focus:ring-offset-0"
          )}
        >
          <ThemedSelectValue placeholder="All Locations">{selectedLabel}</ThemedSelectValue>
        </ThemedSelectTrigger>
        <ThemedSelectContent 
          className="bg-black border-2 border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))]"
        >
          <ThemedSelectItem 
            value="all"
            className="text-[hsl(var(--theme-primary))] focus:bg-[hsl(var(--theme-primary)/0.2)] focus:text-[hsl(var(--theme-primary))]"
          >
            🌍 All Locations
          </ThemedSelectItem>
          <ThemedSelectSeparator className="bg-[hsl(var(--theme-primary)/0.3)]" />
          
          {/* Priority US Locations - 52 items at top */}
          <ThemedSelectGroup>
            <ThemedSelectLabel className="text-[hsl(var(--theme-primary)/0.7)]">United States</ThemedSelectLabel>
            {PRIORITY_US_LOCATIONS.map((location) => (
              <ThemedSelectItem 
                key={location.value} 
                value={location.value}
                className="text-[hsl(var(--theme-primary))] focus:bg-[hsl(var(--theme-primary)/0.2)] focus:text-[hsl(var(--theme-primary))]"
              >
                {location.value.startsWith("US-") ? `• ${location.label}` : location.label}
              </ThemedSelectItem>
            ))}
          </ThemedSelectGroup>
          
          <ThemedSelectSeparator className="bg-[hsl(var(--theme-primary)/0.3)]" />
          
          {/* All Countries */}
          <ThemedSelectGroup>
            <ThemedSelectLabel className="text-[hsl(var(--theme-primary)/0.7)]">All Countries</ThemedSelectLabel>
            {COUNTRIES.map((country) => (
              <ThemedSelectItem 
                key={country.value} 
                value={country.value}
                className="text-[hsl(var(--theme-primary))] focus:bg-[hsl(var(--theme-primary)/0.2)] focus:text-[hsl(var(--theme-primary))]"
              >
                {country.label}
              </ThemedSelectItem>
            ))}
          </ThemedSelectGroup>
        </ThemedSelectContent>
      </ThemedSelect>
    </div>
  );
};

export default GeographicFilter;
