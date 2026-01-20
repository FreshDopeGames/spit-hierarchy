import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardDescription as CardDescription, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Play, Square, RotateCcw, RefreshCw, AlignLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = 'bio_bulk_population_results';
const REFORMAT_STORAGE_KEY = 'bio_reformat_results';

interface BulkBioResults {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ rapper: string; error: string }>;
  successfulRappers: Array<{ rapper: string; wordCount: number; source: string }>;
  progress: {
    startIndex: number;
    batchSize: number;
    totalToProcess: number;
    processedInBatch: number;
  };
}

interface ReformatResults {
  processed: number;
  reformatted: number;
  skipped: number;
  errors: Array<{ rapper: string; error: string }>;
  reformattedRappers: Array<{ rapper: string; paragraphCount: number }>;
}

// Save results to localStorage
const saveResults = (results: BulkBioResults | null) => {
  try {
    if (results) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        results,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to persist bio results:', e);
  }
};

// Load results from localStorage
const loadResults = (): BulkBioResults | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { results, timestamp } = JSON.parse(stored);
      // Keep results for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return results;
      }
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to load bio results:', e);
  }
  return null;
};

// Save reformat results to localStorage
const saveReformatResults = (results: ReformatResults | null) => {
  try {
    if (results) {
      localStorage.setItem(REFORMAT_STORAGE_KEY, JSON.stringify({
        results,
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem(REFORMAT_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to persist reformat results:', e);
  }
};

// Load reformat results from localStorage
const loadReformatResults = (): ReformatResults | null => {
  try {
    const stored = localStorage.getItem(REFORMAT_STORAGE_KEY);
    if (stored) {
      const { results, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return results;
      }
      localStorage.removeItem(REFORMAT_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to load reformat results:', e);
  }
  return null;
};

const BioBulkPopulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BulkBioResults | null>(() => loadResults());
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(() => {
    const loaded = loadResults();
    return loaded?.processed ?? 0;
  });
  const [overallProgress, setOverallProgress] = useState(() => {
    const loaded = loadResults();
    if (loaded?.progress.totalToProcess) {
      return (loaded.processed / loaded.progress.totalToProcess) * 100;
    }
    return 0;
  });
  const [forceRefresh, setForceRefresh] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const [isReformatting, setIsReformatting] = useState(false);
  const [reformatResults, setReformatResults] = useState<ReformatResults | null>(() => loadReformatResults());

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
        successfulRappers: [],
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
        allResults.successfulRappers.push(...(data.results.successfulRappers || []));
        allResults.progress.totalToProcess = data.results.progress.totalToProcess;

        setTotalProcessed(allResults.processed);
        setResults({ ...allResults });
        saveResults(allResults);

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
    setReformatResults(null);
    // Clear from localStorage
    saveResults(null);
    saveReformatResults(null);
  };

  const reformatExistingBios = async () => {
    setIsReformatting(true);
    setReformatResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('reformat-bios');

      if (error) {
        toast.error("Failed to reformat bios", {
          description: error.message,
        });
        return;
      }

      if (!data.success) {
        toast.error("Error", {
          description: data.error || "Unknown error occurred",
        });
        return;
      }

      setReformatResults(data.results);
      saveReformatResults(data.results);
      toast.success("Bio Reformatting Complete", {
        description: `Reformatted ${data.results.reformatted} bios with paragraph breaks.`,
      });

    } catch (error: any) {
      console.error('Error during bio reformatting:', error);
      toast.error("Error", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsReformatting(false);
    }
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

            {results.successfulRappers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-green-500">Successfully Updated:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {results.successfulRappers.slice(0, 30).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="shrink-0 bg-green-500/20 text-green-400">
                        {item.rapper}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {item.wordCount} words via {item.source}
                      </span>
                    </div>
                  ))}
                  {results.successfulRappers.length > 30 && (
                    <div className="text-sm text-muted-foreground">
                      ... and {results.successfulRappers.length - 30} more updated
                    </div>
                  )}
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-destructive">Errors:</h4>
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

        {/* Bio Reformat Section */}
        <div className="border-t border-border pt-4 mt-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlignLeft className="h-4 w-4" />
            Reformat Existing Bios
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Add paragraph breaks to existing bios that are currently walls of text (every 3 sentences).
          </p>
          
          <Button 
            onClick={reformatExistingBios} 
            disabled={isReformatting || isRunning}
            variant="outline"
          >
            {isReformatting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reformatting...
              </>
            ) : (
              <>
                <AlignLeft className="h-4 w-4 mr-2" />
                Reformat Existing Bios
              </>
            )}
          </Button>

          {reformatResults && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{reformatResults.reformatted}</div>
                  <div className="text-sm text-muted-foreground">Reformatted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-muted-foreground">{reformatResults.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{reformatResults.processed}</div>
                  <div className="text-sm text-muted-foreground">Processed</div>
                </div>
              </div>

              {reformatResults.reformattedRappers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-green-500">Reformatted Bios:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {reformatResults.reformattedRappers.slice(0, 20).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="shrink-0 bg-green-500/20 text-green-400">
                          {item.rapper}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {item.paragraphCount} paragraphs
                        </span>
                      </div>
                    ))}
                    {reformatResults.reformattedRappers.length > 20 && (
                      <div className="text-sm text-muted-foreground">
                        ... and {reformatResults.reformattedRappers.length - 20} more reformatted
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
