import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tags, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TagResult {
  id: string;
  title: string;
  rappersLinked: number;
  updated: boolean;
}

const BlogRapperTagger = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [results, setResults] = useState<TagResult[]>([]);

  const handleScanAll = async () => {
    setIsProcessing(true);
    setResults([]);
    
    try {
      console.log('Invoking rapper tagger...', { all: true, dryRun });
      
      const { data, error } = await supabase.functions.invoke('tag-rappers-in-blog-posts', {
        body: { all: true, dryRun }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults(data.results || []);
      
      if (data.results?.length > 0) {
        toast.success(dryRun ? 'Dry run complete!' : 'Posts updated!', {
          description: `${data.postsUpdated} posts with ${data.totalRappersLinked} total rappers linked`
        });
      } else {
        toast.info('No posts need updating', {
          description: 'All posts either have rapper links or no matching rappers found'
        });
      }

      console.log('Tagger results:', data);
    } catch (error) {
      console.error('Error running rapper tagger:', error);
      toast.error('Failed to tag rappers', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Retroactive Rapper Tagging
        </CardTitle>
        <CardDescription>
          Scan existing blog posts and automatically link rapper mentions to their profile pages.
          This enables the "Rappers Mentioned" carousel on older posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="dry-run"
            checked={dryRun}
            onCheckedChange={setDryRun}
          />
          <Label htmlFor="dry-run" className="text-sm">
            Dry Run (preview changes without saving)
          </Label>
        </div>

        <Button 
          onClick={handleScanAll} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning Posts...
            </>
          ) : (
            <>
              <Tags className="mr-2 h-4 w-4" />
              {dryRun ? 'Preview All Posts' : 'Tag All Posts'}
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">
              {dryRun ? 'Preview Results:' : 'Updated Posts:'}
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {results.map((result) => (
                <div 
                  key={result.id} 
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="truncate flex-1">{result.title}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {result.rappersLinked} rappers
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Only scans posts without existing rapper links. Uses the same matching logic as the Weekly Rap-Up generator.
        </p>
      </CardContent>
    </Card>
  );
};

export default BlogRapperTagger;
