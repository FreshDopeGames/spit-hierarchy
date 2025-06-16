
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  slug: z.string().min(1, "Slug is required")
});

type OfficialRanking = Tables<"official_rankings">;

interface AdminRankingDialogProps {
  onRankingCreated: () => void;
  ranking?: OfficialRanking;
}

const AdminRankingDialog = ({
  onRankingCreated,
  ranking
}: AdminRankingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: ranking?.title || "",
      description: ranking?.description || "",
      category: ranking?.category || "",
      slug: ranking?.slug || ""
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (ranking) {
        // Update existing ranking - ensure all required fields are present
        const updateData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug
        };
        const { error } = await supabase
          .from("official_rankings")
          .update(updateData)
          .eq("id", ranking.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ranking updated successfully"
        });
      } else {
        // Create new ranking - ensure all required fields are present
        const insertData = {
          title: values.title,
          description: values.description || "",
          category: values.category,
          slug: values.slug
        };
        const { data: newRanking, error } = await supabase
          .from("official_rankings")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Automatically populate the new ranking with all rappers
        if (newRanking) {
          const { error: populateError } = await supabase.rpc("populate_ranking_with_all_rappers", {
            ranking_uuid: newRanking.id
          });

          if (populateError) {
            console.error("Error populating ranking with rappers:", populateError);
            toast({
              title: "Warning",
              description: "Ranking created but failed to populate with rappers. You can add them manually.",
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Success",
          description: "Ranking created successfully and populated with all rappers"
        });
      }

      setOpen(false);
      form.reset();
      onRankingCreated();
    } catch (error) {
      console.error("Error saving ranking:", error);
      toast({
        title: "Error",
        description: "Failed to save ranking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {ranking ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button className="bg-rap-gold text-rap-carbon">
            <Plus className="w-4 h-4 mr-2" />
            Add Ranking
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-carbon-fiber border-rap-gold/20 text-rap-platinum sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mogra text-rap-gold">
            {ranking ? "Edit Ranking" : "Create New Ranking"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                      className="bg-rap-charcoal border-rap-gold/30"
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
                      className="bg-rap-charcoal border-rap-gold/30"
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
                      className="bg-rap-charcoal border-rap-gold/30"
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
                      className="bg-rap-charcoal border-rap-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-charcoal"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {ranking ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRankingDialog;
