
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { RankingFormData } from "./rankingFormSchema";

interface RankingFormFieldsProps {
  form: UseFormReturn<RankingFormData>;
}

const RankingFormFields = ({ form }: RankingFormFieldsProps) => {
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
            <FormControl>
              <Input 
                placeholder="Enter category" 
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
    </>
  );
};

export default RankingFormFields;
