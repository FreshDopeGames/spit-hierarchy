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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Authentication required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAnon.auth.getUser(token);
    userId = user?.id || null;

    if (!userId) {
      return json({ success: false, error: 'Invalid authentication' }, 401);
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseService.rpc('is_admin');
    if (!isAdmin) {
      return json({ success: false, error: 'Admin access required' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const { batchSize = 10, startFromIndex = 0 } = body as { batchSize?: number; startFromIndex?: number };

    console.log(`Starting bulk MusicBrainz ID population (batch: ${batchSize}, starting from: ${startFromIndex})`);

    // Get rappers without MusicBrainz IDs
    const { data: rappers, error: rappersError } = await supabaseService
      .from('rappers')
      .select('id, name, musicbrainz_id')
      .is('musicbrainz_id', null)
      .order('name')
      .range(startFromIndex, startFromIndex + batchSize - 1);

    if (rappersError) {
      console.error('Error fetching rappers:', rappersError);
      return json({ success: false, error: 'Failed to fetch rappers' }, 500);
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ rapper: string; error: string }>,
      progress: {
        startIndex: startFromIndex,
        batchSize,
        processedInBatch: 0
      }
    };

    if (!rappers || rappers.length === 0) {
      console.log('No rappers without MusicBrainz IDs found');
      return json({ 
        success: true, 
        message: 'No rappers need MusicBrainz ID population',
        results,
        completed: true
      });
    }

    console.log(`Processing ${rappers.length} rappers`);

    for (let i = 0; i < rappers.length; i++) {
      const rapper = rappers[i];
      results.processed++;
      results.progress.processedInBatch++;

      try {
        console.log(`Processing ${i + 1}/${rappers.length}: ${rapper.name}`);
        
        const musicbrainzId = await resolveArtistId(rapper.name);
        
        if (musicbrainzId) {
          // Update the rapper with the found MusicBrainz ID
          const { error: updateError } = await supabaseService
            .from('rappers')
            .update({ musicbrainz_id: musicbrainzId })
            .eq('id', rapper.id);

          if (updateError) {
            console.error(`Failed to update ${rapper.name}:`, updateError);
            results.failed++;
            results.errors.push({
              rapper: rapper.name,
              error: `Update failed: ${updateError.message}`
            });
          } else {
            console.log(`✓ Found and saved MusicBrainz ID for ${rapper.name}: ${musicbrainzId}`);
            results.successful++;
          }
        } else {
          console.log(`✗ No MusicBrainz ID found for ${rapper.name}`);
          results.failed++;
          results.errors.push({
            rapper: rapper.name,
            error: 'No MusicBrainz match found'
          });
        }

        // Rate limiting: wait between requests to respect MusicBrainz API
        if (i < rappers.length - 1) {
          await delay(1000); // 1 second between requests
        }

      } catch (error: any) {
        console.error(`Error processing ${rapper.name}:`, error);
        results.failed++;
        results.errors.push({
          rapper: rapper.name,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Log completion audit event
    await logAuditEvent(supabaseService, {
      rapper_id: null,
      action: 'BULK_POPULATE_MUSICBRAINZ_IDS',
      status: 'SUCCESS',
      user_id: userId,
      request_data: { batchSize, startFromIndex },
      response_data: results,
      execution_time_ms: Date.now() - startTime,
    });

    console.log(`Bulk population completed. Successful: ${results.successful}, Failed: ${results.failed}`);

    return json({
      success: true,
      message: `Processed ${results.processed} rappers. ${results.successful} successful, ${results.failed} failed.`,
      results,
      completed: rappers.length < batchSize // If we got fewer than requested, we're done
    });

  } catch (error: any) {
    console.error('Error in bulk-populate-musicbrainz-ids:', error);
    
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      await logAuditEvent(supabaseService, {
        rapper_id: null,
        action: 'BULK_POPULATE_MUSICBRAINZ_IDS',
        status: 'ERROR',
        user_id: userId,
        error_message: error?.message || 'Unknown error',
        execution_time_ms: Date.now() - startTime,
      });
    } catch {}

    return json({ success: false, error: 'Internal server error' }, 500);
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
  try {
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
  } catch (error) {
    console.error(`Error resolving artist ID for ${artistName}:`, error);
    return null;
  }
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
    throw new Error(`MusicBrainz API error ${res.status}: ${text || res.statusText}`);
  }
  return await res.json();
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}