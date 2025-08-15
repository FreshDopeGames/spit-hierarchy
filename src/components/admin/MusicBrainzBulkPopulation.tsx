import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Database, Play, Square, RotateCcw } from "lucide-react";

interface BulkPopulationResults {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{ rapper: string; error: string }>;
  progress: {
    startIndex: number;
    batchSize: number;
    processedInBatch: number;
  };
}

const MusicBrainzBulkPopulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BulkPopulationResults | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const startBulkPopulation = async () => {
    setIsRunning(true);
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);

    try {
      let startIndex = 0;
      const batchSize = 10; // Process 10 rappers at a time to respect rate limits
      let allResults: BulkPopulationResults = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [],
        progress: { startIndex: 0, batchSize, processedInBatch: 0 }
      };

      // Get total count of rappers without MusicBrainz IDs for progress calculation
      const { count: totalUnpopulated } = await supabase
        .from('rappers')
        .select('*', { count: 'exact', head: true })
        .is('musicbrainz_id', null);

      const totalToProcess = totalUnpopulated || 0;

      while (true) {
        console.log(`Processing batch starting at index ${startIndex}`);
        setCurrentBatch(Math.floor(startIndex / batchSize) + 1);

        const { data, error } = await supabase.functions.invoke('bulk-populate-musicbrainz-ids', {
          body: { batchSize, startFromIndex: startIndex }
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
        allResults.errors.push(...data.results.errors);

        setTotalProcessed(allResults.processed);
        setResults(allResults);

        // Update progress
        if (totalToProcess > 0) {
          setOverallProgress((allResults.processed / totalToProcess) * 100);
        }

        // Check if we're done
        if (data.completed || data.results.processedInBatch < batchSize) {
          toast.success("Bulk Population Complete", {
            description: `Processed ${allResults.processed} rappers. ${allResults.successful} successful, ${allResults.failed} failed.`,
          });
          break;
        }

        startIndex += batchSize;
        
        // Add a small delay between batches to be extra respectful to the API
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error('Error during bulk population:', error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopProcess = () => {
    setIsRunning(false);
    toast.info("Process Stopped", {
      description: "Bulk population has been stopped. Partial results are preserved.",
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
          <Database className="h-5 w-5" />
          MusicBrainz ID Bulk Population
        </CardTitle>
        <CardDescription>
          Automatically populate MusicBrainz IDs for all rappers that don't have them. 
          This will significantly improve discography fetching accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startBulkPopulation} disabled={isRunning}>
              <Play className="h-4 w-4 mr-2" />
              Start Bulk Population
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
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{results.successful}</div>
                <div className="text-sm text-muted-foreground">Successful</div>
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
          <p><strong>Note:</strong> This process respects MusicBrainz API rate limits and processes rappers in small batches.</p>
          <p>The process may take several minutes depending on how many rappers need MusicBrainz IDs.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicBrainzBulkPopulation;