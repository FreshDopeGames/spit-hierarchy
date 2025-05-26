
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Rapper = Tables<"rappers">;

interface AdminRapperDialogProps {
  rapper: Rapper | null;
  isOpen: boolean;
  onClose: () => void;
}

interface RapperFormData {
  name: string;
  real_name: string;
  origin: string;
  birth_year: string;
  bio: string;
  verified: boolean;
  spotify_id: string;
  instagram_handle: string;
  twitter_handle: string;
}

const AdminRapperDialog = ({ rapper, isOpen, onClose }: AdminRapperDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RapperFormData>({
    name: "",
    real_name: "",
    origin: "",
    birth_year: "",
    bio: "",
    verified: false,
    spotify_id: "",
    instagram_handle: "",
    twitter_handle: "",
  });

  useEffect(() => {
    if (rapper) {
      setFormData({
        name: rapper.name || "",
        real_name: rapper.real_name || "",
        origin: rapper.origin || "",
        birth_year: rapper.birth_year?.toString() || "",
        bio: rapper.bio || "",
        verified: rapper.verified || false,
        spotify_id: rapper.spotify_id || "",
        instagram_handle: rapper.instagram_handle || "",
        twitter_handle: rapper.twitter_handle || "",
      });
    } else {
      setFormData({
        name: "",
        real_name: "",
        origin: "",
        birth_year: "",
        bio: "",
        verified: false,
        spotify_id: "",
        instagram_handle: "",
        twitter_handle: "",
      });
    }
  }, [rapper]);

  const saveRapperMutation = useMutation({
    mutationFn: async (data: RapperFormData) => {
      const rapperData = {
        name: data.name,
        real_name: data.real_name || null,
        origin: data.origin || null,
        birth_year: data.birth_year ? parseInt(data.birth_year) : null,
        bio: data.bio || null,
        verified: data.verified,
        spotify_id: data.spotify_id || null,
        instagram_handle: data.instagram_handle || null,
        twitter_handle: data.twitter_handle || null,
      };

      if (rapper) {
        const { error } = await supabase
          .from("rappers")
          .update(rapperData)
          .eq("id", rapper.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("rappers")
          .insert([rapperData]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["top-rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      toast({
        title: "Success",
        description: `Rapper ${rapper ? "updated" : "created"} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${rapper ? "update" : "create"} rapper`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Rapper name is required",
        variant: "destructive",
      });
      return;
    }
    saveRapperMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof RapperFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-purple-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {rapper ? "Edit Rapper" : "Add New Rapper"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                placeholder="Enter rapper name"
                className="bg-slate-800 border-purple-500/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="real_name">Real Name</Label>
              <Input
                id="real_name"
                value={formData.real_name}
                onChange={handleInputChange("real_name")}
                placeholder="Enter real name"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={handleInputChange("origin")}
                placeholder="Enter origin/location"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_year">Birth Year</Label>
              <Input
                id="birth_year"
                type="number"
                value={formData.birth_year}
                onChange={handleInputChange("birth_year")}
                placeholder="Enter birth year"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotify_id">Spotify ID</Label>
              <Input
                id="spotify_id"
                value={formData.spotify_id}
                onChange={handleInputChange("spotify_id")}
                placeholder="Enter Spotify ID"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleInputChange("instagram_handle")}
                placeholder="Enter Instagram handle"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="twitter_handle">Twitter Handle</Label>
              <Input
                id="twitter_handle"
                value={formData.twitter_handle}
                onChange={handleInputChange("twitter_handle")}
                placeholder="Enter Twitter handle"
                className="bg-slate-800 border-purple-500/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleInputChange("bio")}
              placeholder="Enter rapper bio"
              className="bg-slate-800 border-purple-500/30"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="verified"
              checked={formData.verified}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, verified: checked }))
              }
            />
            <Label htmlFor="verified">Verified Artist</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveRapperMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {saveRapperMutation.isPending ? "Saving..." : (rapper ? "Update" : "Create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRapperDialog;
