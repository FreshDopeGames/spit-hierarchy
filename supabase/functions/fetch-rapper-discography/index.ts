import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface MusicBrainzAlias { name: string }
interface MusicBrainzArtist {
  id: string;
  name: string;
  score?: number;
  aliases?: MusicBrainzAlias[];
  'life-span'?: { begin?: string; end?: string };
  relations?: Array<{
    'target-type'?: string;
    type?: string;
    label?: { id: string; name: string };
    begin?: string;
    end?: string;
  }>;
}

interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  'primary-type': string;
  'secondary-types'?: string[];
  'first-release-date'?: string;
  releases?: Array<{
    id: string;
    'track-count'?: number;
    'label-info'?: Array<{ label?: { id: string; name: string } }>
  }>;
}

interface MusicBrainzRecording {
  id: string;
  title: string;
  length?: number;
  releases?: Array<{ id: string; title: string; date?: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const clientIP = req.headers.get('cf-connecting-ip')
    || req.headers.get('x-forwarded-for')
    || req.headers.get('x-real-ip')
    || null;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  let userId: string | null = null;

  try {
    // Clients
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request
    const body = await req.json().catch(() => ({}));
    const { rapperId, forceRefresh = false } = body as { rapperId?: string; forceRefresh?: boolean };

    // Auth (optional)
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAnon.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!rapperId) {
      await logAuditEvent(supabaseService, {
        rapper_id: null,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
        error_message: 'Rapper ID is required',
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: false, error: 'Rapper ID is required' }, 400);
    }

    // Load rapper row first (so we can short-circuit with cache before rate-limiting)
    const { data: rapper, error: rapperErr } = await supabaseService
      .from('rappers')
      .select('id, name, musicbrainz_id, discography_last_updated')
      .eq('id', rapperId)
      .single();

    if (rapperErr || !rapper) {
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
        error_message: 'Rapper not found',
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: false, error: 'Rapper not found' }, 404);
    }

    const fresh = rapper.discography_last_updated
      && new Date(rapper.discography_last_updated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1) Return cached immediately if fresh and not forced
    if (!forceRefresh && fresh) {
      const payload = await readDiscographyPayload(supabaseService, rapperId);
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'SUCCESS_CACHED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
      response_data: { albums: payload.discography.length },
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: true, cached: true, ...payload });
    }

    // 2) De-dupe calls within 10 minutes: if a successful attempt was logged recently, return current DB
    if (!forceRefresh) {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: recentLogs } = await supabaseService
        .from('musicbrainz_audit_logs')
        .select('id, status, created_at')
        .eq('rapper_id', rapperId)
        .gte('created_at', tenMinutesAgo)
        .in('status', ['SUCCESS', 'SUCCESS_CACHED']);
      if ((recentLogs?.length || 0) > 0) {
        const payload = await readDiscographyPayload(supabaseService, rapperId);
        await logAuditEvent(supabaseService, {
          rapper_id: rapperId,
          action: 'FETCH_DISCOGRAPHY',
          status: 'SUCCESS_DEDUP',
          user_id: userId,
          ip_address: clientIP,
          user_agent: userAgent,
          request_data: body,
          response_data: { albums: payload.discography.length },
          execution_time_ms: Date.now() - startTime,
        });
        return json({ success: true, cached: true, ...payload });
      }
    }

    // 3) Only now check rate limit (so affordable cache hits don't consume it)
    const { data: rateOk } = await supabaseService.rpc('check_musicbrainz_rate_limit', {
      p_user_id: userId,
      p_ip_address: clientIP,
      p_max_requests: 10,
      p_window_minutes: 60,
    });
    if (!rateOk) {
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'RATE_LIMITED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
        error_message: 'Rate limit exceeded',
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, 429);
    }

    // Resolve MusicBrainz artist id (robust alias-aware search)
    let musicbrainzId = rapper.musicbrainz_id as string | null;
    if (!musicbrainzId) {
      musicbrainzId = await resolveArtistId(rapper.name);
      if (musicbrainzId) {
        await supabaseService.from('rappers').update({ musicbrainz_id: musicbrainzId }).eq('id', rapperId);
      }
    }

    if (!musicbrainzId) {
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
        error_message: 'Artist not found on MusicBrainz',
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: false, error: 'Artist not found on MusicBrainz', discography: [] }, 404);
    }

// Fetch artist details (labels and lifespan via relations)
    const artistData = await mbJson<MusicBrainzArtist>(`https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=aliases+label-rels&fmt=json`);

    const careerStartYear = artistData['life-span']?.begin ? parseInt(artistData['life-span'].begin.substring(0, 4)) : null;
    const careerEndYear = artistData['life-span']?.end ? parseInt(artistData['life-span'].end.substring(0, 4)) : null;

    await supabaseService
      .from('rappers')
      .update({
        career_start_year: careerStartYear,
        career_end_year: careerEndYear,
        discography_last_updated: new Date().toISOString(),
      })
      .eq('id', rapperId);

    // Upsert labels from artist relations
    const labelRels = (artistData.relations || []).filter((r) => r['target-type'] === 'label' && r.label?.id && r.label?.name);
    if (labelRels.length) {
      for (const rel of labelRels) {
        const mbId = rel.label!.id;
        const name = rel.label!.name;

        const { data: existingLabel } = await supabaseService
          .from('record_labels')
          .select('id')
          .eq('musicbrainz_id', mbId)
          .single();
        let labelId = existingLabel?.id as string | undefined;
        if (!labelId) {
          const { data: newLabel } = await supabaseService
            .from('record_labels')
            .insert({ name, musicbrainz_id: mbId })
            .select('id')
            .single();
          labelId = newLabel?.id;
        }
        if (labelId) {
          const beginYear = rel.begin ? parseInt(rel.begin.substring(0, 4)) : null;
          const endYear = rel.end ? parseInt(rel.end.substring(0, 4)) : null;

          const { data: existingAff } = await supabaseService
            .from('rapper_labels')
            .select('id')
            .eq('rapper_id', rapperId)
            .eq('label_id', labelId)
            .single();
          if (!existingAff) {
            await supabaseService.from('rapper_labels').insert({
              rapper_id: rapperId,
              label_id: labelId,
              start_year: beginYear,
              end_year: endYear,
              is_current: !endYear,
            });
          }
        }
        await delay(100);
      }
    }

// Fetch albums and EPs separately (fixed - removed invalid inc=releases parameter)
    const rgAlbums = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=album&fmt=json&limit=100&offset=0`);
    await delay(150);
    const rgEps = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=ep&fmt=json&limit=100&offset=0`);
    const releaseGroups: MusicBrainzReleaseGroup[] = [
      ...(rgAlbums['release-groups'] || []),
      ...(rgEps['release-groups'] || []),
    ];

    for (const rg of releaseGroups.slice(0, 50)) {
      const primaryType = rg['primary-type'];
      const secondary = rg['secondary-types'] || [];
      const isSingle = primaryType === 'Single' || secondary.includes('Single');
      if (isSingle) continue;

      const isMixtape = secondary.some((t) => t.toLowerCase().includes('mixtape'));
      const releaseType = isMixtape ? 'mixtape' : 'album';

      const { data: existingAlbum } = await supabaseService
        .from('albums')
        .select('id')
        .eq('musicbrainz_id', rg.id)
        .single();
      let albumId = existingAlbum?.id as string | undefined;
      if (!albumId) {
        // Note: track_count and label info not available without inc=releases
        // Using available data from release-group only
        const { data: newAlbum } = await supabaseService
          .from('albums')
          .insert({
            title: rg.title,
            musicbrainz_id: rg.id,
            release_date: rg['first-release-date'] || null,
            release_type: releaseType,
            track_count: null, // Not available without inc=releases
          })
          .select('id')
          .single();
        albumId = newAlbum?.id;
      }

      // Label info not available without inc=releases - skip label processing

      if (albumId) {
        await supabaseService
          .from('rapper_albums')
          .upsert({ rapper_id: rapperId, album_id: albumId, role: 'primary' }, { onConflict: 'rapper_id,album_id' });
      }
      await delay(150);
    }


    // Final payload
    const payload = await readDiscographyPayload(supabaseService, rapperId);
    await logAuditEvent(supabaseService, {
      rapper_id: rapperId,
      action: 'FETCH_DISCOGRAPHY',
      status: 'SUCCESS',
      user_id: userId,
      ip_address: clientIP,
      user_agent: userAgent,
      request_data: body,
      response_data: { albums: payload.discography.length, musicbrainz_id: musicbrainzId },
      execution_time_ms: Date.now() - startTime,
    });
    return json({ success: true, cached: false, ...payload });
  } catch (error: any) {
    console.error('Error in fetch-rapper-discography:', error);
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      await logAuditEvent(supabaseService, {
        rapper_id: null,
        action: 'FETCH_DISCOGRAPHY',
        status: 'ERROR',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: null,
        error_message: error?.message || 'Unknown error',
        execution_time_ms: Date.now() - startTime,
      });
    } catch {}
    return json({ success: false, error: 'Failed to fetch discography data', discography: [] }, 500);
  }
});

// Utilities
async function logAuditEvent(supabase: any, eventData: any) {
  try {
    await supabase.from('musicbrainz_audit_logs').insert({
      rapper_id: eventData.rapper_id,
      action: eventData.action,
      status: eventData.status,
      user_id: eventData.user_id,
      ip_address: eventData.ip_address,
      user_agent: eventData.user_agent,
      request_data: eventData.request_data,
      response_data: eventData.response_data,
      error_message: eventData.error_message,
      execution_time_ms: eventData.execution_time_ms,
    });
  } catch (e) {
    console.error('Failed to log audit event:', e);
  }
}

async function readDiscographyPayload(supabaseService: any, rapperId: string) {
  const { data: discography } = await supabaseService
    .from('rapper_albums')
    .select(`
      id,
      role,
      album:albums (
        id,
        title,
        release_date,
        release_type,
        cover_art_url,
        track_count,
        label:record_labels ( id, name )
      )
    `)
    .eq('rapper_id', rapperId);

  return { discography: discography || [] };
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/^the\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveArtistId(artistName: string): Promise<string | null> {
  // Exact + alias-aware search (encode full query)
  const search = encodeURIComponent(`artist:"${artistName}"`);
  const url = `https://musicbrainz.org/ws/2/artist?query=${search}&fmt=json&limit=10&inc=aliases`;
  const data = await mbJson<any>(url);
  const artists: MusicBrainzArtist[] = data.artists || [];

  const target = normalizeName(artistName);

  // 1) Exact normalized name match
  const exact = artists.find(a => normalizeName(a.name) === target);
  if (exact) return exact.id;

  // 2) Match any alias exactly (normalized)
  for (const a of artists) {
    for (const al of a.aliases || []) {
      if (normalizeName(al.name) === target) return a.id;
    }
  }

  // 3) Fallback: highest score
  let best: MusicBrainzArtist | undefined = undefined;
  for (const a of artists) {
    if (!best || (a.score || 0) > (best.score || 0)) best = a;
  }
  return best?.id || null;
}

async function mbJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RapperHierarchy/1.1 (https://rapperhierarchy.com; contact@rapperhierarchy.com)',
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MusicBrainz API error ${res.status} ${res.statusText} for ${url} - ${text?.slice(0,200)}`);
  }
  return await res.json() as T;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
