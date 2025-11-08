import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Globe, Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkUpdateResults {
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{ rapper: string; error: string }>;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

const SocialMediaBulkUpdate = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BulkUpdateResults | null>(null);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const startBulkUpdate = async () => {
    setIsRunning(true);
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);

    const batchSize = 10;
    let startIndex = 0;
    let allResults: BulkUpdateResults = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      progress: { current: 0, total: 0, percentage: 0 },
    };

    try {
      while (isRunning) {
        setCurrentBatch((prev) => prev + 1);

        const { data, error } = await supabase.functions.invoke(
          "bulk-update-social-links",
          {
            body: {
              batchSize,
              startFromIndex: startIndex,
            },
          }
        );

        if (error) {
          throw error;
        }

        // Accumulate results
        allResults.processed += data.processed;
        allResults.successful += data.successful;
        allResults.failed += data.failed;
        allResults.skipped += data.skipped;
        allResults.errors = [...allResults.errors, ...data.errors];
        allResults.progress = data.progress;

        setTotalProcessed(allResults.progress.current);
        setOverallProgress(allResults.progress.percentage);
        setResults({ ...allResults });

        // Check if we're done
        if (data.completed || data.processed === 0) {
          setIsRunning(false);
          toast.success("Bulk Update Complete", {
            description: `Updated ${allResults.successful} rappers, skipped ${allResults.skipped}, ${allResults.failed} failed.`,
          });
          break;
        }

        startIndex += batchSize;

        // Small delay between batches (1 second)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error during bulk update:", error);
      toast.error("Error", {
        description: "Failed to complete bulk update. Check console for details.",
      });
      setIsRunning(false);
    }
  };

  const stopProcess = () => {
    setIsRunning(false);
    toast.info("Process Stopped", {
      description: "Social media bulk update has been stopped.",
    });
  };

  const resetResults = () => {
    setResults(null);
    setCurrentBatch(0);
    setTotalProcessed(0);
    setOverallProgress(0);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Instagram className="w-5 h-5" />
            <Globe className="w-5 h-5" />
            Social Media & Homepage Bulk Update
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quickly fetch and update Instagram handles and official homepage URLs from
            MusicBrainz for all rappers. Much faster than full discography fetch
            (processes ~10 rappers per batch).
          </p>
        </div>

        <div className="flex gap-2">
          {!isRunning ? (
            <>
              <Button onClick={startBulkUpdate} disabled={isRunning}>
                <Globe className="w-4 h-4 mr-2" />
                Start Bulk Update
              </Button>
              {results && (
                <Button onClick={resetResults} variant="outline">
                  Reset Results
                </Button>
              )}
            </>
          ) : (
            <Button onClick={stopProcess} variant="destructive">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Stop Process
            </Button>
          )}
        </div>

        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing batch {currentBatch}...</span>
              <span className="font-medium">
                {totalProcessed} rappers processed ({overallProgress}%)
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        )}

        {results && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.successful}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skipped</p>
                <p className="text-2xl font-bold text-blue-600">
                  {results.skipped}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {results.failed}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Processed</p>
                <p className="text-2xl font-bold">{results.processed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Errors:</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-destructive/10 rounded"
                    >
                      <span className="font-medium">{error.rapper}:</span>{" "}
                      {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <Badge variant="outline" className="text-xs">
                Batch Size: 10 rappers
              </Badge>
              <Badge variant="outline" className="text-xs">
                Rate Limit: 1.5s per rapper
              </Badge>
              <p className="text-xs text-muted-foreground">
                Estimated time: ~3-5 seconds per rapper (10-20x faster than full
                discography fetch)
              </p>
              <p className="text-xs text-muted-foreground">
                Note: Only updates empty fields. Existing Instagram handles and
                homepage URLs are preserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SocialMediaBulkUpdate;
