
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { sanitizeAdminInput, sanitizeAdminContent, sanitizeInput, validateTextInput } from "@/utils/securityUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Rapper = Tables<"rappers">;

interface RapperFormProps {
  rapper?: Rapper;
  onSuccess: () => void;
  onCancel: () => void;
}

const RapperForm = ({ rapper, onSuccess, onCancel }: RapperFormProps) => {
  const [formData, setFormData] = useState({
    name: rapper?.name || "",
    real_name: rapper?.real_name || "",
    origin: rapper?.origin || "",
    bio: rapper?.bio || "",
    birth_year: rapper?.birth_year?.toString() || "",
    birth_month: rapper?.birth_month?.toString() || "",
    birth_day: rapper?.birth_day?.toString() || "",
    twitter_handle: rapper?.twitter_handle || "",
    instagram_handle: rapper?.instagram_handle || "",
    spotify_id: rapper?.spotify_id || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = () => {
    const errors: string[] = [];
    
    // Validate required fields using admin-sanitized values
    const nameValidation = validateTextInput(sanitizeAdminInput(formData.name), 2, 100);
    if (!nameValidation.isValid) {
      errors.push(`Name: ${nameValidation.errors.join(', ')}`);
    }
    
    // Validate optional fields if provided
    if (formData.real_name) {
      const realNameValidation = validateTextInput(sanitizeAdminInput(formData.real_name), 2, 100);
      if (!realNameValidation.isValid) {
        errors.push(`Real Name: ${realNameValidation.errors.join(', ')}`);
      }
    }
    
    if (formData.origin) {
      const originValidation = validateTextInput(sanitizeAdminInput(formData.origin), 2, 100);
      if (!originValidation.isValid) {
        errors.push(`Origin: ${originValidation.errors.join(', ')}`);
      }
    }
    
    if (formData.bio) {
      const bioValidation = validateTextInput(sanitizeAdminContent(formData.bio), 10, 2000);
      if (!bioValidation.isValid) {
        errors.push(`Bio: ${bioValidation.errors.join(', ')}`);
      }
    }
    
    // Validate year
    if (formData.birth_year) {
      const year = parseInt(formData.birth_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        errors.push('Birth year must be between 1900 and current year');
      }
    }
    
    // Validate month
    if (formData.birth_month) {
      const month = parseInt(formData.birth_month);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.push('Birth month must be between 1 and 12');
      }
    }
    
    // Validate day
    if (formData.birth_day) {
      const day = parseInt(formData.birth_day);
      if (isNaN(day) || day < 1 || day > 31) {
        errors.push('Birth day must be between 1 and 31');
      }
    }
    
    // Validate social handles (no @ symbol, alphanumeric and underscores only)
    if (formData.twitter_handle) {
      const cleanHandle = formData.twitter_handle.replace('@', '');
      if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
        errors.push('Twitter handle must be 1-15 characters, letters, numbers, and underscores only');
      }
    }
    
    if (formData.instagram_handle) {
      const cleanHandle = formData.instagram_handle.replace('@', '');
      if (!/^[a-zA-Z0-9_.]{1,30}$/.test(cleanHandle)) {
        errors.push('Instagram handle must be 1-30 characters, letters, numbers, underscores, and periods only');
      }
    }
    
    return errors;
  };

  const handleInputChange = (field: string, value: string) => {
    // Use appropriate sanitization based on field type
    let sanitizedValue: string;
    
    if (field === 'bio') {
      // Most permissive for bio content
      sanitizedValue = sanitizeAdminContent(value);
    } else if (field === 'name' || field === 'real_name' || field === 'origin') {
      // Permissive for content fields but not as much as bio
      sanitizedValue = sanitizeAdminInput(value);
    } else if (field === 'spotify_id' || field === 'twitter_handle' || field === 'instagram_handle') {
      // Strict for technical fields
      sanitizedValue = sanitizeInput(value);
    } else {
      // Default to admin input sanitization
      sanitizedValue = sanitizeAdminInput(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setValidationErrors([]);

    try {
      const rapperData = {
        name: sanitizeAdminInput(formData.name).trim(),
        real_name: sanitizeAdminInput(formData.real_name).trim() || null,
        origin: sanitizeAdminInput(formData.origin).trim() || null,
        bio: sanitizeAdminContent(formData.bio).trim() || null,
        birth_year: formData.birth_year ? parseInt(formData.birth_year) : null,
        birth_month: formData.birth_month ? parseInt(formData.birth_month) : null,
        birth_day: formData.birth_day ? parseInt(formData.birth_day) : null,
        twitter_handle: formData.twitter_handle?.replace('@', '').trim() || null,
        instagram_handle: formData.instagram_handle?.replace('@', '').trim() || null,
        spotify_id: sanitizeInput(formData.spotify_id).trim() || null,
        updated_at: new Date().toISOString()
      };

      if (rapper) {
        // Update existing rapper
        const { error } = await supabase
          .from("rappers")
          .update(rapperData)
          .eq("id", rapper.id);

        if (error) throw error;
        toast.success("Rapper updated successfully");
      } else {
        // Create new rapper
        const { error } = await supabase
          .from("rappers")
          .insert([rapperData]);

        if (error) throw error;
        toast.success("Rapper created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving rapper:", error);
      toast.error(error.message || "Failed to save rapper");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationErrors.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Stage Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Jay-Z, Eminem"
            required
            maxLength={100}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="real_name" className="text-white">Real Name</Label>
          <Input
            id="real_name"
            type="text"
            value={formData.real_name}
            onChange={(e) => handleInputChange('real_name', e.target.value)}
            placeholder="e.g., Shawn Carter, Marshall Mathers"
            maxLength={100}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="origin" className="text-white">Origin</Label>
        <Input
          id="origin"
          type="text"
          value={formData.origin}
          onChange={(e) => handleInputChange('origin', e.target.value)}
          placeholder="e.g., Brooklyn, New York"
          maxLength={100}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-white">Biography</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Brief biography of the rapper..."
          maxLength={2000}
          className="w-full min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birth_year" className="text-white">Birth Year</Label>
          <Input
            id="birth_year"
            type="number"
            value={formData.birth_year}
            onChange={(e) => handleInputChange('birth_year', e.target.value)}
            placeholder="1969"
            min={1900}
            max={new Date().getFullYear()}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_month" className="text-white">Birth Month</Label>
          <Input
            id="birth_month"
            type="number"
            value={formData.birth_month}
            onChange={(e) => handleInputChange('birth_month', e.target.value)}
            placeholder="12"
            min={1}
            max={12}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_day" className="text-white">Birth Day</Label>
          <Input
            id="birth_day"
            type="number"
            value={formData.birth_day}
            onChange={(e) => handleInputChange('birth_day', e.target.value)}
            placeholder="4"
            min={1}
            max={31}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="twitter_handle" className="text-white">Twitter Handle</Label>
          <Input
            id="twitter_handle"
            type="text"
            value={formData.twitter_handle}
            onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
            placeholder="username (without @)"
            maxLength={15}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram_handle" className="text-white">Instagram Handle</Label>
          <Input
            id="instagram_handle"
            type="text"
            value={formData.instagram_handle}
            onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
            placeholder="username (without @)"
            maxLength={30}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="spotify_id" className="text-white">Spotify Artist ID</Label>
        <Input
          id="spotify_id"
          type="text"
          value={formData.spotify_id}
          onChange={(e) => handleInputChange('spotify_id', e.target.value)}
          placeholder="Spotify artist ID"
          maxLength={100}
          className="w-full"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || validationErrors.length > 0}
          className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon"
        >
          {loading ? "Saving..." : rapper ? "Update Rapper" : "Create Rapper"}
        </Button>
      </div>
    </form>
  );
};

export default RapperForm;
