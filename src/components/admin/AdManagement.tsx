
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdManagementHeader from './ad/AdManagementHeader';
import AdPlacementForm from './ad/AdPlacementForm';
import AdPlacementList from './ad/AdPlacementList';

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

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <AdManagementHeader onAddClick={() => setShowForm(true)} />

      {showForm && (
        <AdPlacementForm
          editingAd={editingAd}
          formData={formData}
          pageTemplates={pageTemplates}
          isSubmitting={createAdMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onFormDataChange={handleFormDataChange}
          onTemplateChange={handleTemplateChange}
        />
      )}

      <AdPlacementList
        adPlacements={adPlacements}
        isLoading={loadingAds}
        onEdit={handleEdit}
        onDelete={(id) => deleteAdMutation.mutate(id)}
        onShowForm={() => setShowForm(true)}
      />
    </div>
  );
};

export default AdManagement;
