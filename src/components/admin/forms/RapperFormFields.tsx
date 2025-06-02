
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RapperFormData } from "../types/RapperFormTypes";

interface RapperFormFieldsProps {
  formData: RapperFormData;
  onInputChange: (field: keyof RapperFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onVerifiedChange: (checked: boolean) => void;
}

export const RapperFormFields = ({ 
  formData, 
  onInputChange, 
  onVerifiedChange 
}: RapperFormFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={onInputChange("name")}
            placeholder="Enter rapper name"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="real_name" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Real Name</Label>
          <Input
            id="real_name"
            value={formData.real_name}
            onChange={onInputChange("real_name")}
            placeholder="Enter real name"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="origin" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Origin</Label>
          <Input
            id="origin"
            value={formData.origin}
            onChange={onInputChange("origin")}
            placeholder="Enter origin/location"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_year" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Birth Year</Label>
          <Input
            id="birth_year"
            type="number"
            value={formData.birth_year}
            onChange={onInputChange("birth_year")}
            placeholder="Enter birth year"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spotify_id" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Spotify ID</Label>
          <Input
            id="spotify_id"
            value={formData.spotify_id}
            onChange={onInputChange("spotify_id")}
            placeholder="Enter Spotify ID"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_handle" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Instagram Handle</Label>
          <Input
            id="instagram_handle"
            value={formData.instagram_handle}
            onChange={onInputChange("instagram_handle")}
            placeholder="Enter Instagram handle"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="twitter_handle" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Twitter Handle</Label>
          <Input
            id="twitter_handle"
            value={formData.twitter_handle}
            onChange={onInputChange("twitter_handle")}
            placeholder="Enter Twitter handle"
            className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={onInputChange("bio")}
          placeholder="Enter rapper bio"
          className="bg-[var(--theme-backgroundLight)] border-[var(--theme-border)] text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)]"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="verified"
          checked={formData.verified}
          onCheckedChange={onVerifiedChange}
        />
        <Label htmlFor="verified" className="text-[var(--theme-text)] font-[var(--theme-font-body)]">Verified Artist</Label>
      </div>
    </>
  );
};
