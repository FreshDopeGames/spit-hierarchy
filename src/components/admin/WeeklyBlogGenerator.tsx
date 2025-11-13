import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WeeklyBlogGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Invoking weekly hip-hop roundup generator...');
      
      const { data, error } = await supabase.functions.invoke('generate-weekly-hip-hop-roundup');

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success('Weekly roundup generated!', {
        description: `Processed ${data.items_processed} articles. Post saved as draft.`
      });

      console.log('Generated post:', data);
    } catch (error) {
      console.error('Error generating weekly roundup:', error);
      toast.error('Failed to generate weekly roundup', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Weekly Hip-Hop Roundup
        </CardTitle>
        <CardDescription>
          Generate an automated weekly blog post from hip-hop news feeds (XXL, The Source, 2DOPEBOYZ, AllHipHop, Complex).
          Only includes articles mentioning artists in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Weekly Roundup...
            </>
          ) : (
            <>
              <Newspaper className="mr-2 h-4 w-4" />
              Generate This Week's Roundup
            </>
          )}
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          This will fetch articles from the past 7 days, filter for those mentioning artists in our database,
          and use AI to generate a culturally-rooted blog post. The post will be saved as a draft for review.
        </p>
      </CardContent>
    </Card>
  );
};

export default WeeklyBlogGenerator;
