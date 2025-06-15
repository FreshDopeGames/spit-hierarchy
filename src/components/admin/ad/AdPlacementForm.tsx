
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { PageTemplate } from "./types";

const adPlacementSchema = z.object({
  placement_name: z.string().min(1, "Placement name is required"),
  ad_unit_id: z.string().min(1, "Ad unit ID is required"),
  ad_format: z.enum(["banner", "leaderboard", "rectangle", "mobile-banner"]),
  page_name: z.string().min(1, "Page name is required"),
  page_route: z.string().min(1, "Page route is required"),
  is_active: z.boolean()
});

type AdPlacementFormData = z.infer<typeof adPlacementSchema>;

interface AdPlacementFormProps {
  onSubmit: (data: AdPlacementFormData) => void;
  initialData?: Partial<AdPlacementFormData>;
  isLoading?: boolean;
  pageTemplates: PageTemplate[];
}

const AdPlacementForm = ({
  onSubmit,
  initialData,
  isLoading,
  pageTemplates
}: AdPlacementFormProps) => {
  const form = useForm<AdPlacementFormData>({
    resolver: zodResolver(adPlacementSchema),
    defaultValues: {
      placement_name: initialData?.placement_name || "",
      ad_unit_id: initialData?.ad_unit_id || "",
      ad_format: initialData?.ad_format || "banner",
      page_name: initialData?.page_name || "",
      page_route: initialData?.page_route || "",
      is_active: initialData?.is_active ?? true
    }
  });

  const handleSubmit = (data: AdPlacementFormData) => {
    console.log("Submitting ad placement data:", data);
    onSubmit(data);
  };

  const handlePageTemplateChange = (templateName: string) => {
    const selectedTemplate = pageTemplates.find(t => t.template_name === templateName);
    if (selectedTemplate) {
      form.setValue("page_name", selectedTemplate.template_name);
      form.setValue("page_route", selectedTemplate.route_pattern);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="placement_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placement Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter placement name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ad_unit_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Unit ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter ad unit ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ad_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ad format" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-rap-gold">
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="leaderboard">Leaderboard</SelectItem>
                  <SelectItem value="rectangle">Rectangle</SelectItem>
                  <SelectItem value="mobile-banner">Mobile Banner</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="page_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Template</FormLabel>
              <Select onValueChange={handlePageTemplateChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-rap-gold">
                  {pageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.template_name}>
                      {template.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="page_route"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Page Route</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Page route will be auto-populated" 
                  {...field} 
                  readOnly
                  className="bg-gray-100 dark:bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable this ad placement
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Submitting..." : "Save Ad Placement"}
        </Button>
      </form>
    </Form>
  );
};

export default AdPlacementForm;
