
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).optional(),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  isPublic: z.boolean().default(true),
});

interface CreateRankingDialogProps {
  children: React.ReactNode;
}

const CreateRankingDialog = ({ children }: CreateRankingDialogProps) => {
  const [open, setOpen] = useState(false);
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
        form.reset();
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-carbon-fiber border-rap-gold/20 text-rap-platinum sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mogra text-rap-gold">Create New Ranking</DialogTitle>
          <DialogDescription className="text-rap-smoke">
            Fill in the details below to create your new ranking list.
          </DialogDescription>
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
                    <Input placeholder="e.g., Top 10 Lyrical Rappers" {...field} className="bg-rap-charcoal border-rap-gold/30" />
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
                      placeholder="Describe what your ranking is about..."
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
                    <Input placeholder="e.g., Lyrical Ability" {...field} className="bg-rap-charcoal border-rap-gold/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-rap-gold/30 p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-mogra text-rap-platinum">Public Ranking</FormLabel>
                    <FormDescription className="text-xs text-rap-smoke">
                      Make this ranking visible to everyone.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full bg-rap-gold hover:bg-rap-gold-light text-rap-charcoal font-mogra">
              {isPending ? "Creating..." : "Create Ranking"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRankingDialog;
