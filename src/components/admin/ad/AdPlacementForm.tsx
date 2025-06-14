
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

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

interface AdPlacementFormProps {
  editingAd: AdPlacement | null;
  formData: {
    page_name: string;
    page_route: string;
    placement_name: string;
    ad_unit_id: string;
    ad_format: string;
    is_active: boolean;
  };
  pageTemplates: PageTemplate[] | undefined;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (updates: Partial<typeof formData>) => void;
  onTemplateChange: (templateId: string) => void;
}

const AdPlacementForm = ({
  editingAd,
  formData,
  pageTemplates,
  isSubmitting,
  onSubmit,
  onCancel,
  onFormDataChange,
  onTemplateChange,
}: AdPlacementFormProps) => {
  const selectedTemplate = pageTemplates?.find(t => 
    t.template_name === formData.page_name || t.route_pattern === formData.page_route
  );

  return (
    <Card className="bg-carbon-fiber border-rap-silver/40">
      <CardHeader>
        <CardTitle className="text-rap-silver font-mogra">
          {editingAd ? 'Edit Ad Placement' : 'Create New Ad Placement'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {pageTemplates && pageTemplates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template" className="text-rap-platinum font-kaushan">
                Use Page Template (Optional)
              </Label>
              <Select onValueChange={onTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a page template to auto-fill" />
                </SelectTrigger>
                <SelectContent>
                  {pageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name} - {template.route_pattern}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_name" className="text-rap-platinum font-kaushan">
                Page Name *
              </Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => onFormDataChange({ page_name: e.target.value })}
                placeholder="e.g., Home Page"
                required
                className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page_route" className="text-rap-platinum font-kaushan">
                Page Route *
              </Label>
              <Input
                id="page_route"
                value={formData.page_route}
                onChange={(e) => onFormDataChange({ page_route: e.target.value })}
                placeholder="e.g., /"
                required
                className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement_name" className="text-rap-platinum font-kaushan">
              Placement Name *
            </Label>
            <Select value={formData.placement_name} onValueChange={(value) => onFormDataChange({ placement_name: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select placement location" />
              </SelectTrigger>
              <SelectContent>
                {selectedTemplate?.available_placements.map((placement) => (
                  <SelectItem key={placement} value={placement}>
                    {placement}
                  </SelectItem>
                )) || (
                  <>
                    <SelectItem value="hero-bottom">After Hero Section</SelectItem>
                    <SelectItem value="between-sections">Between Sections</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad_unit_id" className="text-rap-platinum font-kaushan">
                Ad Unit ID *
              </Label>
              <Input
                id="ad_unit_id"
                value={formData.ad_unit_id}
                onChange={(e) => onFormDataChange({ ad_unit_id: e.target.value })}
                placeholder="ca-pub-xxxxxxxxxx/xxxxxxxxxx"
                required
                className="bg-rap-carbon/50 border-rap-silver/30 text-rap-platinum"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad_format" className="text-rap-platinum font-kaushan">
                Ad Format
              </Label>
              <Select value={formData.ad_format} onValueChange={(value) => onFormDataChange({ ad_format: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="leaderboard">Leaderboard</SelectItem>
                  <SelectItem value="skyscraper">Skyscraper</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => onFormDataChange({ is_active: checked })}
            />
            <Label htmlFor="is_active" className="text-rap-platinum font-kaushan">
              Active
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
            >
              {isSubmitting ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-rap-silver/30 text-rap-silver hover:bg-rap-silver/10 font-kaushan"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdPlacementForm;
