import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Globe, Instagram } from "lucide-react";

interface SocialMediaAutofillProps {
  rapperId: string;
  rapperName: string;
  musicbrainzId?: string;
  onUpdate?: () => void;
}

const SocialMediaAutofill = ({ rapperId, rapperName, musicbrainzId, onUpdate }: SocialMediaAutofillProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchSocialMedia = async () => {
    if (!musicbrainzId) {
      toast.error("No MusicBrainz ID set for this rapper");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-rapper-discography', {
        body: { rapperId, forceRefresh: true }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Successfully updated social media handles for ${rapperName}`);
        onUpdate?.();
      } else {
        throw new Error(data?.error || 'Failed to fetch discography');
      }
    } catch (error: any) {
      console.error('Error fetching social media:', error);
      toast.error(error.message || "Failed to fetch social media handles");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={fetchSocialMedia}
      disabled={isLoading || !musicbrainzId}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Instagram className="w-4 h-4" />
          <Globe className="w-4 h-4" />
        </>
      )}
      {isLoading ? "Fetching..." : "Auto-fill Social Media"}
    </Button>
  );
};

export default SocialMediaAutofill;