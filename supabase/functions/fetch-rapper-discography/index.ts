import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://xzcmkssadekswmiqfbff.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Y21rc3NhZGVrc3dtaXFmYmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjQ0NDksImV4cCI6MjA2MzY0MDQ0OX0.j8BSOA66HYYFHg73ntnewGSf9xByQZ-9PHlR2JTRNQM";

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

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { rapperId, forceRefresh = false } = await req.json();

    if (!rapperId) {
      throw new Error('Rapper ID is required');
    }

    // Check if discography data exists and is recent (less than 7 days old)
    const { data: rapper } = await supabase
      .from('rappers')
      .select('musicbrainz_id, discography_last_updated, name')
      .eq('id', rapperId)
      .single();

    if (!rapper) {
      throw new Error('Rapper not found');
    }

    const isDataFresh = rapper.discography_last_updated && 
      new Date(rapper.discography_last_updated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (!forceRefresh && isDataFresh) {
      // Return cached data
      const { data: discographyData } = await supabase
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

      const { data: singlesData } = await supabase
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
      const searchResponse = await fetch(
        `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(rapper.name)}&fmt=json&limit=5`,
        {
          headers: {
            'User-Agent': 'RapperHierarchy/1.0 (contact@rapperhierarchy.com)',
          },
        }
      );

      const searchData = await searchResponse.json();
      const artists = searchData.artists || [];
      
      // Find best match - exact name match preferred
      const exactMatch = artists.find((a: any) => 
        a.name.toLowerCase() === rapper.name.toLowerCase()
      );
      
      if (exactMatch) {
        musicbrainzId = exactMatch.id;
        
        // Update rapper with MusicBrainz ID
        await supabase
          .from('rappers')
          .update({ musicbrainz_id: musicbrainzId })
          .eq('id', rapperId);
      }
    }

    if (!musicbrainzId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not find MusicBrainz artist'
      }), {
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

    // Update rapper with career info
    await supabase
      .from('rappers')
      .update({
        career_start_year: careerStartYear,
        career_end_year: careerEndYear,
        discography_last_updated: new Date().toISOString()
      })
      .eq('id', rapperId);

    // Fetch release groups (albums)
    const releaseGroupResponse = await fetch(
      `https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=album|single&fmt=json&limit=100&offset=0`,
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
      const releaseType = rg['primary-type'] === 'Album' ? 'album' : 
                         rg['secondary-types']?.includes('Mixtape') ? 'mixtape' : 'album';

      // Check if album already exists
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('musicbrainz_id', rg.id)
        .single();

      let albumId;
      if (!existingAlbum) {
        // Create new album
        const { data: newAlbum } = await supabase
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

      if (albumId) {
        // Link rapper to album
        await supabase
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
      // Check if single already exists
      const { data: existingSingle } = await supabase
        .from('singles')
        .select('id')
        .eq('musicbrainz_id', recording.id)
        .single();

      let singleId;
      if (!existingSingle) {
        // Create new single
        const { data: newSingle } = await supabase
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
        // Link rapper to single
        await supabase
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

    // Fetch and return updated data
    const { data: discographyData } = await supabase
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

    const { data: singlesData } = await supabase
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
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});