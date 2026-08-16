import React, { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Star, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAlbumVotingCategories } from "@/hooks/useAlbumRating";
import { useRapperAutocomplete } from "@/hooks/useRapperAutocomplete";

export interface AlbumReviewFormState {
  enabled: boolean;
  albumId: string | null;
  albumTitle: string;
  albumArtist: string;
  albumCover: string | null;
  overallScore: string;
  verdict: string;
  scores: Record<string, number>;
}

export const createEmptyAlbumReviewState = (): AlbumReviewFormState => ({
  enabled: false,
  albumId: null,
  albumTitle: "",
  albumArtist: "",
  albumCover: null,
  overallScore: "",
  verdict: "",
  scores: {},
});

interface DbAlbumResult {
  id: string;
  title: string;
  cover: string | null;
  artist: string;
  year: string | null;
}

interface MbResult {
  id: string;
  title: string;
  primary_type: string;
  first_release_date: string | null;
  artist_credit: string;
  existing_album: { id: string; slug: string } | null;
}

interface Props {
  value: AlbumReviewFormState;
  onChange: (next: AlbumReviewFormState) => void;
}

const BlogPostAlbumReview = ({ value, onChange }: Props) => {
  const { data: categories } = useAlbumVotingCategories();
  const [query, setQuery] = useState("");
  const [dbResults, setDbResults] = useState<DbAlbumResult[]>([]);
  const [dbSearching, setDbSearching] = useState(false);
  const [mbResults, setMbResults] = useState<MbResult[]>([]);
  const [mbSearching, setMbSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Artist scoping for the MusicBrainz fallback
  const { searchTerm: artistTerm, setSearchTerm: setArtistTerm, searchResults: artistResults } =
    useRapperAutocomplete();
  const [selectedArtist, setSelectedArtist] = useState<{ id: string; name: string } | null>(null);

  // Seed the metric sliders once categories load
  useEffect(() => {
    if (!categories || !value.enabled) return;
    const missing = categories.filter((c) => value.scores[c.id] == null);
    if (missing.length === 0) return;
    const next = { ...value.scores };
    missing.forEach((c) => {
      next[c.id] = 7;
    });
    onChange({ ...value, scores: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, value.enabled]);

  const suggestedScore = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    const values = categories.map((c) => value.scores[c.id] ?? 0).filter((v) => v > 0);
    if (values.length === 0) return null;
    const avgTen = values.reduce((a, b) => a + b, 0) / values.length;
    return (Math.round((avgTen / 2) * 2) / 2).toFixed(1);
  }, [categories, value.scores]);

  const searchDatabase = async () => {
    if (query.trim().length < 2) return;
    setDbSearching(true);
    setMbResults([]);
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("id, title, cover_art_url, cached_cover_url, release_date, rapper_albums(rappers(name))")
        .ilike("title", `%${query.trim()}%`)
        .limit(15);
      if (error) throw error;
      setDbResults(
        (data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          cover: a.cached_cover_url || a.cover_art_url,
          artist: a.rapper_albums?.[0]?.rappers?.name || "Unknown artist",
          year: a.release_date ? String(new Date(a.release_date).getFullYear()) : null,
        })),
      );
    } catch (e: any) {
      toast.error(e.message || "Album search failed");
    } finally {
      setDbSearching(false);
    }
  };

  const searchMusicBrainz = async () => {
    if (query.trim().length < 2) return;
    setMbSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("search-musicbrainz-releases", {
        body: { query: query.trim(), rapperId: selectedArtist?.id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "MusicBrainz search failed");
      setMbResults(data.results || []);
      if ((data.results || []).length === 0) toast.info("No MusicBrainz matches found");
    } catch (e: any) {
      toast.error(e.message || "MusicBrainz search failed");
    } finally {
      setMbSearching(false);
    }
  };

  const attachAlbum = (album: { id: string; title: string; artist: string; cover: string | null }) => {
    onChange({
      ...value,
      albumId: album.id,
      albumTitle: album.title,
      albumArtist: album.artist,
      albumCover: album.cover,
    });
    setDbResults([]);
    setMbResults([]);
    setQuery("");
  };

  const importFromMusicBrainz = async (result: MbResult) => {
    if (!selectedArtist) {
      toast.error("Pick the artist first so the album can be linked");
      return;
    }
    setImportingId(result.id);
    try {
      const { data, error } = await supabase.functions.invoke("import-musicbrainz-album", {
        body: { releaseGroupId: result.id, rapperId: selectedArtist.id },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Import failed");
      toast.success(data.imported ? "Album imported from MusicBrainz" : "Album already in the database");
      attachAlbum({
        id: data.album.id,
        title: data.album.title,
        artist: selectedArtist.name,
        cover: data.album.cached_cover_url || data.album.cover_art_url,
      });
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded border border-[var(--theme-border)] bg-[var(--theme-surface)]">
      <div className="flex items-center space-x-3">
        <Switch
          id="is-album-review"
          checked={value.enabled}
          onCheckedChange={(checked) => onChange({ ...value, enabled: checked })}
        />
        <Label
          htmlFor="is-album-review"
          className="text-[var(--theme-text)] text-sm sm:text-base font-[var(--theme-font-body)]"
        >
          This post is an album review
        </Label>
      </div>

      {value.enabled && (
        <div className="space-y-5">
          {/* Attached album */}
          {value.albumId ? (
            <div className="flex items-center gap-3 p-3 rounded border border-[var(--theme-border)] bg-[var(--theme-background)]">
              {value.albumCover ? (
                <img src={value.albumCover} alt={`${value.albumTitle} cover art`} className="w-14 h-14 rounded object-cover" />
              ) : (
                <div className="w-14 h-14 rounded bg-black/40" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[var(--theme-text)] font-semibold truncate">{value.albumTitle}</p>
                <p className="text-xs text-[var(--theme-text-secondary)] truncate">{value.albumArtist}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...value, albumId: null, albumTitle: "", albumArtist: "", albumCover: null })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-[var(--theme-text)] text-sm font-[var(--theme-font-body)]">Find the album</Label>
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchDatabase();
                      }
                    }}
                    placeholder="Album title"
                    className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
                  />
                  <Button type="button" onClick={searchDatabase} disabled={dbSearching}>
                    {dbSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {dbResults.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-1 rounded border border-[var(--theme-border)] bg-black p-1">
                  {dbResults.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => attachAlbum({ id: r.id, title: r.title, artist: r.artist, cover: r.cover })}
                      className="w-full flex items-center gap-3 p-2 rounded text-left text-white hover:bg-[hsl(var(--theme-primary))] hover:text-black transition-colors"
                    >
                      {r.cover ? (
                        <img src={r.cover} alt={`${r.title} cover art`} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10" />
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-semibold">{r.title}</span>
                        <span className="block truncate text-xs opacity-80">
                          {r.artist}
                          {r.year ? ` • ${r.year}` : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* MusicBrainz fallback */}
              <div className="space-y-2 pt-2 border-t border-[var(--theme-border)]">
                <Label className="text-[var(--theme-text)] text-sm font-[var(--theme-font-body)]">
                  Not in our database? Import from MusicBrainz
                </Label>

                {selectedArtist ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedArtist.name}</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedArtist(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      value={artistTerm}
                      onChange={(e) => setArtistTerm(e.target.value)}
                      placeholder="Artist (required for import)"
                      className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
                    />
                    {artistResults.length > 0 && (
                      <div className="max-h-40 overflow-y-auto rounded border border-[var(--theme-border)] bg-black p-1">
                        {artistResults.slice(0, 8).map((a: any) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => {
                              setSelectedArtist({ id: a.id, name: a.name });
                              setArtistTerm("");
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-white hover:bg-[hsl(var(--theme-primary))] hover:text-black transition-colors"
                          >
                            {a.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button type="button" variant="outline" onClick={searchMusicBrainz} disabled={mbSearching}>
                  {mbSearching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Search MusicBrainz
                </Button>

                {mbResults.length > 0 && (
                  <div className="max-h-56 overflow-y-auto space-y-1 rounded border border-[var(--theme-border)] bg-black p-1">
                    {mbResults.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 p-2 rounded text-white hover:bg-white/5 transition-colors"
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block truncate font-semibold">{r.title}</span>
                          <span className="block truncate text-xs opacity-80">
                            {r.artist_credit} • {r.primary_type}
                            {r.first_release_date ? ` • ${r.first_release_date}` : ""}
                          </span>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => importFromMusicBrainz(r)}
                          disabled={importingId === r.id}
                        >
                          {importingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : r.existing_album ? (
                            "Use"
                          ) : (
                            "Import"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scoring */}
          {value.albumId && (
            <div className="space-y-5">
              {categories?.map((c) => {
                const score = value.scores[c.id] ?? 7;
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[var(--theme-text)] font-semibold">{c.name}</Label>
                      <span className="font-bold text-[hsl(var(--theme-primary))]">{score}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={score}
                      onChange={(e) =>
                        onChange({
                          ...value,
                          scores: { ...value.scores, [c.id]: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full accent-[hsl(var(--theme-primary))]"
                    />
                  </div>
                );
              })}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[var(--theme-text)] text-sm font-[var(--theme-font-body)]">
                    Official Score (out of 5) *
                  </Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={5}
                    step={0.5}
                    value={value.overallScore}
                    onChange={(e) => onChange({ ...value, overallScore: e.target.value })}
                    placeholder="4.5"
                    className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
                  />
                  <p className="text-xs text-[var(--theme-text-secondary)] font-[var(--theme-font-body)]">
                    {suggestedScore ? (
                      <>
                        <Star className="inline w-3 h-3 mr-1 -mt-0.5" />
                        Equal-weight suggestion from the metrics above: {suggestedScore}/5 (reference only)
                      </>
                    ) : (
                      "Half-star steps between 0.5 and 5.0"
                    )}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[var(--theme-text)] text-sm font-[var(--theme-font-body)]">Verdict</Label>
                  <Input
                    value={value.verdict}
                    onChange={(e) => onChange({ ...value, verdict: e.target.value })}
                    placeholder="One-line summary shown in the score card"
                    maxLength={200}
                    className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPostAlbumReview;
