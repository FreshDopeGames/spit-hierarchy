import { MapPin } from "lucide-react";
import { COUNTRIES, US_STATES } from "@/utils/geographicData";
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

export interface GeoFilter {
  countryCode: string | null;
  region: string | null;
}

interface GeographicFilterProps {
  value: GeoFilter;
  onChange: (filter: GeoFilter) => void;
}

const GeographicFilter = ({ value, onChange }: GeographicFilterProps) => {
  const handleCountryChange = (val: string) => {
    if (val === "all") {
      onChange({ countryCode: null, region: null });
    } else {
      onChange({ countryCode: val, region: null });
    }
  };

  const handleRegionChange = (val: string) => {
    if (val === "all") {
      onChange({ ...value, region: null });
    } else {
      onChange({ ...value, region: val });
    }
  };

  const selectedCountryLabel = value.countryCode
    ? COUNTRIES.find((c) => c.value === value.countryCode)?.label || value.countryCode
    : "All Locations";

  const selectedRegionLabel = value.region || "All States";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MapPin className="w-4 h-4 text-[hsl(var(--theme-primary))]" />
      <ThemedSelect value={value.countryCode || "all"} onValueChange={handleCountryChange}>
        <ThemedSelectTrigger className="w-[180px] h-9 text-sm">
          <ThemedSelectValue placeholder="All Locations">{selectedCountryLabel}</ThemedSelectValue>
        </ThemedSelectTrigger>
        <ThemedSelectContent>
          <ThemedSelectItem value="all">🌍 All Locations</ThemedSelectItem>
          <ThemedSelectSeparator />
          <ThemedSelectGroup>
            <ThemedSelectLabel>Countries</ThemedSelectLabel>
            {COUNTRIES.map((country) => (
              <ThemedSelectItem key={country.value} value={country.value}>
                {country.label}
              </ThemedSelectItem>
            ))}
          </ThemedSelectGroup>
        </ThemedSelectContent>
      </ThemedSelect>

      {value.countryCode === "US" && (
        <ThemedSelect value={value.region || "all"} onValueChange={handleRegionChange}>
          <ThemedSelectTrigger className="w-[180px] h-9 text-sm">
            <ThemedSelectValue placeholder="All States">{selectedRegionLabel}</ThemedSelectValue>
          </ThemedSelectTrigger>
          <ThemedSelectContent>
            <ThemedSelectItem value="all">All States</ThemedSelectItem>
            <ThemedSelectSeparator />
            <ThemedSelectGroup>
              <ThemedSelectLabel>US States</ThemedSelectLabel>
              {US_STATES.map((state) => (
                <ThemedSelectItem key={state.value} value={state.value}>
                  {state.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectGroup>
          </ThemedSelectContent>
        </ThemedSelect>
      )}
    </div>
  );
};

export default GeographicFilter;
