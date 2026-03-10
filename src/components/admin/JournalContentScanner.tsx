import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useModerationJournal } from "@/hooks/useModerationJournal";
import { Shield, Search, AlertTriangle, Flag, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// Standard blacklist of bad/inappropriate words for scanning
const BAD_WORDS = [
  // Slurs & hate speech
  "nigger", "nigga", "n1gger", "n1gga", "ni99er", "ni99a", "ni66er", "ni66a",
  "nibber", "nibba", "faggot", "f4ggot", "fag", "f4g", "retard", "retarded",
  "tranny", "tr4nny", "spic", "sp1c", "wetback", "chink", "ch1nk", "gook",
  "kike", "k1ke", "beaner",
  // Sexual / explicit
  "fuck", "f*ck", "fuk", "fck", "shit", "sh1t", "s#it", "bitch", "b1tch",
  "pussy", "p*ssy", "dick", "d1ck", "cock", "c0ck", "ass", "a$$",
  "cunt", "c*nt", "whore", "wh0re", "slut", "sl*t",
  // Violence / threats
  "kill yourself", "kys", "die", "murder",
  // Drugs (hard)
  "meth", "heroin", "cocaine", "crack",
];

interface ScanResult {
  id: string;
  title: string;
  slug: string;
  username: string;
  created_at: string;
  matched_words: string[];
  is_flagged: boolean;
}

const JournalContentScanner = () => {
  const [scanResults, setScanResults] = useState<ScanResult[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { flagEntry } = useModerationJournal();

  const handleScan = async () => {
    setIsScanning(true);
    setScanResults(null);

    try {
      // Fetch all published public journal entries
      const { data: entries, error } = await supabase
        .from("member_journal_entries")
        .select("id, title, slug, content, user_id, created_at, is_public, status")
        .eq("status", "published")
        .eq("is_public", true);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        setScanResults([]);
        toast.info("No published journal entries to scan.");
        setIsScanning(false);
        return;
      }

      // Fetch profiles for usernames
      const userIds = [...new Set(entries.map(e => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

      // Scan each entry
      const results: ScanResult[] = [];
      for (const entry of entries) {
        const text = `${entry.title} ${entry.content}`.toLowerCase();
        const matched: string[] = [];

        for (const word of BAD_WORDS) {
          const lower = word.toLowerCase();
          if (text.includes(lower)) {
            matched.push(word);
          }
        }

        if (matched.length > 0) {
          results.push({
            id: entry.id,
            title: entry.title,
            slug: entry.slug,
            username: profileMap.get(entry.user_id) || "unknown",
            created_at: entry.created_at,
            matched_words: [...new Set(matched)],
            is_flagged: (entry as any).is_flagged || false,
          });
        }
      }

      setScanResults(results);
      if (results.length === 0) {
        toast.success("Scan complete — no problematic content found!");
      } else {
        toast.warning(`Found ${results.length} entries with potential issues.`);
      }
    } catch (err) {
      console.error("Scan error:", err);
      toast.error("Failed to scan journal entries.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFlagEntry = (entry: ScanResult) => {
    const reason = `Automated scan: contains blacklisted words — ${entry.matched_words.join(", ")}`;
    flagEntry.mutate(
      { entryId: entry.id, reason },
      {
        onSuccess: () => {
          setScanResults(prev =>
            prev?.map(r => (r.id === entry.id ? { ...r, is_flagged: true } : r)) || null
          );
        },
      }
    );
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Shield className="w-5 h-5 text-primary flex-shrink-0" />
          <CardTitle className="text-base sm:text-lg">Journal Content Scanner</CardTitle>
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning}
          variant="outline"
          className="border-primary/50 text-primary hover:bg-primary/10 w-full sm:w-auto text-sm"
          size="sm"
        >
          {isScanning ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          {isScanning ? "Scanning..." : "Scan Published Journals"}
        </Button>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Scans all published member journal entries against a standard blacklist of inappropriate words.
          Flagged entries will be unpublished and reverted to draft.
        </p>

        {scanResults !== null && scanResults.length === 0 && (
          <div className="flex items-center gap-2 text-green-400 py-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">All clear — no problematic entries found.</span>
          </div>
        )}

        {scanResults && scanResults.length > 0 && (
          <div className="space-y-3 mt-2">
            <p className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {scanResults.length} {scanResults.length === 1 ? "entry" : "entries"} with flagged content
            </p>
            {scanResults.map(result => (
              <div
                key={result.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground">
                    by <span className="text-foreground">{result.username}</span> •{" "}
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {result.matched_words.map(word => (
                      <Badge key={word} variant="destructive" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {result.is_flagged ? (
                    <Badge variant="outline" className="border-destructive/50 text-destructive">
                      Flagged
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleFlagEntry(result)}
                      disabled={flagEntry.isPending}
                    >
                      <Flag className="w-3 h-3 mr-1" /> Flag & Unpublish
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalContentScanner;
