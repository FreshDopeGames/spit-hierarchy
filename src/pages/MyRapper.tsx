import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import HeaderNavigation from "@/components/HeaderNavigation";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useVerifiedArtist } from "@/hooks/useVerifiedArtist";
import { supabase } from "@/integrations/supabase/client";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const EDITABLE_FIELDS = ["bio", "instagram_handle", "homepage_url", "spotify_id"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];


const MyRapper = () => {
  const { isAuthenticated, loading } = useSecureAuth();
  const { isVerifiedArtist, ownedRapperId, isLoading: vaLoading } = useVerifiedArtist();
  const qc = useQueryClient();

  const { data: rapper } = useQuery({
    queryKey: ["my-rapper", ownedRapperId],
    enabled: !!ownedRapperId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("id, name, slug, bio, instagram_handle, homepage_url, spotify_id")
        .eq("id", ownedRapperId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<Record<EditableField, string>>({
    bio: "", instagram_handle: "", homepage_url: "", spotify_id: "",
  });

  useEffect(() => {
    if (rapper) {
      setForm({
        bio: rapper.bio ?? "",
        instagram_handle: rapper.instagram_handle ?? "",
        homepage_url: rapper.homepage_url ?? "",
        spotify_id: rapper.spotify_id ?? "",
      });
    }
  }, [rapper]);

  const save = useMutation({
    mutationFn: async () => {
      if (!ownedRapperId) throw new Error("Not linked to a rapper.");
      const { data, error } = await supabase
        .from("rappers")
        .update({
          bio: form.bio || null,
          instagram_handle: form.instagram_handle || null,
          homepage_url: form.homepage_url || null,
          spotify_id: form.spotify_id || null,
        })

        .eq("id", ownedRapperId)
        .select("id");
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Update silently failed — your changes weren't saved.");
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-rapper", ownedRapperId] });
      toast.success("Profile updated.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loading || vaLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--theme-background))] flex items-center justify-center">
        <div className="text-[hsl(var(--theme-primary))] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isVerifiedArtist || !ownedRapperId) {
    return (
      <div className="min-h-screen bg-[hsl(var(--theme-background))]">
        <HeaderNavigation isScrolled={false} />
        <main className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-3xl text-[hsl(var(--theme-primary))] font-bold mb-2">No linked profile</h1>
          <p className="text-[hsl(var(--theme-textMuted))]">
            You're not currently linked to a rapper profile. Visit any rapper page and use
            "Claim this profile" to start the verification process.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--theme-background))]">
      <HeaderNavigation isScrolled={false} />
      <main className="max-w-3xl mx-auto px-4 pt-28 sm:pt-36 pb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-[hsl(var(--theme-primary))] mb-2">
          Manage {rapper?.name ?? "your"} profile
        </h1>
        <p className="text-sm text-[hsl(var(--theme-textMuted))] mb-6">
          You can edit your bio and social links. Other details are admin-managed.
        </p>

        <Card className="bg-black border-2 border-[hsl(var(--theme-primary))]/40">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="bio" className="text-[hsl(var(--theme-text))]">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={8}
                className="bg-[hsl(var(--theme-background))] text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ig" className="text-[hsl(var(--theme-text))]">Instagram handle</Label>
              <Input
                id="ig"
                value={form.instagram_handle}
                onChange={(e) => setForm((f) => ({ ...f, instagram_handle: e.target.value }))}
                placeholder="@yourhandle"
                className="bg-[hsl(var(--theme-background))] text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
            <div className="space-y-1">

              <Label htmlFor="hp" className="text-[hsl(var(--theme-text))]">Homepage URL</Label>
              <Input
                id="hp"
                value={form.homepage_url}
                onChange={(e) => setForm((f) => ({ ...f, homepage_url: e.target.value }))}
                placeholder="https://..."
                className="bg-[hsl(var(--theme-background))] text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp" className="text-[hsl(var(--theme-text))]">Spotify artist ID</Label>
              <Input
                id="sp"
                value={form.spotify_id}
                onChange={(e) => setForm((f) => ({ ...f, spotify_id: e.target.value }))}
                placeholder="3nFkdlSjzX9mRTtwJOzDYB"
                className="bg-[hsl(var(--theme-background))] text-white border-[hsl(var(--theme-primary))]/40"
              />
            </div>
            <div className="flex justify-end">
              <ThemedButton onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Saving..." : "Save changes"}
              </ThemedButton>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyRapper;
