
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { RapperFormData } from "../types/RapperFormTypes";
import { AliasesInput } from "../AliasesInput";

interface RapperFormFieldsProps {
  formData: RapperFormData;
  onInputChange: (field: keyof RapperFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: (field: keyof RapperFormData) => (value: string) => void;
  onAliasesChange: (aliases: string[]) => void;
}

export const RapperFormFields = ({ 
  formData, 
  onInputChange, 
  onSelectChange,
  onAliasesChange
}: RapperFormFieldsProps) => {
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString(),
  }));

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <ThemedLabel htmlFor="name">Name *</ThemedLabel>
          <ThemedInput
            id="name"
            value={formData.name}
            onChange={onInputChange("name")}
            placeholder="Enter rapper name"
            required
          />
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="real_name">Real Name</ThemedLabel>
          <ThemedInput
            id="real_name"
            value={formData.real_name}
            onChange={onInputChange("real_name")}
            placeholder="Enter real name"
          />
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="origin">Origin</ThemedLabel>
          <ThemedInput
            id="origin"
            value={formData.origin}
            onChange={onInputChange("origin")}
            placeholder="Enter origin/location"
          />
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="birth_year">Birth Year</ThemedLabel>
          <ThemedInput
            id="birth_year"
            type="number"
            value={formData.birth_year}
            onChange={onInputChange("birth_year")}
            placeholder="Enter birth year"
          />
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="birth_month">Birth Month</ThemedLabel>
          <ThemedSelect value={formData.birth_month} onValueChange={onSelectChange("birth_month")}>
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Select month" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              <ThemedSelectItem value="none">None</ThemedSelectItem>
              {months.map(month => (
                <ThemedSelectItem key={month.value} value={month.value}>
                  {month.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="birth_day">Birth Day</ThemedLabel>
          <ThemedSelect value={formData.birth_day} onValueChange={onSelectChange("birth_day")}>
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Select day" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              <ThemedSelectItem value="none">None</ThemedSelectItem>
              {days.map(day => (
                <ThemedSelectItem key={day.value} value={day.value}>
                  {day.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="spotify_id">Spotify ID</ThemedLabel>
          <ThemedInput
            id="spotify_id"
            value={formData.spotify_id}
            onChange={onInputChange("spotify_id")}
            placeholder="Enter Spotify ID"
          />
        </div>

        <div className="space-y-2">
          <ThemedLabel htmlFor="instagram_handle">Instagram Handle</ThemedLabel>
          <ThemedInput
            id="instagram_handle"
            value={formData.instagram_handle}
            onChange={onInputChange("instagram_handle")}
            placeholder="Enter Instagram handle"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <ThemedLabel htmlFor="twitter_handle">Twitter Handle</ThemedLabel>
          <ThemedInput
            id="twitter_handle"
            value={formData.twitter_handle}
            onChange={onInputChange("twitter_handle")}
            placeholder="Enter Twitter handle"
          />
        </div>
      </div>

      <div className="space-y-2">
        <ThemedLabel htmlFor="bio">Bio</ThemedLabel>
        <ThemedTextarea
          id="bio"
          value={formData.bio}
          onChange={onInputChange("bio")}
          placeholder="Enter rapper bio"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <ThemedLabel htmlFor="origins_description">Origins Description</ThemedLabel>
        <ThemedTextarea
          id="origins_description"
          value={formData.origins_description}
          onChange={onInputChange("origins_description")}
          placeholder="Enter custom origins description (optional)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <ThemedLabel>Aliases</ThemedLabel>
        <AliasesInput
          aliases={formData.aliases}
          onChange={onAliasesChange}
        />
      </div>
    </>
  );
};
