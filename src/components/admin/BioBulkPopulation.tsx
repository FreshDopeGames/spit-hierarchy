import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardDescription as CardDescription, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Play, Square, RotateCcw, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BulkBioResults {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ rapper: string; error: string }>;
  progress: {
    startIndex: number;
    batchSize: number;
    totalToProcess: number;
    processedInBatch: number;
  };
}

const BioBulkPopulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BulkBioResults | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);

  const startBulkPopulation = async () => {
    setIsRunning(true);
    setShouldStop(false);
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);

    try {
      let startIndex = 0;
      const batchSize = 5; // Process 5 rappers at a time
      let allResults: BulkBioResults = {
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        progress: { startIndex: 0, batchSize, totalToProcess: 0, processedInBatch: 0 }
      };

      while (!shouldStop) {
        console.log(`Processing batch starting at index ${startIndex}`);
        setCurrentBatch(Math.floor(startIndex / batchSize) + 1);

        const { data, error } = await supabase.functions.invoke('bulk-fetch-bios', {
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
        allResults.progress.totalToProcess = data.results.progress.totalToProcess;

        setTotalProcessed(allResults.processed);
        setResults(allResults);

        // Update progress
        const totalToProcess = data.results.progress.totalToProcess;
        if (totalToProcess > 0) {
          setOverallProgress((allResults.processed / totalToProcess) * 100);
        }

        // Check if we're done
        if (data.completed) {
          toast.success("Bulk Bio Population Complete", {
            description: `Processed ${allResults.processed} rappers. ${allResults.successful} updated, ${allResults.skipped} skipped, ${allResults.failed} failed.`,
          });
          break;
        }

        startIndex = data.nextIndex;
        
        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error('Error during bulk population:', error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsRunning(false);
      setShouldStop(false);
    }
  };

  const stopProcess = () => {
    setShouldStop(true);
    setIsRunning(false);
    toast.info("Process Stopped", {
      description: "Bulk bio population has been stopped. Partial results are preserved.",
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
          <BookOpen className="h-5 w-5" />
          Wikipedia Bio Bulk Population
        </CardTitle>
        <CardDescription>
          Automatically fetch and expand biographies for all rappers using Wikipedia data and AI.
          This generates comprehensive 500+ word bios for each artist.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="force-refresh"
              checked={forceRefresh}
              onCheckedChange={setForceRefresh}
              disabled={isRunning}
            />
            <Label htmlFor="force-refresh" className="text-sm">
              Force refresh all bios (overwrite existing)
            </Label>
          </div>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startBulkPopulation} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Start Bio Population
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
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing batch #{currentBatch}
              </span>
              <span>{totalProcessed} rappers processed</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
            {results?.progress.totalToProcess && (
              <div className="text-xs text-muted-foreground text-center">
                {totalProcessed} / {results.progress.totalToProcess} rappers
              </div>
            )}
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{results.successful}</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{results.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{results.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{results.processed}</div>
                <div className="text-sm text-muted-foreground">Total</div>
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

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Data Sources:</strong> Wikipedia (via MusicBrainz links) + Lovable AI for bio expansion</p>
          <p><strong>Note:</strong> Each rapper takes ~5-10 seconds to process. The full population may take 1-2 hours.</p>
          <p>Only rappers with MusicBrainz IDs and bios under 500 words will be processed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BioBulkPopulation;
