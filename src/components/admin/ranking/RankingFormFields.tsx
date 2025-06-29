
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RankingFormData } from "./rankingFormSchema";
import RankingTagSelector from "../RankingTagSelector";

interface RankingFormFieldsProps {
  form: UseFormReturn<RankingFormData>;
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const categoryOptions = [
  { value: "skills", label: "Skills" },
  { value: "legacy", label: "Legacy" },
  { value: "all time", label: "All Time" },
  { value: "trends", label: "Trends" }
];

const RankingFormFields = ({ form, selectedTags, onTagsChange }: RankingFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mogra text-rap-platinum">Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter ranking title" 
                {...field} 
                className="bg-gray-100 border-rap-gold/30 text-rap-carbon"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mogra text-rap-platinum">Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter ranking description" 
                {...field} 
                className="bg-gray-100 border-rap-gold/30 text-rap-carbon"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mogra text-rap-platinum">Category</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-gray-100 border-rap-gold/30 text-rap-carbon">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mogra text-rap-platinum">Slug</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter URL slug" 
                {...field} 
                className="bg-gray-100 border-rap-gold/30 text-rap-carbon"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="display_order"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-mogra text-rap-platinum">Display Order</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                placeholder="Enter display order (0 = first)" 
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                value={field.value || 0}
                className="bg-gray-100 border-rap-gold/30 text-rap-carbon"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormItem>
        <FormLabel className="font-mogra text-rap-platinum">Tags</FormLabel>
        <RankingTagSelector 
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
        />
      </FormItem>
    </>
  );
};

export default RankingFormFields;
