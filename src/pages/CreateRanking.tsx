
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateUserRanking } from "@/hooks/useUserRankings";
import { useNavigate } from "react-router-dom";
import InternalPageHeader from "@/components/InternalPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  isPublic: z.boolean().default(true),
});

const CreateRanking = () => {
  const navigate = useNavigate();
  const { mutate: createRanking, isPending } = useCreateUserRanking();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      isPublic: true,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createRanking(values, {
      onSuccess: () => {
        // The toast notification is handled in the hook
        navigate("/rankings");
      },
      onError: (error) => {
        // The toast notification is handled in the hook
        console.error("Failed to create ranking:", error);
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon text-rap-platinum">
      <InternalPageHeader backLink="/rankings" backText="Back to Rankings" />
      <main className="pt-24 max-w-2xl mx-auto px-4 pb-12">
        <Card className="bg-carbon-fiber border-rap-gold/20">
          <CardHeader>
            <CardTitle className="text-2xl font-mogra text-rap-gold">Create New Ranking</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mogra text-rap-platinum">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Top 10 Lyrical Rappers" {...field} className="bg-rap-charcoal border-rap-gold/30" />
                      </FormControl>
                      <FormDescription>
                        A catchy title for your ranking list.
                      </FormDescription>
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
                          placeholder="Describe what your ranking is about..."
                          {...field}
                          className="bg-rap-charcoal border-rap-gold/30"
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the criteria for your ranking.
                      </FormDescription>
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
                        <Input placeholder="e.g., Lyrical Ability" {...field} className="bg-rap-charcoal border-rap-gold/30" />
                      </FormControl>
                      <FormDescription>
                        A category to help classify your ranking.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-rap-gold/30 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="font-mogra text-rap-platinum">Public Ranking</FormLabel>
                        <FormDescription>
                          Make this ranking visible to everyone.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra">
                  {isPending ? "Creating..." : "Create Ranking"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateRanking;
