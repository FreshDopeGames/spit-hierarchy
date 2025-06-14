import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdPlacement {
  id: string;
  page_name: string;
  page_route: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: string;
  is_active: boolean;
}

interface PageTemplate {
  id: string;
  template_name: string;
  route_pattern: string;
  available_placements: string[];
}

const AdManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    page_name: '',
    page_route: '',
    placement_name: '',
    ad_unit_id: '',
    ad_format: 'banner',
    is_active: true
  });

  // Fetch existing ad placements
  const { data: adPlacements, isLoading: loadingAds } = useQuery({
    queryKey: ['ad-placements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .order('page_name', { ascending: true });
      if (error) throw error;
      return data as AdPlacement[];
    }
  });

  // Fetch page templates
  const { data: pageTemplates } = useQuery({
    queryKey: ['page-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .order('template_name', { ascending: true });
      if (error) throw error;
      return data as PageTemplate[];
    }
  });

  // Create or update ad placement
  const createAdMutation = useMutation({
    mutationFn: async (adData: typeof formData & { id?: string }) => {
      if (adData.id) {
        const { data, error } = await supabase
          .from('ad_placements')
          .update(adData)
          .eq('id', adData.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('ad_placements')
          .insert([adData])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-placements'] });
      toast({
        title: editingAd ? "Ad Updated" : "Ad Created",
        description: editingAd ? "Ad placement has been updated successfully." : "New ad placement has been created successfully."
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingAd ? 'update' : 'create'} ad placement: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Delete ad placement
  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_placements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-placements'] });
      toast({
        title: "Ad Deleted",
        description: "Ad placement has been deleted successfully."
      });
    }
  });

  const resetForm = () => {
    setFormData({
      page_name: '',
      page_route: '',
      placement_name: '',
      ad_unit_id: '',
      ad_format: 'banner',
      is_active: true
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const handleEdit = (ad: AdPlacement) => {
    setEditingAd(ad);
    setFormData({
      page_name: ad.page_name,
      page_route: ad.page_route,
      placement_name: ad.placement_name,
      ad_unit_id: ad.ad_unit_id,
      ad_format: ad.ad_format,
      is_active: ad.is_active
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = editingAd ? { ...formData, id: editingAd.id } : formData;
    createAdMutation.mutate(submitData);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = pageTemplates?.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        page_name: template.template_name,
        page_route: template.route_pattern,
        placement_name: ''
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-rap-platinum font-mogra">Ad Management</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Ad Placement
        </Button>
      </div>

      {/* Ad Creation/Edit Form */}
      {showForm && (
        <Card className="bg-carbon-fiber border-rap-gold/40">
          <CardHeader>
            <CardTitle className="text-rap-gold font-mogra">
              {editingAd ? 'Edit Ad Placement' : 'Create New Ad Placement'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template" className="text-rap-platinum font-merienda">
                    Page Template
                  </Label>
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
                      <SelectValue placeholder="Select a page template" />
                    </SelectTrigger>
                    <SelectContent>
                      {pageTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name} ({template.route_pattern})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="placement_name" className="text-rap-platinum font-merienda">
                    Placement Position
                  </Label>
                  <Select 
                    value={formData.placement_name} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, placement_name: value }))}
                  >
                    <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
                      <SelectValue placeholder="Select placement position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="grid-top">Grid Top</SelectItem>
                      <SelectItem value="grid-middle">Grid Middle</SelectItem>
                      <SelectItem value="grid-bottom">Grid Bottom</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="between-sections">Between Sections</SelectItem>
                      <SelectItem value="content-bottom">Content Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ad_unit_id" className="text-rap-platinum font-merienda">
                    Ad Unit ID
                  </Label>
                  <Input
                    id="ad_unit_id"
                    value={formData.ad_unit_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, ad_unit_id: e.target.value }))}
                    placeholder="ca-pub-1234567890/1234567890"
                    className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ad_format" className="text-rap-platinum font-merienda">
                    Ad Format
                  </Label>
                  <Select 
                    value={formData.ad_format} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ad_format: value }))}
                  >
                    <SelectTrigger className="bg-rap-carbon border-rap-gold/30 text-rap-platinum">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="native">Native</SelectItem>
                      <SelectItem value="responsive">Responsive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="text-rap-platinum font-merienda">
                  Active
                </Label>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createAdMutation.isPending}
                  className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
                >
                  {createAdMutation.isPending ? 'Saving...' : (editingAd ? 'Update' : 'Create')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-rap-silver/30 text-rap-silver hover:bg-rap-silver/20"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Ad Placements */}
      <Card className="bg-carbon-fiber border-rap-silver/40">
        <CardHeader>
          <CardTitle className="text-rap-silver font-mogra">Current Ad Placements</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAds ? (
            <div className="text-rap-platinum">Loading...</div>
          ) : adPlacements && adPlacements.length > 0 ? (
            <div className="space-y-4">
              {adPlacements.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-4 bg-rap-carbon/30 rounded-lg">
                  <div className="space-y-1">
                    <h3 className="text-rap-platinum font-semibold font-mogra">{ad.page_name}</h3>
                    <p className="text-rap-smoke text-sm font-merienda">
                      {ad.page_route} • {ad.placement_name} • {ad.ad_format}
                    </p>
                    <p className="text-rap-silver text-sm font-kaushan">
                      Ad Unit: {ad.ad_unit_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(ad)}
                      className="text-rap-gold hover:text-rap-gold-light"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAdMutation.mutate(ad.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-rap-smoke font-merienda">No ad placements configured yet.</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-4 bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
              >
                Create Your First Ad Placement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdManagement;
