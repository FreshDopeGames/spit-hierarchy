import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MusicBrainzTrack {
  position: number;
  recording: {
    id: string;
    title: string;
    length?: number;
  };
}

interface MusicBrainzRelease {
  id: string;
  status: string;
  'track-count': number;
  media: Array<{
    format?: string;
    tracks: MusicBrainzTrack[];
  }>;
}

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

    const { albumId, forceRefresh = false } = await req.json();

    if (!albumId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Album ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[fetch-album-tracks] Processing album: ${albumId}, forceRefresh: ${forceRefresh}`);

    // Check if tracks already exist (skip if not forcing refresh)
    if (!forceRefresh) {
      const { data: existingTracks, error: checkError } = await supabaseClient
        .from('album_tracks')
        .select('id')
        .eq('album_id', albumId)
        .limit(1);

      if (checkError) {
        console.error('[fetch-album-tracks] Error checking existing tracks:', checkError);
      } else if (existingTracks && existingTracks.length > 0) {
        console.log('[fetch-album-tracks] Tracks already exist for this album, skipping fetch');
        return new Response(
          JSON.stringify({ success: true, message: 'Tracks already exist', skipped: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get album's MusicBrainz release-group ID
    const { data: album, error: albumError } = await supabaseClient
      .from('albums')
      .select('id, title, musicbrainz_id')
      .eq('id', albumId)
      .single();

    if (albumError || !album) {
      console.error('[fetch-album-tracks] Album not found:', albumError);
      return new Response(
        JSON.stringify({ success: false, error: 'Album not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!album.musicbrainz_id) {
      console.log('[fetch-album-tracks] Album has no MusicBrainz ID');
      // Update track_count to 0 to indicate processing was attempted
      await supabaseClient
        .from('albums')
        .update({ track_count: 0 })
        .eq('id', albumId);
      
      return new Response(
        JSON.stringify({ success: false, error: 'Album has no MusicBrainz ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch releases for this release-group from MusicBrainz
    console.log(`[fetch-album-tracks] Fetching releases for MusicBrainz ID: ${album.musicbrainz_id}`);
    
    // Helper to fetch releases with optional status filter
    const fetchReleases = async (statusFilter: string | null) => {
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `https://musicbrainz.org/ws/2/release?release-group=${album.musicbrainz_id}${statusParam}&fmt=json&inc=recordings`,
        {
          headers: {
            'User-Agent': 'SpitHierarchy/1.0 (https://spithierarchy.com)',
            'Accept': 'application/json',
          },
        }
      );
      return response;
    };

    // Try official releases first
    let mbResponse = await fetchReleases('official');
    
    if (!mbResponse.ok) {
      console.error(`[fetch-album-tracks] MusicBrainz API error: ${mbResponse.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `MusicBrainz API error: ${mbResponse.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
      );
    }

    let mbData = await mbResponse.json();

    // If no official releases, try without status filter (catches bootlegs, promos, etc.)
    if (!mbData.releases || mbData.releases.length === 0) {
      console.log('[fetch-album-tracks] No official releases found, trying all releases...');
      
      // Wait 1.1s for MusicBrainz rate limit
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      mbResponse = await fetchReleases(null);
      
      if (mbResponse.ok) {
        mbData = await mbResponse.json();
        console.log(`[fetch-album-tracks] Found ${mbData.releases?.length || 0} releases without status filter`);
      }
    }

    if (!mbData.releases || mbData.releases.length === 0) {
      console.log('[fetch-album-tracks] No releases found at all');
      // Update track_count to 0
      await supabaseClient
        .from('albums')
        .update({ track_count: 0 })
        .eq('id', albumId);
      
      return new Response(
        JSON.stringify({ success: false, error: 'No releases found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Choose the best release (prefer CD/Digital with most tracks)
    const bestRelease = mbData.releases.reduce((best: MusicBrainzRelease | null, current: MusicBrainzRelease) => {
      if (!best) return current;
      
      const currentHasPreferredFormat = current.media?.some(m => 
        m.format === 'CD' || m.format === 'Digital Media'
      );
      const bestHasPreferredFormat = best.media?.some(m => 
        m.format === 'CD' || m.format === 'Digital Media'
      );

      if (currentHasPreferredFormat && !bestHasPreferredFormat) return current;
      if (!currentHasPreferredFormat && bestHasPreferredFormat) return best;

      return current['track-count'] > best['track-count'] ? current : best;
    }, null);

    if (!bestRelease || !bestRelease.media) {
      console.log('[fetch-album-tracks] No suitable release found');
      await supabaseClient
        .from('albums')
        .update({ track_count: 0 })
        .eq('id', albumId);
      
      return new Response(
        JSON.stringify({ success: false, error: 'No suitable release found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`[fetch-album-tracks] Selected release with ${bestRelease['track-count']} tracks`);

    // Extract and flatten tracks from all media (discs)
    const allTracks: Array<{
      album_id: string;
      track_number: number;
      title: string;
      duration_ms: number | null;
      musicbrainz_id: string;
    }> = [];

    let trackPosition = 1;
    for (const medium of bestRelease.media) {
      if (!medium.tracks) continue;
      
      for (const track of medium.tracks) {
        allTracks.push({
          album_id: albumId,
          track_number: trackPosition,
          title: track.recording.title,
          duration_ms: track.recording.length || null,
          musicbrainz_id: track.recording.id,
        });
        trackPosition++;
      }
    }

    if (allTracks.length === 0) {
      console.log('[fetch-album-tracks] No tracks found in release');
      await supabaseClient
        .from('albums')
        .update({ track_count: 0 })
        .eq('id', albumId);
      
      return new Response(
        JSON.stringify({ success: false, error: 'No tracks found in release' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`[fetch-album-tracks] Inserting ${allTracks.length} tracks`);

    // Delete existing tracks if force refresh
    if (forceRefresh) {
      const { error: deleteError } = await supabaseClient
        .from('album_tracks')
        .delete()
        .eq('album_id', albumId);

      if (deleteError) {
        console.error('[fetch-album-tracks] Error deleting old tracks:', deleteError);
      }
    }

    // Insert tracks
    const { error: insertError } = await supabaseClient
      .from('album_tracks')
      .insert(allTracks);

    if (insertError) {
      console.error('[fetch-album-tracks] Error inserting tracks:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to insert tracks', details: insertError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update album track_count
    const { error: updateError } = await supabaseClient
      .from('albums')
      .update({ track_count: allTracks.length })
      .eq('id', albumId);

    if (updateError) {
      console.error('[fetch-album-tracks] Error updating track_count:', updateError);
    }

    console.log(`[fetch-album-tracks] Successfully added ${allTracks.length} tracks for album ${albumId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Tracks fetched and added successfully',
        track_count: allTracks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fetch-album-tracks] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
