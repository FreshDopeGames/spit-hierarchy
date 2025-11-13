import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Check if user is admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { batchSize = 10, startFromIndex = 0 } = await req.json();

    console.log(`[bulk-fetch-album-tracks] Starting bulk fetch, batch size: ${batchSize}, start index: ${startFromIndex}`);

    // Get albums that need track fetching (track_count IS NULL and has MusicBrainz ID)
    const { data: albums, error: fetchError } = await supabaseClient
      .from('albums')
      .select('id, title, musicbrainz_id')
      .not('musicbrainz_id', 'is', null)
      .is('track_count', null)
      .order('title')
      .range(startFromIndex, startFromIndex + batchSize - 1);

    if (fetchError) {
      console.error('[bulk-fetch-album-tracks] Error fetching albums:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch albums', details: fetchError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (!albums || albums.length === 0) {
      console.log('[bulk-fetch-album-tracks] No albums found to process');
      return new Response(
        JSON.stringify({
          success: true,
          completed: true,
          results: {
            processed: 0,
            successful: 0,
            failed: 0,
            skipped: 0,
            errors: [],
            processedInBatch: 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[bulk-fetch-album-tracks] Processing ${albums.length} albums`);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ album: string; error: string }>,
      processedInBatch: albums.length,
    };

    // Process each album with delay to respect MusicBrainz rate limits
    for (const album of albums) {
      try {
        console.log(`[bulk-fetch-album-tracks] Processing album: ${album.title} (${album.id})`);

        // Call fetch-album-tracks edge function
        const { data, error } = await supabaseClient.functions.invoke('fetch-album-tracks', {
          body: { albumId: album.id, forceRefresh: false },
        });

        results.processed++;

        if (error) {
          console.error(`[bulk-fetch-album-tracks] Error for ${album.title}:`, error);
          results.failed++;
          results.errors.push({
            album: album.title,
            error: error.message || 'Unknown error',
          });
        } else if (data.skipped) {
          results.skipped++;
          console.log(`[bulk-fetch-album-tracks] Skipped ${album.title} (tracks already exist)`);
        } else if (data.success) {
          results.successful++;
          console.log(`[bulk-fetch-album-tracks] Successfully fetched tracks for ${album.title}`);
        } else {
          results.failed++;
          results.errors.push({
            album: album.title,
            error: data.error || 'Unknown error',
          });
        }

        // Wait 1.5 seconds between requests to respect MusicBrainz rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`[bulk-fetch-album-tracks] Unexpected error for ${album.title}:`, error);
        results.processed++;
        results.failed++;
        results.errors.push({
          album: album.title,
          error: error.message || 'Unexpected error',
        });
      }
    }

    // Check if there are more albums to process
    const { count: remainingCount } = await supabaseClient
      .from('albums')
      .select('*', { count: 'exact', head: true })
      .not('musicbrainz_id', 'is', null)
      .is('track_count', null);

    const completed = (remainingCount || 0) === 0;

    console.log(`[bulk-fetch-album-tracks] Batch complete. Processed: ${results.processed}, Successful: ${results.successful}, Failed: ${results.failed}, Remaining: ${remainingCount || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        completed,
        results,
        remaining: remainingCount || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[bulk-fetch-album-tracks] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
