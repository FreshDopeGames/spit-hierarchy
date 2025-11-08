import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkUpdateRequest {
  batchSize?: number;
  startFromIndex?: number;
}

interface UpdateResult {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { batchSize = 10, startFromIndex = 0 }: BulkUpdateRequest = await req.json();

    console.log(`[Bulk Social Links Update] Starting batch update with batch size: ${batchSize}, starting from index: ${startFromIndex}`);

    // Fetch rappers with MusicBrainz IDs
    const { data: rappers, error: fetchError } = await supabase
      .from('rappers')
      .select('id, name, musicbrainz_id, instagram_handle, homepage_url, spotify_id')
      .not('musicbrainz_id', 'is', null)
      .order('name')
      .range(startFromIndex, startFromIndex + batchSize - 1);

    if (fetchError) {
      console.error('[Bulk Social Links Update] Error fetching rappers:', fetchError);
      throw new Error(`Failed to fetch rappers: ${fetchError.message}`);
    }

    if (!rappers || rappers.length === 0) {
      console.log('[Bulk Social Links Update] No more rappers to process');
      return new Response(
        JSON.stringify({
          processed: 0,
          successful: 0,
          failed: 0,
          skipped: 0,
          errors: [],
          progress: {
            current: startFromIndex,
            total: startFromIndex,
            percentage: 100,
          },
          completed: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total count for progress tracking
    const { count: totalCount } = await supabase
      .from('rappers')
      .select('*', { count: 'exact', head: true })
      .not('musicbrainz_id', 'is', null);

    const result: UpdateResult = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      progress: {
        current: startFromIndex + rappers.length,
        total: totalCount || 0,
        percentage: Math.round(((startFromIndex + rappers.length) / (totalCount || 1)) * 100),
      },
    };

    console.log(`[Bulk Social Links Update] Processing ${rappers.length} rappers (${startFromIndex + 1} to ${startFromIndex + rappers.length} of ${totalCount})`);

    // Process each rapper
    for (const rapper of rappers) {
      result.processed++;

      try {
        console.log(`[${rapper.name}] Fetching social links from MusicBrainz ID: ${rapper.musicbrainz_id}`);

        // Fetch artist data with URL relations only (much faster than full discography)
        const mbUrl = `https://musicbrainz.org/ws/2/artist/${rapper.musicbrainz_id}?inc=url-rels&fmt=json`;
        const mbResponse = await fetch(mbUrl, {
          headers: {
            'User-Agent': 'RapperRankingPlatform/1.0 (https://rapperrankings.com)',
            'Accept': 'application/json',
          },
        });

        if (!mbResponse.ok) {
          if (mbResponse.status === 404) {
            console.log(`[${rapper.name}] Artist not found in MusicBrainz`);
            result.skipped++;
            continue;
          }
          throw new Error(`MusicBrainz API error: ${mbResponse.status} ${mbResponse.statusText}`);
        }

        const artistData = await mbResponse.json();

        // Extract social media handles and homepage from URL relationships
        const urlRels = (artistData.relations || []).filter((r: any) => r.url);
        let instagramHandle: string | null = null;
        let homepageUrl: string | null = null;
        let spotifyId: string | null = null;

        for (const rel of urlRels) {
          const url = rel.url?.resource || '';
          const relType = rel.type || '';

          // Extract Instagram handle (only from social network relations)
          if (relType === 'social network' && url.includes('instagram.com/') && !instagramHandle) {
            const match = url.match(/instagram\.com\/([^\/\?]+)/);
            if (match && match[1]) {
              instagramHandle = match[1].replace('@', '');
            }
          }

          // Extract official homepage (type = 'official homepage')
          if (relType === 'official homepage' && !homepageUrl) {
            homepageUrl = url;
          }

          // Extract Spotify ID (from streaming music or social network relations)
          if (url.includes('open.spotify.com/artist/') && !spotifyId) {
            const match = url.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/);
            if (match && match[1]) {
              spotifyId = match[1];
            }
          }
        }

        // Prepare update data - only update if currently empty
        const updateData: any = {};
        let hasUpdates = false;

        if (instagramHandle && !rapper.instagram_handle) {
          updateData.instagram_handle = instagramHandle;
          hasUpdates = true;
          console.log(`[${rapper.name}] Found Instagram: ${instagramHandle}`);
        }

        if (homepageUrl && !rapper.homepage_url) {
          updateData.homepage_url = homepageUrl;
          hasUpdates = true;
          console.log(`[${rapper.name}] Found homepage: ${homepageUrl}`);
        }

        if (spotifyId && !rapper.spotify_id) {
          updateData.spotify_id = spotifyId;
          hasUpdates = true;
          console.log(`[${rapper.name}] Found Spotify ID: ${spotifyId}`);
        }

        // Update rapper if we have new data
        if (hasUpdates) {
          const { error: updateError } = await supabase
            .from('rappers')
            .update(updateData)
            .eq('id', rapper.id);

          if (updateError) {
            console.error(`[${rapper.name}] Error updating rapper:`, updateError);
            result.failed++;
            result.errors.push({
              rapper: rapper.name,
              error: `Failed to update: ${updateError.message}`,
            });
          } else {
            result.successful++;
            console.log(`[${rapper.name}] Successfully updated social links`);
          }
        } else {
          console.log(`[${rapper.name}] No new data to update (existing values preserved)`);
          result.skipped++;
        }

        // Rate limiting: 1.5 second delay between API calls
        await new Promise((resolve) => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`[${rapper.name}] Error processing:`, error);
        result.failed++;
        result.errors.push({
          rapper: rapper.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`[Bulk Social Links Update] Batch complete: ${result.successful} successful, ${result.skipped} skipped, ${result.failed} failed`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Bulk Social Links Update] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        errors: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
