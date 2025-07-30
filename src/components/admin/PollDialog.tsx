import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { toast } from "sonner";

const pollSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["single_choice", "multiple_choice"]),
  status: z.enum(["draft", "active", "completed", "archived"]),
  placement: z.enum(["homepage", "all_blogs", "specific_blog"]),
  blog_post_id: z.string().optional(),
  expires_at: z.string().optional(),
  is_featured: z.boolean(),
  allow_write_in: z.boolean().default(false),
  options: z.array(z.string().min(1, "Option text is required")).min(2, "At least 2 options required")
});

type PollFormData = z.infer<typeof pollSchema>;

interface PollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll?: any;
  onSuccess: () => void;
}

const PollDialog = ({ open, onOpenChange, poll, onSuccess }: PollDialogProps) => {
  const { user } = useSecureAuth();
  const [options, setOptions] = useState<string[]>(['', '']);

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "single_choice",
      status: "draft",
      placement: "homepage",
      blog_post_id: "",
      expires_at: "",
      is_featured: false,
      allow_write_in: false,
      options: ['', '']
    }
  });

  useEffect(() => {
    if (poll) {
      const pollOptions = poll.poll_options
        .sort((a: any, b: any) => a.option_order - b.option_order)
        .map((opt: any) => opt.option_text);
      
      form.reset({
        title: poll.title,
        description: poll.description || "",
        type: poll.type,
        status: poll.status,
        placement: poll.placement,
        blog_post_id: poll.blog_post_id || "",
        expires_at: poll.expires_at ? poll.expires_at.split('T')[0] : "",
        is_featured: poll.is_featured,
        allow_write_in: poll.allow_write_in || false,
        options: pollOptions
      });
      setOptions(pollOptions);
    } else {
      form.reset();
      setOptions(['', '']);
    }
  }, [poll, form]);

  const addOption = () => {
    const newOptions = [...options, ''];
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    form.setValue('options', newOptions);
  };

  const onSubmit = async (data: PollFormData) => {
    if (!user) return;

    try {
      // Prepare poll data
      const pollData = {
        title: data.title,
        description: data.description || null,
        type: data.type,
        status: data.status,
        placement: data.placement,
        blog_post_id: data.placement === 'specific_blog' ? data.blog_post_id || null : null,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        is_featured: data.is_featured,
        allow_write_in: data.allow_write_in,
        created_by: user.id
      };

      let pollId: string;

      if (poll) {
        // Update existing poll
        const { error } = await supabase
          .from('polls')
          .update(pollData)
          .eq('id', poll.id);
        
        if (error) throw error;
        pollId = poll.id;

        // Delete existing options
        await supabase
          .from('poll_options')
          .delete()
          .eq('poll_id', poll.id);
      } else {
        // Create new poll
        const { data: newPoll, error } = await supabase
          .from('polls')
          .insert(pollData)
          .select('id')
          .single();
        
        if (error) throw error;
        pollId = newPoll.id;
      }

      // Insert poll options
      const optionData = data.options
        .filter(option => option.trim())
        .map((option, index) => ({
          poll_id: pollId,
          option_text: option.trim(),
          option_order: index + 1
        }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionData);

      if (optionsError) throw optionsError;

      toast.success(poll ? "Poll updated successfully" : "Poll created successfully");
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to save poll");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{poll ? "Edit Poll" : "Create New Poll"}</DialogTitle>
          <DialogDescription>
            {poll ? "Update poll details and options" : "Create a new community poll"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Poll title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Poll description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_choice">Single Choice</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="placement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placement</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="all_blogs">All Blog Posts</SelectItem>
                      <SelectItem value="specific_blog">Specific Blog Post</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('placement') === 'specific_blog' && (
              <FormField
                control={form.control}
                name="blog_post_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Post ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter blog post ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured Poll</FormLabel>
                    <FormDescription>
                      Display this poll prominently on the homepage
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

              <FormField
                control={form.control}
                name="allow_write_in"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Allow Write-In Options
                      </FormLabel>
                      <FormDescription>
                        Let users submit their own custom options
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

            <div className="space-y-4">
              <FormLabel>Poll Options</FormLabel>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {poll ? "Update Poll" : "Create Poll"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PollDialog;