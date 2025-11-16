import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardDescription as CardDescription, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Music, Play, Square, RotateCcw } from "lucide-react";

interface BulkFetchResults {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ rapper: string; error: string }>;
  progress: {
    startIndex: number;
    batchSize: number;
    processedInBatch: number;
  };
}

const DiscographyBulkFetch = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [results, setResults] = useState<BulkFetchResults | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const isRunningRef = useRef(false);

  const startBulkFetch = async () => {
    setIsRunning(true);
    isRunningRef.current = true;
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);

    try {
      let startIndex = 0;
      const batchSize = 2; // Process 2 rappers at a time to avoid edge function timeouts
      let allResults: BulkFetchResults = {
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        progress: { startIndex: 0, batchSize, processedInBatch: 0 }
      };

      // Get total count of rappers needing discography for progress calculation
      let query = supabase
        .from('rappers')
        .select('*', { count: 'exact', head: true })
        .not('musicbrainz_id', 'is', null);
      
      if (!forceRefresh) {
        query = query.is('discography_last_updated', null);
      }
      
      const { count: totalNeedingFetch } = await query;

      const totalToProcess = totalNeedingFetch || 0;

      while (true) {
        // Check if user stopped the process
        if (!isRunningRef.current) {
          console.log("Process stopped by user");
          toast.info("Bulk fetch process stopped");
          break;
        }

        console.log(`Processing batch starting at index ${startIndex}`);
        setCurrentBatch(Math.floor(startIndex / batchSize) + 1);

        const { data, error } = await supabase.functions.invoke('bulk-fetch-discographies', {
          body: { batchSize, startFromIndex: startIndex, forceRefresh }
        });

        if (error) {
          console.error('Error in batch:', error);
          toast.error("Failed to process batch", {
            description: error.message,
          });
          break;
        }

        if (!data.success) {
          toast.error("Error", {
            description: data.error || "Unknown error occurred",
          });
          break;
        }

        // Accumulate results
        allResults.processed += data.results.processed;
        allResults.successful += data.results.successful;
        allResults.failed += data.results.failed;
        allResults.skipped += data.results.skipped;
        allResults.errors.push(...data.results.errors);

        setTotalProcessed(allResults.processed);
        setResults(allResults);

        // Update progress
        if (totalToProcess > 0) {
          setOverallProgress((allResults.processed / totalToProcess) * 100);
        }

        // Check if we're done
        if (data.completed || data.results.processedInBatch < batchSize) {
          toast.success("Bulk Discography Fetch Complete", {
            description: `Processed ${allResults.processed} rappers. ${allResults.successful} successful, ${allResults.failed} failed, ${allResults.skipped} skipped.`,
          });
          break;
        }

        startIndex += batchSize;
        
        // Add delay between batches for safety
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error('Error during bulk fetch:', error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  };

  const stopProcess = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    toast.info("Process Stopped", {
      description: "Bulk discography fetch has been stopped. Partial results are preserved.",
    });
  };

  const resetResults = () => {
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Bulk Discography Fetch
        </CardTitle>
        <CardDescription>
          Automatically fetch album discographies from MusicBrainz for all rappers with MusicBrainz IDs.
          This will populate career start years and enable accurate decade rankings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 pb-2">
          <Checkbox 
            id="force-refresh" 
            checked={forceRefresh}
            onCheckedChange={(checked) => setForceRefresh(checked as boolean)}
            disabled={isRunning}
          />
          <Label 
            htmlFor="force-refresh" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Force Refresh All (re-fetch all rappers including those already processed)
          </Label>
        </div>
        
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startBulkFetch} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Start Bulk Fetch
            </Button>
          ) : (
            <Button onClick={stopProcess} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop Process
            </Button>
          )}
          
          {results && !isRunning && (
            <Button onClick={resetResults} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Results
            </Button>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing batch #{currentBatch}</span>
              <span>{totalProcessed} rappers processed</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{results.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{results.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{results.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.processed}</div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Errors:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {results.errors.slice(0, 20).map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="destructive" className="shrink-0">
                        {error.rapper}
                      </Badge>
                      <span className="text-muted-foreground truncate">
                        {error.error}
                      </span>
                    </div>
                  ))}
                  {results.errors.length > 20 && (
                    <div className="text-sm text-muted-foreground">
                      ... and {results.errors.length - 20} more errors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> This process respects MusicBrainz API rate limits (1.5s between requests).</p>
          <p>Batch size: 2 rappers per batch with 2s delay between batches to prevent timeouts.</p>
          <p>Expected duration: ~10-15 minutes for 151 rappers. Only rappers with MusicBrainz IDs will be processed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscographyBulkFetch;
