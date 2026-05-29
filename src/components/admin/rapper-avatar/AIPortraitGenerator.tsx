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

type SlotStatus = "idle" | "queued" | "generating" | "done" | "failed";
type StyleKey = "comic" | "photoreal";
interface Slot {
  status: SlotStatus;
  url: string | null;
  style: StyleKey;
  error?: string;
}

const STYLES: { key: StyleKey; label: string }[] = [
  { key: "comic", label: "Comic Book" },
  { key: "photoreal", label: "Photoreal" },
];
const NUM_CANDIDATES = STYLES.length;

const AIPortraitGenerator = ({ rapper }: Props) => {
  const [refs, setRefs] = useState<string[]>([]);
  const [extraNotes, setExtraNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [slots, setSlots] = useState<Slot[]>(
    STYLES.map((s) => ({ status: "idle", url: null, style: s.key }))
  );
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const candidates = slots.map((s) => s.url);
  const completedCount = slots.filter((s) => s.status === "done" || s.status === "failed").length;
  const successCount = slots.filter((s) => s.status === "done").length;
  const showResults = slots.some((s) => s.status !== "idle");

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

  const updateSlot = (idx: number, patch: Partial<Slot>) =>
    setSlots((cur) => cur.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const generate = async () => {
    if (refs.length === 0) {
      toast.error("Upload at least 1 reference photo");
      return;
    }
    setGenerating(true);
    setSlots(STYLES.map((s) => ({ status: "queued", url: null, style: s.key })));

    const runOne = async (idx: number) => {
      const styleKey = STYLES[idx].key;
      updateSlot(idx, { status: "generating" });
      try {
        const { data, error } = await supabase.functions.invoke("generate-rapper-portrait", {
          body: { rapperId: rapper.id, referenceImages: refs, extraNotes, candidates: 1, style: styleKey },
        });
        if (error) throw error;
        const url = data?.candidates?.[0];
        if (!url) throw new Error(data?.error || "No image returned");
        updateSlot(idx, { status: "done", url });
      } catch (e: any) {
        console.error(`Candidate ${idx + 1} failed`, e);
        updateSlot(idx, { status: "failed", error: e.message });
      }
    };

    await Promise.all(Array.from({ length: NUM_CANDIDATES }, (_, i) => runOne(i)));

    const ok = await new Promise<number>((resolve) =>
      setSlots((cur) => {
        resolve(cur.filter((s) => s.status === "done").length);
        return cur;
      })
    );
    if (ok === 0) toast.error("All portrait generations failed");
    else toast.success(`Generated ${ok} of ${NUM_CANDIDATES} portrait(s)`);
    setGenerating(false);
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
      setSlots(Array.from({ length: NUM_CANDIDATES }, () => ({ status: "idle", url: null })));
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
              Generating {completedCount}/{NUM_CANDIDATES}…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Portraits
            </>
          )}
        </ThemedButton>

        {showResults && (
          <div>
            {generating && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-[var(--theme-text)] opacity-80 mb-1">
                  <span>Generating portraits in parallel…</span>
                  <span>{completedCount} / {NUM_CANDIDATES}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--theme-primary)]/15 overflow-hidden">
                  <div
                    className="h-full bg-[var(--theme-primary)] transition-all duration-500"
                    style={{ width: `${(completedCount / NUM_CANDIDATES) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-[var(--theme-text)] mb-2 font-bold">
              {generating
                ? `Previews appear as each candidate finishes (${successCount} ready so far)`
                : "Pick a portrait to save as the rapper's avatar"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {slots.map((slot, i) => (
                <div key={i} className="space-y-2">
                  <div className="relative aspect-square rounded-md overflow-hidden border border-[var(--theme-primary)]/30 bg-[var(--theme-background)]/50">
                    {slot.url ? (
                      <img src={slot.url} className="w-full h-full object-cover" alt={`candidate-${i + 1}`} />
                    ) : slot.status === "failed" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 text-xs p-2 text-center">
                        <X className="w-6 h-6 mb-1" />
                        Failed
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--theme-primary)] opacity-80">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-xs">
                          {slot.status === "generating" ? `Generating #${i + 1}` : `Queued #${i + 1}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <ThemedButton
                    size="sm"
                    onClick={() => saveCandidate(i)}
                    disabled={savingIdx !== null || slot.status !== "done"}
                    className="w-full bg-[var(--theme-primary)] text-[var(--theme-background)] disabled:opacity-40"
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
