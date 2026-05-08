import { useState, useRef } from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, X, Loader2, Check } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateRapperImageSizes } from "@/utils/imageUtils";
import { useQueryClient } from "@tanstack/react-query";

type Rapper = Tables<"rappers">;

interface Props {
  rapper: Rapper;
}

const MAX_REFS = 3;
const MAX_SIZE = 5 * 1024 * 1024;

const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const dataUrlToBlob = async (url: string) => (await fetch(url)).blob();

const AIPortraitGenerator = ({ rapper }: Props) => {
  const [refs, setRefs] = useState<string[]>([]);
  const [extraNotes, setExtraNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_REFS - refs.length;
    const next: string[] = [];
    for (const file of Array.from(files).slice(0, remaining)) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name} is not a supported image type`);
        continue;
      }
      next.push(await fileToDataUrl(file));
    }
    setRefs((cur) => [...cur, ...next]);
  };

  const removeRef = (i: number) => setRefs((cur) => cur.filter((_, idx) => idx !== i));

  const generate = async () => {
    if (refs.length === 0) {
      toast.error("Upload at least 1 reference photo");
      return;
    }
    setGenerating(true);
    setCandidates([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-rapper-portrait", {
        body: { rapperId: rapper.id, referenceImages: refs, extraNotes },
      });
      if (error) throw error;
      if (!data?.candidates?.length) throw new Error("No candidates returned");
      setCandidates(data.candidates);
      toast.success(`Generated ${data.candidates.length} portrait(s)`);
    } catch (e: any) {
      console.error(e);
      toast.error(`Generation failed: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const saveCandidate = async (idx: number) => {
    setSavingIdx(idx);
    try {
      const url = candidates[idx];
      const blob = await dataUrlToBlob(url);
      const sanitizedName = rapper.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

      const sizes = await generateRapperImageSizes(blob);
      // Upload original
      await supabase.storage
        .from("rapper-images")
        .upload(`${sanitizedName}/original.jpg`, new File([blob], "original.jpg", { type: "image/jpeg" }), {
          cacheControl: "3600",
          upsert: true,
        });
      // Upload sizes
      for (const { name, blob: b } of sizes) {
        const f = new File([b], `${name}.jpg`, { type: "image/jpeg" });
        const { error } = await supabase.storage
          .from("rapper-images")
          .upload(`${sanitizedName}/${name}.jpg`, f, { cacheControl: "3600", upsert: true });
        if (error) throw error;
      }

      // Upsert rapper_images comic_book record
      const { data: existing } = await supabase
        .from("rapper_images")
        .select("id")
        .eq("rapper_id", rapper.id)
        .eq("style", "comic_book")
        .maybeSingle();
      if (existing) {
        await supabase
          .from("rapper_images")
          .update({ image_url: sanitizedName, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("rapper_images")
          .insert({ rapper_id: rapper.id, style: "comic_book", image_url: sanitizedName });
      }

      const xlargeUrl = `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/${sanitizedName}/xlarge.jpg`;
      const { data: updated, error: updateErr } = await supabase
        .from("rappers")
        .update({ image_url: xlargeUrl, updated_at: new Date().toISOString() })
        .eq("id", rapper.id)
        .select("id");
      if (updateErr) throw updateErr;
      if (!updated || updated.length === 0)
        throw new Error("Update failed — admin session may have expired");

      queryClient.invalidateQueries({ queryKey: ["rapper-image", rapper.id] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      toast.success("Portrait saved as rapper avatar");
      setCandidates([]);
      setRefs([]);
    } catch (e: any) {
      console.error(e);
      toast.error(`Save failed: ${e.message}`);
    } finally {
      setSavingIdx(null);
    }
  };

  return (
    <ThemedCard className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
      <ThemedCardHeader>
        <ThemedCardTitle className="text-[var(--theme-primary)] flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Portrait Generator
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-4">
        <div>
          <p className="text-sm text-[var(--theme-text)] mb-2 font-bold">
            Reference photos ({refs.length}/{MAX_REFS})
          </p>
          <p className="text-xs text-[var(--theme-text)] opacity-70 mb-3">
            Upload 1–3 clear photos of {rapper.name}. More references improve likeness accuracy.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {refs.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-[var(--theme-primary)]/30">
                <img src={src} className="w-full h-full object-cover" alt={`ref-${i}`} />
                <button
                  type="button"
                  onClick={() => removeRef(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {refs.length < MAX_REFS && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="aspect-square rounded-md border-2 border-dashed border-[var(--theme-primary)]/40 flex flex-col items-center justify-center text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10 transition-colors"
              >
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <div>
          <p className="text-sm text-[var(--theme-text)] mb-2 font-bold">Extra notes (optional)</p>
          <Textarea
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder='e.g. "wearing a fitted cap, late-90s era"'
            className="bg-[var(--theme-background)] text-[var(--theme-text)] border-[var(--theme-primary)]/30"
            rows={2}
            maxLength={300}
          />
        </div>

        <ThemedButton
          onClick={generate}
          disabled={generating || refs.length === 0}
          className="w-full bg-[var(--theme-primary)] text-[var(--theme-background)] hover:opacity-90"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating 4 candidates…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Portraits
            </>
          )}
        </ThemedButton>

        {candidates.length > 0 && (
          <div>
            <p className="text-sm text-[var(--theme-text)] mb-2 font-bold">
              Pick a portrait to save as the rapper's avatar
            </p>
            <div className="grid grid-cols-2 gap-3">
              {candidates.map((src, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-square rounded-md overflow-hidden border border-[var(--theme-primary)]/30">
                    <img src={src} className="w-full h-full object-cover" alt={`candidate-${i}`} />
                  </div>
                  <ThemedButton
                    size="sm"
                    onClick={() => saveCandidate(i)}
                    disabled={savingIdx !== null}
                    className="w-full bg-[var(--theme-primary)] text-[var(--theme-background)]"
                  >
                    {savingIdx === i ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Use this one
                      </>
                    )}
                  </ThemedButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default AIPortraitGenerator;
