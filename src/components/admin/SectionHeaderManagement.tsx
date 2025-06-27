
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, Save, X } from 'lucide-react';

interface SectionHeader {
  id: string;
  section_name: string;
  title: string;
  subtitle: string | null;
  background_image_url: string | null;
  is_active: boolean;
}

const SectionHeaderManagement = () => {
  const queryClient = useQueryClient();
  const [editingHeader, setEditingHeader] = useState<SectionHeader | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    background_image_url: '',
    is_active: true
  });

  // Fetch section headers
  const { data: headers, isLoading } = useQuery({
    queryKey: ['section-headers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_headers')
        .select('*')
        .order('section_name', { ascending: true });
      if (error) throw error;
      return data as SectionHeader[];
    }
  });

  // Update section header
  const updateHeaderMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SectionHeader> }) => {
      const { data, error } = await supabase
        .from('section_headers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-headers'] });
      queryClient.invalidateQueries({ queryKey: ['section-header'] });
      toast.success("Section header has been updated successfully.");
      setEditingHeader(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update header: ${error.message}`);
    }
  });

  const handleEdit = (header: SectionHeader) => {
    setEditingHeader(header);
    setFormData({
      title: header.title,
      subtitle: header.subtitle || '',
      background_image_url: header.background_image_url || '',
      is_active: header.is_active
    });
  };

  const handleSave = () => {
    if (!editingHeader) return;
    
    updateHeaderMutation.mutate({
      id: editingHeader.id,
      updates: formData
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `headers/${fileName}`;

      const { data, error } = await supabase.storage
        .from('header-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('header-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, background_image_url: publicUrl }));
      
      toast.success("Background image has been uploaded successfully.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-rap-platinum font-mogra">Section Header Management</h2>
        <div className="text-rap-smoke">Loading headers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-rap-platinum font-mogra">Section Header Management</h2>
      
      <div className="grid gap-6">
        {headers?.map((header) => (
          <Card key={header.id} className="bg-carbon-fiber border-rap-silver/40">
            <CardHeader>
              <CardTitle className="text-rap-silver font-mogra capitalize">
                {header.section_name} Section Header
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingHeader?.id === header.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-rap-platinum font-kaushan">Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-rap-platinum font-kaushan">Subtitle</Label>
                    <Textarea
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-rap-platinum font-kaushan">Background Image</Label>
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        className="border-rap-gold text-rap-gold hover:bg-rap-gold/20"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.background_image_url && (
                      <div className="mt-2">
                        <img
                          src={formData.background_image_url}
                          alt="Background preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label className="text-rap-platinum font-kaushan">Active</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={updateHeaderMutation.isPending}
                      className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingHeader(null)}
                      className="border-rap-silver/30 text-rap-silver hover:bg-rap-silver/10"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-rap-platinum font-mogra text-lg">{header.title}</h3>
                    {header.subtitle && (
                      <p className="text-rap-smoke font-merienda mt-2">{header.subtitle}</p>
                    )}
                  </div>
                  
                  {header.background_image_url && (
                    <div className="flex items-center gap-2 text-rap-silver text-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span>Background image configured</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      header.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {header.is_active ? 'Active' : 'Inactive'}
                    </span>
                    
                    <Button
                      onClick={() => handleEdit(header)}
                      variant="outline"
                      size="sm"
                      className="border-rap-gold text-rap-gold hover:bg-rap-gold/20"
                    >
                      Edit Header
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionHeaderManagement;
