import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";
import AdminTabHeader from "./AdminTabHeader";
const SectionHeaderManagement = () => {
  const [editingHeaders, setEditingHeaders] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  // Section name mapping for better display names
  const getSectionDisplayName = (section: string): string => {
    const sectionNames: Record<string, string> = {
      'homepage': 'Home Crowner',
      'top-ranking': 'Top Ranking',
      'rising-legends': 'Rising Legends',
      'lyrical-masters': 'Lyrical Masters',
      'all-rappers': 'All Rappers',
      'rankings': 'Rankings',
      'blog': 'Blog',
      'about': 'About'
    };
    
    return sectionNames[section] || section?.charAt(0).toUpperCase() + section?.slice(1) || 'Unknown Section';
  };
  const {
    data: headers,
    isLoading
  } = useQuery({
    queryKey: ["section-headers"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("section_headers").select("*");
      if (error) throw error;
      return data?.reduce((acc: Record<string, any>, header: any) => {
        acc[header.section] = header;
        return acc;
      }, {});
    }
  });
  const updateHeaderMutation = useMutation({
    mutationFn: async (updates: any) => {
      const {
        section,
        ...rest
      } = updates;
      const {
        data,
        error
      } = await supabase.from("section_headers").upsert({
        section,
        ...rest
      }, {
        onConflict: "section"
      }).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["section-headers"]
      });
      toast.success("Section header updated successfully!");
    },
    onError: error => {
      toast.error("Failed to update section header.");
      console.error("Error updating section header:", error);
    }
  });
  const handleEditChange = (section: string, field: string, value: any) => {
    setEditingHeaders(prev => ({
      ...prev,
      [section]: {
        section, // Ensure section is always included
        ...prev[section],
        [field]: value
      }
    }));
  };
  const handleSave = async (section: string) => {
    if (editingHeaders[section]) {
      await updateHeaderMutation.mutateAsync(editingHeaders[section]);
      setEditingHeaders(prev => {
        const {
          [section]: _,
          ...rest
        } = prev;
        return rest;
      });
    }
  };
  return <div className="space-y-6">
      <AdminTabHeader title="Section Headers" icon={Settings} description="Customize section headers and descriptions across the site" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="text-center py-8 text-[var(--theme-textMuted)]">Loading headers...</div>
        ) : (
          Object.entries(headers || {}).map(([section, header]) => (
            <Card 
              key={section} 
              className="bg-[var(--theme-surface)] border border-[var(--theme-border)]"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[var(--theme-primary)] font-[var(--theme-font-heading)]">
                  {getSectionDisplayName(section)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor={`${section}-title`} 
                    className="text-[var(--theme-text)] font-[var(--theme-font-body)]"
                  >
                    Title
                  </Label>
                  <Input 
                    id={`${section}-title`} 
                    value={editingHeaders[section]?.title ?? header?.title ?? ""} 
                    onChange={(e) => handleEditChange(section, "title", e.target.value)}
                    className="bg-[var(--theme-background)] text-[var(--theme-text)] border-[var(--theme-border)]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label 
                    htmlFor={`${section}-description`} 
                    className="text-[var(--theme-text)] font-[var(--theme-font-body)]"
                  >
                    Description
                  </Label>
                  <Textarea 
                    id={`${section}-description`} 
                    value={editingHeaders[section]?.description ?? header?.description ?? ""} 
                    onChange={(e) => handleEditChange(section, "description", e.target.value)}
                    className="bg-[var(--theme-background)] text-[var(--theme-text)] border-[var(--theme-border)] resize-none" 
                  />
                </div>
                <Button 
                  onClick={() => handleSave(section)} 
                  disabled={!editingHeaders[section]} 
                  className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primary)]/90 font-[var(--theme-font-heading)]"
                >
                  {editingHeaders[section] ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    "No Changes"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>;
};
export default SectionHeaderManagement;