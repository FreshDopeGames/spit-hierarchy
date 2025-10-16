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
    url?: { resource: string };
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
    status?: string;  // 'Official', 'Bootleg', 'Promotion', 'Pseudo-Release'
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
  let requestedRapperId: string | null = null; // Hoist to avoid NULL violations in audit logs

  try {
    // Clients
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Parse request
    const body = await req.json().catch(() => ({}));
    const { rapperId, forceRefresh = false } = body as { rapperId?: string; forceRefresh?: boolean };
    requestedRapperId = rapperId || null; // Capture for audit logging

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
      .select('id, name, musicbrainz_id, discography_last_updated, instagram_handle, twitter_handle')
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

    // 2) De-dupe calls within 10 minutes - UNCONDITIONAL (runs even with forceRefresh)
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

    // 3) Check if user is admin - admins bypass rate limit
    let isAdmin = false;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: adminCheck, error: adminError } = await supabaseUser.rpc('is_admin');
      isAdmin = !adminError && adminCheck === true;
    }

    // 4) Check rate limit (admins skip this)
    if (!isAdmin) {
      const { data: rateOk } = await supabaseService.rpc('check_musicbrainz_rate_limit', {
        p_user_id: userId,
        p_ip_address: clientIP,
        p_max_requests: 10,
        p_window_minutes: 60,
      });
      
      if (!rateOk) {
        // Try to return cached data gracefully
        const payload = await readDiscographyPayload(supabaseService, rapperId);
        if (payload.discography.length > 0) {
          await logAuditEvent(supabaseService, {
            rapper_id: rapperId,
            action: 'FETCH_DISCOGRAPHY',
            status: 'RATE_LIMITED_CACHED',
            user_id: userId,
            ip_address: clientIP,
            user_agent: userAgent,
            request_data: body,
            response_data: { albums: payload.discography.length },
            execution_time_ms: Date.now() - startTime,
          });
          return json({ 
            success: true, 
            cached: true, 
            rate_limited: true,
            message: 'Rate limit exceeded — returning cached results',
            ...payload 
          });
        }
        
        // No cached data available, return 429
        await logAuditEvent(supabaseService, {
          rapper_id: rapperId,
          action: 'FETCH_DISCOGRAPHY',
          status: 'RATE_LIMITED',
          user_id: userId,
          ip_address: clientIP,
          user_agent: userAgent,
          request_data: body,
          error_message: 'Rate limit exceeded, no cache available',
          execution_time_ms: Date.now() - startTime,
        });
        return json({ success: false, error: 'Rate limit exceeded. Please try again later.' }, 429);
      }
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

// Fetch artist details (labels, lifespan, and URLs via relations)
    const artistData = await mbJson<MusicBrainzArtist>(`https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=aliases+label-rels+url-rels&fmt=json`);

    const careerStartYear = artistData['life-span']?.begin ? parseInt(artistData['life-span'].begin.substring(0, 4)) : null;
    const careerEndYear = artistData['life-span']?.end ? parseInt(artistData['life-span'].end.substring(0, 4)) : null;

    // Extract social media handles from URL relationships
    const urlRels = (artistData.relations || []).filter((r) => r.type === 'social network' && r.url);
    let instagramHandle: string | null = null;
    let twitterHandle: string | null = null;

    for (const rel of urlRels) {
      const url = rel.url?.resource || '';
      
      // Extract Instagram handle
      if (url.includes('instagram.com/') && !instagramHandle) {
        const match = url.match(/instagram\.com\/([^\/\?]+)/);
        if (match && match[1]) {
          instagramHandle = match[1].replace('@', '');
        }
      }
      
      // Extract Twitter handle (both twitter.com and x.com)
      if ((url.includes('twitter.com/') || url.includes('x.com/')) && !twitterHandle) {
        const match = url.match(/(?:twitter|x)\.com\/([^\/\?]+)/);
        if (match && match[1]) {
          twitterHandle = match[1].replace('@', '');
        }
      }
    }

    // Only update social handles if they're currently empty (preserve manual entries)
    const updateData: any = {
      career_start_year: careerStartYear,
      career_end_year: careerEndYear,
      discography_last_updated: new Date().toISOString(),
    };

    if (instagramHandle && !rapper.instagram_handle) {
      updateData.instagram_handle = instagramHandle;
    }
    
    if (twitterHandle && !rapper.twitter_handle) {
      updateData.twitter_handle = twitterHandle;
    }

    await supabaseService
      .from('rappers')
      .update(updateData)
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

// Fetch albums and EPs separately (without inc=releases to avoid API errors)
    let rgAlbums: any;
    let rgEps: any;
    
    try {
      rgAlbums = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=album&fmt=json&limit=100&offset=0`);
      await delay(150);
      rgEps = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=ep&fmt=json&limit=100&offset=0`);
    } catch (mbError: any) {
      console.error('MusicBrainz API error:', mbError);
      await logAuditEvent(supabaseService, {
        rapper_id: requestedRapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'FAILED',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: body,
        error_message: `MusicBrainz API error: ${mbError.message}`,
        execution_time_ms: Date.now() - startTime,
      });
      return json({ success: false, error: `MusicBrainz API error: ${mbError.message}`, discography: [] }, 500);
    }
    // Combine and sort by release date (oldest first)
    const releaseGroups: MusicBrainzReleaseGroup[] = [
      ...(rgAlbums?.['release-groups'] || []),
      ...(rgEps?.['release-groups'] || []),
    ].sort((a, b) => {
      const dateA = a['first-release-date'] || '9999';
      const dateB = b['first-release-date'] || '9999';
      return dateA.localeCompare(dateB);
    });

    console.log(`Processing ${releaseGroups.length} release groups for ${rapper.name}`);

    // Process all release groups (removed .slice(0, 50) limit)
    for (const rg of releaseGroups) {
      try {
        const primaryType = rg['primary-type'];
        const secondary = rg['secondary-types'] || [];
      
      // Skip singles
      const isSingle = primaryType === 'Single' || secondary.includes('Single');
      if (isSingle) continue;

      // Require release date
      if (!rg['first-release-date']) {
        console.log(`Skipping "${rg.title}" - no release date`);
        continue;
      }

      // Fetch detailed release-group info to check official status and get streaming links
      let rgDetails: any;
      try {
        rgDetails = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group/${rg.id}?inc=releases+url-rels&fmt=json`);
        await delay(120);
      } catch (detailError: any) {
        console.error(`Error fetching details for "${rg.title}":`, detailError);
        // Skip if we can't verify official status - be conservative
        console.log(`Skipping "${rg.title}" - cannot verify official status (API error)`);
        continue;
      }

      // Only include officially released albums - be strict about status
      const releases = rgDetails?.releases || [];
      if (releases.length === 0) {
        // If no release data available, be conservative and skip
        console.log(`Skipping "${rg.title}" - no release status data available`);
        continue;
      }
      
      // Check if there's at least one Official release
      const hasOfficialRelease = releases.some((release: any) => 
        release && release.status === 'Official'
      );
      
      // Skip if no official releases found
      if (!hasOfficialRelease) {
        const statusList = releases.map((r: any) => r?.status || 'Unknown').join(', ');
        console.log(`Skipping "${rg.title}" - no official releases (statuses: ${statusList})`);
        continue;
      }
      
      console.log(`Including "${rg.title}" - has official release`);

      // Exclude non-studio releases and unofficial types
      const excludedSecondaryTypes = [
        'Compilation',  // Greatest hits, collections
        'Live',         // Concert recordings
        'Remix',        // Remix albums
        'Soundtrack',   // Movie/game soundtracks
        'DJ-mix',       // DJ mixtapes
        'Spokenword',   // Audiobooks, poetry
        'Interview',    // Interview albums
        'Demo',         // Demo recordings
        'Audio drama'   // Audio dramas/plays
      ];
      
      const hasExcludedType = secondary.some(type => excludedSecondaryTypes.includes(type));
      if (hasExcludedType) {
        console.log(`Skipping "${rg.title}" - excluded type: [${secondary.join(', ')}]`);
        continue;
      }

      // Detect mixtapes (MusicBrainz official category)
      const isMixtape = primaryType === 'Album' && secondary.includes('Mixtape/Street');
      
      // Only include Albums (not EPs) that aren't excluded
      // EPs are excluded to maintain accurate album counts
      const isValidRelease = primaryType === 'Album' && !hasExcludedType;
      
      if (!isValidRelease) {
        const reason = primaryType === 'EP' ? 'EP excluded from albums' : `primary-type: ${primaryType}`;
        console.log(`Skipping "${rg.title}" - ${reason}`);
        continue;
      }

      const releaseType = isMixtape ? 'mixtape' : 'album';

      const { data: existingAlbum } = await supabaseService
        .from('albums')
        .select('id, has_cover_art')
        .eq('musicbrainz_id', rg.id)
        .single();
      let albumId = existingAlbum?.id as string | undefined;
      if (!albumId) {
        // Extract streaming links from the release-group details we already fetched
        const rels: Array<any> = rgDetails?.relations || [];
        const findByHost = (host: string) => rels.find((r: any) => r?.url?.resource?.includes(host))?.url?.resource;
        const spotify = findByHost('open.spotify.com');
        const apple = findByHost('music.apple.com');
        const deezer = findByHost('deezer.com');
        const ytmusic = findByHost('music.youtube.com') || findByHost('youtube.com');

        const streamingLinks = {
          ...(spotify ? { spotify } : {}),
          ...(apple ? { apple_music: apple } : {}),
          ...(deezer ? { deezer } : {}),
          ...(ytmusic ? { youtube_music: ytmusic } : {}),
        };

        // Generate external references (no direct cover art stored)
        const externalLinks = {
          musicbrainz: `https://musicbrainz.org/release-group/${rg.id}`,
          coverartarchive: `https://coverartarchive.org/release-group/${rg.id}`,
          ...streamingLinks,
        };
        
        // Verify cover art exists before storing URL
        const coverArtUrl = `https://coverartarchive.org/release-group/${rg.id}/front-500`;
        const hasCoverArt = await checkCoverArtExists(coverArtUrl);
        await delay(100); // Small delay after cover art check to avoid rate limiting
        
        const { data: newAlbum } = await supabaseService
          .from('albums')
          .insert({
            title: rg.title,
            musicbrainz_id: rg.id,
            release_date: rg['first-release-date'] || null,
            release_type: releaseType,
            track_count: null, // Not available without inc=releases
            cover_art_url: hasCoverArt ? coverArtUrl : null,
            has_cover_art: hasCoverArt,
            external_cover_links: externalLinks,
            cover_art_colors: null // Will be populated by future user-generated content
          })
          .select('id')
          .single();
        albumId = newAlbum?.id;
      } else if (!existingAlbum?.has_cover_art) {
        // Update existing albums that don't have cover art yet
        const coverArtUrl = `https://coverartarchive.org/release-group/${rg.id}/front-500`;
        const hasCoverArt = await checkCoverArtExists(coverArtUrl);
        await delay(100);
        
        if (hasCoverArt) {
          await supabaseService
            .from('albums')
            .update({
              cover_art_url: coverArtUrl,
              has_cover_art: true
            })
            .eq('id', albumId);
        }
      }

      // Label info not available without inc=releases - skip label processing

      if (albumId) {
        await supabaseService
          .from('rapper_albums')
          .upsert({ rapper_id: rapperId, album_id: albumId, role: 'primary' }, { onConflict: 'rapper_id,album_id' });

        // Fetch track listings if not already populated
        const { data: existingTracks } = await supabaseService
          .from('album_tracks')
          .select('id')
          .eq('album_id', albumId)
          .limit(1);

        if (!existingTracks || existingTracks.length === 0) {
          try {
            // Get the first official release ID from the release-group
            const officialRelease = releases.find((r: any) => r && r.status === 'Official');
            
            if (officialRelease?.id) {
              console.log(`Fetching tracks for "${rg.title}" (release: ${officialRelease.id})`);
              
              // Fetch release with recordings (track listings)
              const releaseData = await mbJson<any>(
                `https://musicbrainz.org/ws/2/release/${officialRelease.id}?inc=recordings&fmt=json`
              );
              await delay(150);

              // Extract tracks from all media (discs)
              const allTracks: Array<{ position: number; title: string }> = [];
              for (const media of releaseData.media || []) {
                for (const track of media.tracks || []) {
                  allTracks.push({
                    position: track.position,
                    title: track.title,
                  });
                }
              }

              // Insert tracks into database
              if (allTracks.length > 0) {
                const trackInserts = allTracks.map(track => ({
                  album_id: albumId,
                  track_number: track.position,
                  title: track.title,
                  duration_ms: null,
                  musicbrainz_id: null,
                }));

                await supabaseService
                  .from('album_tracks')
                  .insert(trackInserts);
                
                console.log(`Inserted ${allTracks.length} tracks for "${rg.title}"`);
              }
            }
          } catch (trackError: any) {
            console.error(`Error fetching tracks for "${rg.title}":`, trackError);
            // Continue processing - tracks are optional
          }
        }
      }
      await delay(150);
      } catch (albumError: any) {
        console.error(`Error processing album "${rg?.title}":`, albumError);
        // Continue processing other albums even if one fails
      }
    }


    // Final payload
    const payload = await readDiscographyPayload(supabaseService, rapperId);
    await logAuditEvent(supabaseService, {
      rapper_id: rapperId,
      action: 'FETCH_DISCOGRAPHY',
      status: isAdmin ? 'SUCCESS_ADMIN_BYPASS' : 'SUCCESS',
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
        rapper_id: requestedRapperId, // Use hoisted variable to avoid NOT NULL violations
        action: 'FETCH_DISCOGRAPHY',
        status: 'ERROR',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: { rapperId: requestedRapperId },
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
        has_cover_art,
        cover_art_colors,
        external_cover_links,
        track_count,
        label:record_labels ( id, name )
      )
    `)
    .eq('rapper_id', rapperId);

  return { discography: discography || [] };
}

// Check if a cover art URL exists and returns a valid image
async function checkCoverArtExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'FreshDopeGames/1.0' }
    });
    return response.status === 200;
  } catch (error) {
    console.error(`Cover art check failed for ${url}:`, error);
    return false;
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
