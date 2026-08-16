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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

    // --- Auth: must be a signed-in blog manager ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ success: false, error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAnon.auth.getUser(token);
    if (!user) return json({ success: false, error: "Unauthorized" }, 401);

    const { data: canManage, error: roleError } = await supabaseService.rpc("can_manage_blog", {
      _user_id: user.id,
    });
    if (roleError || !canManage) return json({ success: false, error: "Forbidden" }, 403);

    // --- Input validation ---
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const rapperId = typeof body.rapperId === "string" ? body.rapperId : null;

    if (query.length < 2 || query.length > 200) {
      return json({ success: false, error: "Query must be between 2 and 200 characters" }, 400);
    }

    // Optionally scope the search to a known artist's MusicBrainz ID
    let artistMbid: string | null = null;
    let artistName: string | null = null;
    if (rapperId) {
      const { data: rapper } = await supabaseService
        .from("rappers")
        .select("name, musicbrainz_id")
        .eq("id", rapperId)
        .maybeSingle();
      artistMbid = rapper?.musicbrainz_id || null;
      artistName = rapper?.name || null;
    }

    const escaped = query.replace(/[:"\\]/g, " ");
    const luceneQuery = artistMbid
      ? `releasegroup:"${escaped}" AND arid:${artistMbid}`
      : artistName
      ? `releasegroup:"${escaped}" AND artist:"${artistName.replace(/["\\]/g, "")}"`
      : `releasegroup:"${escaped}"`;

    const url =
      `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(luceneQuery)}&fmt=json&limit=25`;

    await sleep(MB_DELAY_MS);
    const mbRes = await fetch(url, { headers: { "User-Agent": MB_USER_AGENT } });

    if (!mbRes.ok) {
      return json({ success: false, error: `MusicBrainz returned ${mbRes.status}` }, 502);
    }

    const mbData = await mbRes.json();
    const results = (mbData["release-groups"] || []).map((rg: any) => ({
      id: rg.id,
      title: rg.title,
      primary_type: rg["primary-type"] || "Other",
      secondary_types: rg["secondary-types"] || [],
      first_release_date: rg["first-release-date"] || null,
      artist_credit: (rg["artist-credit"] || []).map((ac: any) => ac.name).join(", "),
      artist_mbid: rg["artist-credit"]?.[0]?.artist?.id || null,
      score: rg.score ?? null,
    }));

    // Flag anything already in our database
    const mbIds = results.map((r: any) => r.id);
    let existing: Record<string, { id: string; slug: string }> = {};
    if (mbIds.length > 0) {
      const { data: existingAlbums } = await supabaseService
        .from("albums")
        .select("id, slug, musicbrainz_id")
        .in("musicbrainz_id", mbIds);
      for (const a of existingAlbums || []) {
        if (a.musicbrainz_id) existing[a.musicbrainz_id] = { id: a.id, slug: a.slug };
      }
    }

    return json({
      success: true,
      results: results.map((r: any) => ({ ...r, existing_album: existing[r.id] || null })),
      execution_time_ms: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error("search-musicbrainz-releases error:", error);
    return json({ success: false, error: error?.message || "Unexpected error" }, 500);
  }
});
