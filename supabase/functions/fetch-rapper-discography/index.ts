import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface MusicBrainzArtist {
  id: string;
  name: string;
  'life-span'?: {
    begin?: string;
    end?: string;
  };
  labels?: Array<{
    label: {
      id: string;
      name: string;
    };
    'begin-year'?: number;
    'end-year'?: number;
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
    'label-info'?: Array<{
      label?: {
        id: string;
        name: string;
      };
    }>;
  }>;
}

interface MusicBrainzRecording {
  id: string;
  title: string;
  length?: number;
  releases?: Array<{
    id: string;
    title: string;
    date?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  let userId: string | null = null;
  
  try {
    // Create clients - service role for DB operations, anon for auth
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Parse request and validate
    const requestBody = await req.json();
    const { rapperId, forceRefresh = false } = requestBody;
    
    // Get user from auth header if present
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabaseAnon.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
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
        request_data: requestBody,
        error_message: 'Rapper ID is required',
        execution_time_ms: Date.now() - startTime
      });
      throw new Error('Rapper ID is required');
    }

    // Check rate limits
    const { data: rateLimitCheck } = await supabaseService
      .rpc('check_musicbrainz_rate_limit', {
        p_user_id: userId,
        p_ip_address: clientIP,
        p_max_requests: 10,
        p_window_minutes: 60
      });

    if (!rateLimitCheck) {
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'RATE_LIMITED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: requestBody,
        error_message: 'Rate limit exceeded',
        execution_time_ms: Date.now() - startTime
      });
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Check if discography data exists and is recent (less than 7 days old)
    const { data: rapper } = await supabaseService
      .from('rappers')
      .select('musicbrainz_id, discography_last_updated, name')
      .eq('id', rapperId)
      .single();

    if (!rapper) {
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: requestBody,
        error_message: 'Rapper not found',
        execution_time_ms: Date.now() - startTime
      });
      throw new Error('Rapper not found');
    }

    const isDataFresh = rapper.discography_last_updated && 
      new Date(rapper.discography_last_updated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (!forceRefresh && isDataFresh) {
      // Return cached data
      const { data: discographyData } = await supabaseService
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
            label:record_labels (
              id,
              name
            )
          )
        `)
        .eq('rapper_id', rapperId);

      const { data: singlesData } = await supabaseService
        .from('rapper_singles')
        .select(`
          id,
          role,
          single:singles (
            id,
            title,
            release_date,
            peak_chart_position,
            chart_country,
            duration_ms
          )
        `)
        .eq('rapper_id', rapperId)
        .limit(5);

      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'SUCCESS_CACHED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: requestBody,
        response_data: { albums: discographyData?.length || 0, singles: singlesData?.length || 0 },
        execution_time_ms: Date.now() - startTime
      });

      return new Response(JSON.stringify({
        success: true,
        cached: true,
        discography: discographyData || [],
        topSingles: singlesData || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Search for artist if no MusicBrainz ID
    let musicbrainzId = rapper.musicbrainz_id;
    if (!musicbrainzId) {
      console.log('Searching MusicBrainz for artist:', rapper.name);
      
      const searchResponse = await fetch(
        `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(rapper.name)}&fmt=json&limit=5`,
        {
          headers: {
            'User-Agent': 'RapperHierarchy/1.0 (contact@rapperhierarchy.com)',
          },
        }
      );

      if (!searchResponse.ok) {
        console.error('MusicBrainz search failed:', searchResponse.status, searchResponse.statusText);
        throw new Error(`MusicBrainz API error: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log('MusicBrainz search results:', searchData);
      
      const artists = searchData.artists || [];
      
      // Find best match - exact name match preferred
      const exactMatch = artists.find((a: any) => 
        a.name.toLowerCase() === rapper.name.toLowerCase()
      );
      
      if (exactMatch) {
        musicbrainzId = exactMatch.id;
        console.log('Found MusicBrainz ID:', musicbrainzId, 'for artist:', rapper.name);
        
        // Update rapper with MusicBrainz ID using service role
        await supabaseService
          .from('rappers')
          .update({ musicbrainz_id: musicbrainzId })
          .eq('id', rapperId);
      } else {
        console.log('No exact match found for:', rapper.name, 'Available options:', artists.map((a: any) => a.name));
      }
    }

    if (!musicbrainzId) {
      console.log('No MusicBrainz artist found for:', rapper.name);
      await logAuditEvent(supabaseService, {
        rapper_id: rapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: requestBody,
        error_message: 'Artist not found on MusicBrainz',
        execution_time_ms: Date.now() - startTime
      });
      return new Response(JSON.stringify({
        success: false,
        cached: false,
        discography: [],
        topSingles: [],
        error: 'Artist not found on MusicBrainz'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch detailed artist info
    const artistResponse = await fetch(
      `https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=labels&fmt=json`,
      {
        headers: {
          'User-Agent': 'RapperHierarchy/1.0 (contact@rapperhierarchy.com)',
        },
      }
    );

    const artistData: MusicBrainzArtist = await artistResponse.json();

    // Extract career years
    const careerStartYear = artistData['life-span']?.begin ? 
      parseInt(artistData['life-span'].begin.substring(0, 4)) : null;
    const careerEndYear = artistData['life-span']?.end ? 
      parseInt(artistData['life-span'].end.substring(0, 4)) : null;

    // Update rapper with career info using service role
    await supabaseService
      .from('rappers')
      .update({
        career_start_year: careerStartYear,
        career_end_year: careerEndYear,
        discography_last_updated: new Date().toISOString()
      })
      .eq('id', rapperId);

    // Upsert artist label affiliations
    if (artistData.labels && artistData.labels.length > 0) {
      for (const l of artistData.labels) {
        const labelMbId = l.label?.id;
        const labelName = l.label?.name;
        if (!labelMbId || !labelName) continue;

        // Find or create record label
        const { data: existingLabel } = await supabaseService
          .from('record_labels')
          .select('id')
          .eq('musicbrainz_id', labelMbId)
          .single();

        let labelId = existingLabel?.id;
        if (!labelId) {
          const { data: newLabel } = await supabaseService
            .from('record_labels')
            .insert({ name: labelName, musicbrainz_id: labelMbId })
            .select('id')
            .single();
          labelId = newLabel?.id;
        }

        if (labelId) {
          // Link rapper to label if not already linked
          const { data: existingAff } = await supabaseService
            .from('rapper_labels')
            .select('id')
            .eq('rapper_id', rapperId)
            .eq('label_id', labelId)
            .single();

          if (!existingAff) {
            await supabaseService
              .from('rapper_labels')
              .insert({
                rapper_id: rapperId,
                label_id: labelId,
                start_year: l['begin-year'] || null,
                end_year: l['end-year'] || null,
                is_current: !l['end-year']
              });
          }
        }

        // Small delay to be polite with rate limits
        await new Promise((r) => setTimeout(r, 50));
      }
    }

    // Fetch release groups (albums only; singles handled via recordings)
    const releaseGroupResponse = await fetch(
      `https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=album|ep&fmt=json&limit=100&offset=0`,
      {
        headers: {
          'User-Agent': 'RapperHierarchy/1.0 (contact@rapperhierarchy.com)',
        },
      }
    );

    const releaseGroupData = await releaseGroupResponse.json();
    const releaseGroups: MusicBrainzReleaseGroup[] = releaseGroupData['release-groups'] || [];

    // Process albums and mixtapes
    for (const rg of releaseGroups.slice(0, 50)) { // Limit to prevent rate limiting
      // Skip singles here; they are handled via recordings API below
      const primaryType = rg['primary-type'];
      const secondaryTypes = rg['secondary-types'] || [];
      const isSingle = primaryType === 'Single' || secondaryTypes.includes('Single');
      if (isSingle) continue;

      const isMixtape = secondaryTypes.some((t) => t.toLowerCase().includes('mixtape'));
      const releaseType = isMixtape ? 'mixtape' : 'album';

      // Check if album already exists using service role
      const { data: existingAlbum } = await supabaseService
        .from('albums')
        .select('id')
        .eq('musicbrainz_id', rg.id)
        .single();

      let albumId;
      if (!existingAlbum) {
        // Create new album using service role
        const { data: newAlbum } = await supabaseService
          .from('albums')
          .insert({
            title: rg.title,
            musicbrainz_id: rg.id,
            release_date: rg['first-release-date'] || null,
            release_type: releaseType,
            track_count: rg.releases?.[0]?.['track-count'] || null
          })
          .select('id')
          .single();

        albumId = newAlbum?.id;
      } else {
        albumId = existingAlbum.id;
      }

      // Try to associate album with a label if available
      const labelInfo = rg.releases?.[0]?.['label-info']?.[0]?.label;
      if (albumId && labelInfo?.id && labelInfo?.name) {
        // Find or create record label
        const { data: existingLabel } = await supabaseService
          .from('record_labels')
          .select('id')
          .eq('musicbrainz_id', labelInfo.id)
          .single();

        let labelId = existingLabel?.id;
        if (!labelId) {
          const { data: newLabel } = await supabaseService
            .from('record_labels')
            .insert({ name: labelInfo.name, musicbrainz_id: labelInfo.id })
            .select('id')
            .single();
          labelId = newLabel?.id;
        }

        if (labelId) {
          await supabaseService
            .from('albums')
            .update({ label_id: labelId })
            .eq('id', albumId);
        }
      }

      if (albumId) {
        // Link rapper to album using service role
        await supabaseService
          .from('rapper_albums')
          .upsert({
            rapper_id: rapperId,
            album_id: albumId,
            role: 'primary'
          }, {
            onConflict: 'rapper_id,album_id'
          });
      }

      // Add small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Fetch top recordings (singles)
    const recordingsResponse = await fetch(
      `https://musicbrainz.org/ws/2/recording?artist=${musicbrainzId}&fmt=json&limit=20`,
      {
        headers: {
          'User-Agent': 'RapperHierarchy/1.0 (contact@rapperhierarchy.com)',
        },
      }
    );

    const recordingsData = await recordingsResponse.json();
    const recordings: MusicBrainzRecording[] = recordingsData.recordings || [];

    // Process top 5 singles
    for (const recording of recordings.slice(0, 5)) {
      // Check if single already exists using service role
      const { data: existingSingle } = await supabaseService
        .from('singles')
        .select('id')
        .eq('musicbrainz_id', recording.id)
        .single();

      let singleId;
      if (!existingSingle) {
        // Create new single using service role
        const { data: newSingle } = await supabaseService
          .from('singles')
          .insert({
            title: recording.title,
            musicbrainz_id: recording.id,
            release_date: recording.releases?.[0]?.date || null,
            duration_ms: recording.length || null
          })
          .select('id')
          .single();

        singleId = newSingle?.id;
      } else {
        singleId = existingSingle.id;
      }

      if (singleId) {
        // Link rapper to single using service role
        await supabaseService
          .from('rapper_singles')
          .upsert({
            rapper_id: rapperId,
            single_id: singleId,
            role: 'primary'
          }, {
            onConflict: 'rapper_id,single_id'
          });
      }
    }

    // Fetch and return updated data using service role
    const { data: discographyData } = await supabaseService
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
          label:record_labels (
            id,
            name
          )
        )
      `)
      .eq('rapper_id', rapperId);

    const { data: singlesData } = await supabaseService
      .from('rapper_singles')
      .select(`
        id,
        role,
        single:singles (
          id,
          title,
          release_date,
          peak_chart_position,
          chart_country,
          duration_ms
        )
      `)
      .eq('rapper_id', rapperId)
      .limit(5);

    await logAuditEvent(supabaseService, {
      rapper_id: rapperId,
      action: 'FETCH_DISCOGRAPHY',
      status: 'SUCCESS',
      user_id: userId,
      ip_address: clientIP,
      user_agent: userAgent,
      request_data: requestBody,
      response_data: { 
        albums: discographyData?.length || 0, 
        singles: singlesData?.length || 0,
        musicbrainz_id: musicbrainzId 
      },
      execution_time_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({
      success: true,
      cached: false,
      discography: discographyData || [],
      topSingles: singlesData || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-rapper-discography:', error);
    
    // Log error to audit
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
        error_message: error.message || 'Unknown error',
        execution_time_ms: Date.now() - startTime
      });
    } catch (auditError) {
      console.error('Failed to log audit event:', auditError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      cached: false,
      discography: [],
      topSingles: [],
      error: 'Failed to fetch discography data'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to log audit events securely
async function logAuditEvent(supabase: any, eventData: any) {
  try {
    await supabase
      .from('musicbrainz_audit_logs')
      .insert({
        rapper_id: eventData.rapper_id,
        action: eventData.action,
        status: eventData.status,
        user_id: eventData.user_id,
        ip_address: eventData.ip_address,
        user_agent: eventData.user_agent,
        request_data: eventData.request_data,
        response_data: eventData.response_data,
        error_message: eventData.error_message,
        execution_time_ms: eventData.execution_time_ms
      });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}