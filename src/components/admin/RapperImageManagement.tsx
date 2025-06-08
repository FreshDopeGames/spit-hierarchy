
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Check, X, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Rapper = Tables<"rappers">;

const RapperImageManagement = () => {
  const [uploadingRappers, setUploadingRappers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: rappers, isLoading } = useQuery({
    queryKey: ["admin-rappers-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const updateRapperImageMutation = useMutation({
    mutationFn: async ({ rapperId, imageUrl }: { rapperId: string; imageUrl: string }) => {
      const { error } = await supabase
        .from("rappers")
        .update({ image_url: imageUrl })
        .eq("id", rapperId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rappers-images"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["top-rappers"] });
    }
  });

  const handleImageUpload = async (rapper: Rapper, file: File) => {
    try {
      setUploadingRappers(prev => new Set(prev).add(rapper.id));

      // Create a file name with rapper's name (sanitized)
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileExt = file.name.split('.').pop();
      const fileName = `${sanitizedName}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rapper-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('rapper-images')
        .getPublicUrl(uploadData.path);

      // Update rapper with new image URL
      await updateRapperImageMutation.mutateAsync({
        rapperId: rapper.id,
        imageUrl: publicUrl
      });

      toast({
        title: "Success",
        description: `Image uploaded for ${rapper.name}`,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingRappers(prev => {
        const newSet = new Set(prev);
        newSet.delete(rapper.id);
        return newSet;
      });
    }
  };

  const handleFileSelect = (rapper: Rapper, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    handleImageUpload(rapper, file);
  };

  const rappersWithImages = rappers?.filter(r => r.image_url) || [];
  const rappersWithoutImages = rappers?.filter(r => !r.image_url) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-rap-carbon-light rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-rap-carbon-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-carbon-fiber border-rap-gold/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rap-gold">{rappers?.length || 0}</div>
            <div className="text-sm text-rap-platinum">Total Rappers</div>
          </CardContent>
        </Card>
        <Card className="bg-carbon-fiber border-rap-forest/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rap-forest">{rappersWithImages.length}</div>
            <div className="text-sm text-rap-platinum">With Images</div>
          </CardContent>
        </Card>
        <Card className="bg-carbon-fiber border-rap-burgundy/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rap-burgundy">{rappersWithoutImages.length}</div>
            <div className="text-sm text-rap-platinum">Need Images</div>
          </CardContent>
        </Card>
      </div>

      {/* Rappers Without Images - Priority Section */}
      {rappersWithoutImages.length > 0 && (
        <Card className="bg-carbon-fiber border-rap-burgundy/30">
          <CardHeader>
            <CardTitle className="text-rap-burgundy font-mogra">
              Rappers Needing Images ({rappersWithoutImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rappersWithoutImages.map((rapper) => (
                <RapperImageCard
                  key={rapper.id}
                  rapper={rapper}
                  isUploading={uploadingRappers.has(rapper.id)}
                  onFileSelect={(file) => handleFileSelect(rapper, file)}
                  hasImage={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rappers With Images */}
      {rappersWithImages.length > 0 && (
        <Card className="bg-carbon-fiber border-rap-forest/30">
          <CardHeader>
            <CardTitle className="text-rap-forest font-mogra">
              Rappers With Images ({rappersWithImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rappersWithImages.map((rapper) => (
                <RapperImageCard
                  key={rapper.id}
                  rapper={rapper}
                  isUploading={uploadingRappers.has(rapper.id)}
                  onFileSelect={(file) => handleFileSelect(rapper, file)}
                  hasImage={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface RapperImageCardProps {
  rapper: Rapper;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  hasImage: boolean;
}

const RapperImageCard = ({ rapper, isUploading, onFileSelect, hasImage }: RapperImageCardProps) => {
  return (
    <Card className={`bg-carbon-fiber transition-all duration-300 ${
      hasImage 
        ? 'border-rap-forest/40 hover:border-rap-forest/70' 
        : 'border-rap-burgundy/40 hover:border-rap-burgundy/70'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center">
            {rapper.image_url ? (
              <img 
                src={rapper.image_url} 
                alt={rapper.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-12 h-12 text-rap-platinum/50" />
            )}
          </div>

          {/* Rapper Info */}
          <div className="space-y-1">
            <h4 className="font-mogra text-rap-platinum text-sm leading-tight">
              {rapper.name}
            </h4>
            {rapper.real_name && (
              <p className="text-rap-smoke text-xs font-kaushan">
                {rapper.real_name}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={`text-xs font-kaushan ${
                hasImage 
                  ? 'bg-rap-forest/20 text-rap-forest border-rap-forest/30' 
                  : 'bg-rap-burgundy/20 text-rap-burgundy border-rap-burgundy/30'
              }`}
            >
              {hasImage ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Has Image
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  No Image
                </>
              )}
            </Badge>
          </div>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={onFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button
              className={`w-full ${
                hasImage 
                  ? 'bg-rap-forest/20 hover:bg-rap-forest/30 text-rap-forest border-rap-forest/30' 
                  : 'bg-rap-burgundy hover:bg-rap-burgundy-light text-rap-platinum'
              } font-kaushan`}
              variant={hasImage ? "outline" : "default"}
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {hasImage ? 'Replace Image' : 'Upload Image'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RapperImageManagement;
