
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
  onTemplateChange
}: AdPlacementFormProps) => {
  return (
    <Card className="bg-carbon-fiber border-rap-gold/40">
      <CardHeader>
        <CardTitle className="text-rap-gold font-mogra">
          {editingAd ? 'Edit Ad Placement' : 'Create New Ad Placement'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template" className="text-rap-platinum font-merienda">
                Page Template
              </Label>
              <Select onValueChange={onTemplateChange}>
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
                onValueChange={(value) => onFormDataChange({ placement_name: value })}
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
                onChange={(e) => onFormDataChange({ ad_unit_id: e.target.value })}
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
                onValueChange={(value) => onFormDataChange({ ad_format: value })}
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
              onCheckedChange={(checked) => onFormDataChange({ is_active: checked })}
            />
            <Label htmlFor="is_active" className="text-rap-platinum font-merienda">
              Active
            </Label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
            >
              {isSubmitting ? 'Saving...' : (editingAd ? 'Update' : 'Create')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-rap-silver/30 text-rap-silver hover:bg-rap-silver/20"
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
