import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { RapperFormData } from "../types/RapperFormTypes";
import RapperTagSelector from "../RapperTagSelector";

type Rapper = Tables<"rappers">;

interface RapperFormProps {
  rapper?: Rapper | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const RapperForm = ({ rapper, onSuccess, onCancel }: RapperFormProps) => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<RapperFormData>({
    name: "",
    real_name: "",
    origin: "",
    birth_year: "",
    birth_month: "",
    birth_day: "",
    death_year: "",
    death_month: "",
    death_day: "",
    bio: "",
    origins_description: "",
    verified: false,
    spotify_id: "",
    instagram_handle: "",
    twitter_handle: "",
    tags: [],
  });

  // Fetch existing tags for this rapper
  const { data: existingTags = [] } = useQuery({
    queryKey: ["rapper-tag-assignments", rapper?.id],
    queryFn: async () => {
      if (!rapper?.id) return [];
      
      const { data, error } = await supabase
        .from("rapper_tag_assignments")
        .select("tag_id")
        .eq("rapper_id", rapper.id);
      
      if (error) throw error;
      return data.map(item => item.tag_id);
    },
    enabled: !!rapper?.id,
  });

  // Initialize form data when rapper or existing tags change
  useEffect(() => {
    if (rapper) {
      setFormData({
        name: rapper.name || "",
        real_name: rapper.real_name || "",
        origin: rapper.origin || "",
        birth_year: rapper.birth_year?.toString() || "",
        birth_month: rapper.birth_month?.toString() || "",
        birth_day: rapper.birth_day?.toString() || "",
        death_year: rapper.death_year?.toString() || "",
        death_month: rapper.death_month?.toString() || "",
        death_day: rapper.death_day?.toString() || "",
        bio: rapper.bio || "",
        origins_description: rapper.origins_description || "",
        verified: rapper.verified || false,
        spotify_id: rapper.spotify_id || "",
        instagram_handle: rapper.instagram_handle || "",
        twitter_handle: rapper.twitter_handle || "",
        tags: existingTags,
      });
    } else {
      setFormData({
        name: "",
        real_name: "",
        origin: "",
        birth_year: "",
        birth_month: "",
        birth_day: "",
        death_year: "",
        death_month: "",
        death_day: "",
        bio: "",
        origins_description: "",
        verified: false,
        spotify_id: "",
        instagram_handle: "",
        twitter_handle: "",
        tags: [],
      });
    }
  }, [rapper, existingTags]);

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push("Name is required");
    }
    
    if (formData.birth_year && (parseInt(formData.birth_year) < 1900 || parseInt(formData.birth_year) > new Date().getFullYear())) {
      errors.push("Birth year must be between 1900 and current year");
    }
    
    if (formData.birth_month && (parseInt(formData.birth_month) < 1 || parseInt(formData.birth_month) > 12)) {
      errors.push("Birth month must be between 1 and 12");
    }
    
    if (formData.birth_day && (parseInt(formData.birth_day) < 1 || parseInt(formData.birth_day) > 31)) {
      errors.push("Birth day must be between 1 and 31");
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof RapperFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const rapperData = {
        name: formData.name.trim(),
        real_name: formData.real_name.trim() || null,
        origin: formData.origin.trim() || null,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
        birth_month: formData.birth_month ? parseInt(formData.birth_month) : null,
        birth_day: formData.birth_day ? parseInt(formData.birth_day) : null,
        death_year: formData.death_year ? parseInt(formData.death_year) : null,
        death_month: formData.death_month ? parseInt(formData.death_month) : null,
        death_day: formData.death_day ? parseInt(formData.death_day) : null,
        bio: formData.bio.trim() || null,
        origins_description: formData.origins_description.trim() || null,
        verified: formData.verified,
        spotify_id: formData.spotify_id.trim() || null,
        instagram_handle: formData.instagram_handle.trim() || null,
        twitter_handle: formData.twitter_handle.trim() || null,
        slug,
      };

      let rapperId: string;

      if (rapper) {
        // Update existing rapper
        const { error } = await supabase
          .from("rappers")
          .update(rapperData)
          .eq("id", rapper.id);
        
        if (error) throw error;
        rapperId = rapper.id;
        toast.success("Rapper updated successfully!");
      } else {
        // Create new rapper
        const { data, error } = await supabase
          .from("rappers")
          .insert([rapperData])
          .select("id")
          .single();
        
        if (error) throw error;
        rapperId = data.id;
        toast.success("Rapper created successfully!");
      }

      // Update tag assignments
      if (rapperId) {
        // Delete existing tag assignments
        await supabase
          .from("rapper_tag_assignments")
          .delete()
          .eq("rapper_id", rapperId);

        // Insert new tag assignments
        if (formData.tags.length > 0) {
          const tagAssignments = formData.tags.map(tagId => ({
            rapper_id: rapperId,
            tag_id: tagId,
          }));

          const { error: tagError } = await supabase
            .from("rapper_tag_assignments")
            .insert(tagAssignments);

          if (tagError) throw tagError;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rapper-tag-assignments"] });
      onSuccess();
    } catch (error) {
      console.error("Error saving rapper:", error);
      toast.error("Failed to save rapper");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationErrors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
          <h4 className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-destructive space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-rap-gold">Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            required
          />
        </div>

        <div>
          <Label htmlFor="real_name" className="text-rap-gold">Real Name</Label>
          <Input
            id="real_name"
            type="text"
            value={formData.real_name}
            onChange={(e) => handleInputChange("real_name", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="origin" className="text-rap-gold">Origin</Label>
        <Input
          id="origin"
          type="text"
          value={formData.origin}
          onChange={(e) => handleInputChange("origin", e.target.value)}
          className="bg-white border-rap-gold/30 text-black"
          placeholder="e.g., New York, NY"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="birth_year" className="text-rap-gold">Birth Year</Label>
          <Input
            id="birth_year"
            type="number"
            value={formData.birth_year}
            onChange={(e) => handleInputChange("birth_year", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <Label htmlFor="birth_month" className="text-rap-gold">Birth Month</Label>
          <Input
            id="birth_month"
            type="number"
            value={formData.birth_month}
            onChange={(e) => handleInputChange("birth_month", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1"
            max="12"
          />
        </div>

        <div>
          <Label htmlFor="birth_day" className="text-rap-gold">Birth Day</Label>
          <Input
            id="birth_day"
            type="number"
            value={formData.birth_day}
            onChange={(e) => handleInputChange("birth_day", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1"
            max="31"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="death_year" className="text-rap-gold">Death Year (if applicable)</Label>
          <Input
            id="death_year"
            type="number"
            value={formData.death_year}
            onChange={(e) => handleInputChange("death_year", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <Label htmlFor="death_month" className="text-rap-gold">Death Month</Label>
          <Input
            id="death_month"
            type="number"
            value={formData.death_month}
            onChange={(e) => handleInputChange("death_month", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1"
            max="12"
          />
        </div>

        <div>
          <Label htmlFor="death_day" className="text-rap-gold">Death Day</Label>
          <Input
            id="death_day"
            type="number"
            value={formData.death_day}
            onChange={(e) => handleInputChange("death_day", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            min="1"
            max="31"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bio" className="text-rap-gold">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          className="bg-white border-rap-gold/30 text-black min-h-[100px]"
          placeholder="Enter rapper biography..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="spotify_id" className="text-rap-gold">Spotify ID</Label>
          <Input
            id="spotify_id"
            type="text"
            value={formData.spotify_id}
            onChange={(e) => handleInputChange("spotify_id", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
          />
        </div>

        <div>
          <Label htmlFor="instagram_handle" className="text-rap-gold">Instagram Handle</Label>
          <Input
            id="instagram_handle"
            type="text"
            value={formData.instagram_handle}
            onChange={(e) => handleInputChange("instagram_handle", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            placeholder="@username"
          />
        </div>

        <div>
          <Label htmlFor="twitter_handle" className="text-rap-gold">Twitter Handle</Label>
          <Input
            id="twitter_handle"
            type="text"
            value={formData.twitter_handle}
            onChange={(e) => handleInputChange("twitter_handle", e.target.value)}
            className="bg-white border-rap-gold/30 text-black"
            placeholder="@username"
          />
        </div>
      </div>

      <div>
        <Label className="text-rap-gold">Tags</Label>
        <RapperTagSelector
          selectedTags={formData.tags}
          onTagsChange={(tags) => handleInputChange("tags", tags)}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : rapper ? "Update Rapper" : "Create Rapper"}
        </Button>
      </div>
    </form>
  );
};

export default RapperForm;