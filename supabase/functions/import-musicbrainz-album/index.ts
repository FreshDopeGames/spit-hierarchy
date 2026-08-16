import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const MB_USER_AGENT = "SpitHierarchy/1.0 (https://spithierarchy.com)";
const MB_DELAY_MS = 1100;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function ensureUniqueSlug(supabaseService: any, baseSlug: string): Promise<string> {
  let slug = baseSlug || "album";
  let counter = 1;
  while (true) {
    const { data } = await supabaseService.from("albums").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function cacheCoverArt(
  supabaseService: any,
  musicbrainzId: string,
): Promise<{ url: string | null; cached: string | null }> {
  const remoteUrl = `https://coverartarchive.org/release-group/${musicbrainzId}/front`;
  try {
    const response = await fetch(remoteUrl, {
      headers: { "User-Agent": MB_USER_AGENT },
      redirect: "follow",
    });
    if (!response.ok) return { url: null, cached: null };

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageData = await response.arrayBuffer();
    const extension = contentType.includes("png") ? "png" : "jpg";
    const fileName = `${musicbrainzId}.${extension}`;

    const { error } = await supabaseService.storage
      .from("album-covers")
      .upload(fileName, imageData, { contentType, upsert: true });

    if (error) {
      console.error("Cover upload error:", error.message);
      return { url: remoteUrl, cached: null };
    }

    const { data: urlData } = supabaseService.storage.from("album-covers").getPublicUrl(fileName);
    return { url: remoteUrl, cached: urlData.publicUrl };
  } catch (e) {
    console.error("Cover art caching failed:", e);
    return { url: null, cached: null };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ success: false, error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAnon.auth.getUser(token);
    if (!user) return json({ success: false, error: "Unauthorized" }, 401);

    const { data: canManage, error: roleError } = await supabaseService.rpc("can_manage_blog", {
      _user_id: user.id,
    });
    if (roleError || !canManage) return json({ success: false, error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const releaseGroupId = typeof body.releaseGroupId === "string" ? body.releaseGroupId : "";
    const rapperId = typeof body.rapperId === "string" ? body.rapperId : "";

    if (!UUID_RE.test(releaseGroupId)) {
      return json({ success: false, error: "A valid MusicBrainz release group id is required" }, 400);
    }
    if (!UUID_RE.test(rapperId)) {
      return json({ success: false, error: "A valid rapper id is required" }, 400);
    }

    const { data: rapper } = await supabaseService
      .from("rappers")
      .select("id, name")
      .eq("id", rapperId)
      .maybeSingle();
    if (!rapper) return json({ success: false, error: "Rapper not found" }, 404);

    // Already imported? Just link it and return.
    const { data: existingAlbum } = await supabaseService
      .from("albums")
      .select("id, title, slug, cover_art_url, cached_cover_url, release_date, release_type")
      .eq("musicbrainz_id", releaseGroupId)
      .maybeSingle();

    if (existingAlbum) {
      await supabaseService
        .from("rapper_albums")
        .upsert(
          { rapper_id: rapperId, album_id: existingAlbum.id, role: "primary" },
          { onConflict: "rapper_id,album_id" },
        );
      return json({ success: true, album: existingAlbum, imported: false });
    }

    // Fetch release-group details from MusicBrainz
    await sleep(MB_DELAY_MS);
    const mbRes = await fetch(
      `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}?inc=releases+artist-credits&fmt=json`,
      { headers: { "User-Agent": MB_USER_AGENT } },
    );
    if (!mbRes.ok) {
      return json({ success: false, error: `MusicBrainz returned ${mbRes.status}` }, 502);
    }
    const rg = await mbRes.json();

    const primaryType: string = rg["primary-type"] || "Album";
    const secondary: string[] = rg["secondary-types"] || [];
    const releaseType = secondary.includes("Mixtape/Street")
      ? "mixtape"
      : primaryType.toLowerCase() === "ep"
      ? "ep"
      : primaryType.toLowerCase() === "single"
      ? "single"
      : "album";

    // Pick an official release for track count / label info
    const releases: any[] = rg.releases || [];
    const chosen = releases.find((r) => r.status === "Official") || releases[0] || null;

    let trackCount: number | null = null;
    let labelId: string | null = null;

    if (chosen?.id) {
      await sleep(MB_DELAY_MS);
      const relRes = await fetch(
        `https://musicbrainz.org/ws/2/release/${chosen.id}?inc=recordings+labels&fmt=json`,
        { headers: { "User-Agent": MB_USER_AGENT } },
      );
      if (relRes.ok) {
        const rel = await relRes.json();
        trackCount = rel.media?.reduce((sum: number, m: any) => sum + (m["track-count"] || 0), 0) || null;
        const labelName = rel["label-info"]?.[0]?.label?.name || null;
        const labelMbid = rel["label-info"]?.[0]?.label?.id || null;
        if (labelName) {
          const { data: existingLabel } = await supabaseService
            .from("record_labels")
            .select("id")
            .eq("name", labelName)
            .maybeSingle();
          if (existingLabel) {
            labelId = existingLabel.id;
          } else {
            const { data: newLabel } = await supabaseService
              .from("record_labels")
              .insert({ name: labelName, musicbrainz_id: labelMbid })
              .select("id")
              .maybeSingle();
            labelId = newLabel?.id || null;
          }
        }
      }
    }

    const cover = await cacheCoverArt(supabaseService, releaseGroupId);
    const slug = await ensureUniqueSlug(supabaseService, generateSlug(rg.title || "album"));

    const { data: album, error: insertError } = await supabaseService
      .from("albums")
      .insert({
        title: rg.title,
        musicbrainz_id: releaseGroupId,
        release_date: rg["first-release-date"] && rg["first-release-date"].length >= 4
          ? (rg["first-release-date"].length === 4
            ? `${rg["first-release-date"]}-01-01`
            : rg["first-release-date"].length === 7
            ? `${rg["first-release-date"]}-01`
            : rg["first-release-date"])
          : null,
        release_type: releaseType,
        track_count: trackCount,
        label_id: labelId,
        slug,
        cover_art_url: cover.url,
        cached_cover_url: cover.cached,
        has_cover_art: !!cover.url,
      })
      .select("id, title, slug, cover_art_url, cached_cover_url, release_date, release_type")
      .maybeSingle();

    if (insertError || !album) {
      return json({ success: false, error: insertError?.message || "Failed to create album" }, 500);
    }

    const { error: linkError } = await supabaseService
      .from("rapper_albums")
      .upsert(
        { rapper_id: rapperId, album_id: album.id, role: "primary" },
        { onConflict: "rapper_id,album_id" },
      );
    if (linkError) {
      console.error("Failed to link album to rapper:", linkError.message);
    }

    // Audit trail
    try {
      await supabaseService.from("musicbrainz_audit_logs").insert({
        rapper_id: rapperId,
        action: "IMPORT_ALBUM_FOR_REVIEW",
        status: "SUCCESS",
        user_id: user.id,
        request_data: { releaseGroupId, rapperId },
        response_data: { album_id: album.id, title: album.title },
        execution_time_ms: Date.now() - startTime,
      });
    } catch (e) {
      console.warn("Audit log failed:", e);
    }

    return json({ success: true, album, imported: true });
  } catch (error: any) {
    console.error("import-musicbrainz-album error:", error);
    return json({ success: false, error: error?.message || "Unexpected error" }, 500);
  }
});
