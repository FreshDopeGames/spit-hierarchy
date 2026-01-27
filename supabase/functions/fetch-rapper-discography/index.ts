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

// Constants for resource management
const MAX_EXECUTION_TIME_MS = 50000; // 50 seconds (10s buffer before 60s timeout)
const MAX_COVER_ART_DOWNLOADS = 5; // Limit cover art caching per run
const PROGRESS_UPDATE_INTERVAL = 5; // Update progress every N albums

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
    const { rapperId, forceRefresh = false, fetchId } = body as { rapperId?: string; forceRefresh?: boolean; fetchId?: string };
    requestedRapperId = rapperId || null; // Capture for audit logging

    // Helper function to update progress
    const updateProgress = async (updates: { 
      total_releases?: number; 
      processed_releases?: number; 
      current_album?: string; 
      status?: string 
    }) => {
      if (!fetchId || !rapperId) return;
      try {
        await supabaseService.from('discography_fetch_progress')
          .upsert({
            fetch_id: fetchId,
            rapper_id: rapperId,
            ...updates,
            updated_at: new Date().toISOString()
          }, { onConflict: 'rapper_id,fetch_id' });
      } catch (e) {
        console.warn('Failed to update progress:', e);
      }
    };

    // Initialize progress tracking if fetchId provided
    if (fetchId && rapperId) {
      await supabaseService.from('discography_fetch_progress').upsert({
        fetch_id: fetchId,
        rapper_id: rapperId,
        status: 'starting',
        total_releases: 0,
        processed_releases: 0,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'rapper_id,fetch_id' });
    }

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
      .select('id, name, musicbrainz_id, discography_last_updated, instagram_handle, homepage_url, aliases')
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

    // 2) De-dupe calls within 10 minutes - BUT NOT when force refreshing
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

    // Resolve and validate MusicBrainz artist ID
    let musicbrainzId = rapper.musicbrainz_id as string | null;
    
    // Validate stored MusicBrainz ID if present
    if (musicbrainzId) {
      try {
        console.log(`Validating stored MusicBrainz ID: ${musicbrainzId} for ${rapper.name}`);
        const artistData = await mbJson<MusicBrainzArtist>(`https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=aliases&fmt=json`);
        await delay(1100);
        
        const storedArtistName = normalizeName(artistData.name);
        const rapperName = normalizeName(rapper.name);
        const rapperAliases = (rapper.aliases || []) as string[];
        
        // Check if stored ID actually matches this rapper (including both MusicBrainz aliases and rapper aliases)
        const mbAliases = (artistData.aliases || []).map(a => normalizeName(a.name));
        const allRapperNames = [rapperName, ...rapperAliases.map(a => normalizeName(a))];
        const isValidMatch = allRapperNames.some(name => 
          name === storedArtistName || mbAliases.includes(name)
        );
        
        if (!isValidMatch) {
          console.warn(`⚠ MusicBrainz ID mismatch! Stored ID "${musicbrainzId}" points to "${artistData.name}" but rapper is "${rapper.name}" with aliases [${rapperAliases.join(', ')}]`);
          
          // Try to find the correct ID including rapper aliases
          const correctMbId = await resolveArtistId(rapper.name, rapperAliases);
          
          if (correctMbId && correctMbId !== musicbrainzId) {
            console.log(`✓ Correcting MusicBrainz ID from ${musicbrainzId} to ${correctMbId}`);
            
            await supabaseService
              .from('rappers')
              .update({ musicbrainz_id: correctMbId })
              .eq('id', rapperId);
            
            musicbrainzId = correctMbId;
            
            await logAuditEvent(supabaseService, {
              rapper_id: rapperId,
              action: 'ID_MISMATCH_CORRECTED',
              status: 'SUCCESS',
              user_id: userId,
              ip_address: clientIP,
              user_agent: userAgent,
              request_data: { oldMbId: rapper.musicbrainz_id, newMbId: correctMbId, oldArtistName: artistData.name, rapperName: rapper.name },
              execution_time_ms: Date.now() - startTime,
            });
          }
        } else {
          console.log(`✓ MusicBrainz ID validation passed for ${rapper.name}`);
        }
      } catch (validationError: any) {
        console.error('Error validating MusicBrainz ID:', validationError);
        // Continue with stored ID - might still work
      }
    }
    
    // Resolve if still no ID
    if (!musicbrainzId) {
      const rapperAliases = (rapper.aliases || []) as string[];
      musicbrainzId = await resolveArtistId(rapper.name, rapperAliases);
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

    // Store birth_year (for solo) or formation year (for groups) from life-span.begin
    const birthYear = artistData['life-span']?.begin ? parseInt(artistData['life-span'].begin.substring(0, 4)) : null;
    const careerEndYear = artistData['life-span']?.end ? parseInt(artistData['life-span'].end.substring(0, 4)) : null;

    // Extract social media handles and homepage from URL relationships
    const urlRels = (artistData.relations || []).filter((r) => r.url);
    let instagramHandle: string | null = null;
    let homepageUrl: string | null = null;

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
    }

    // Prepare update data - DON'T set career_start_year from life-span (it's birth/formation year)
    const updateData: any = {
      career_end_year: careerEndYear,
      discography_last_updated: new Date().toISOString(),
    };

    // Only update birth_year if currently null (preserve manual entries)
    if (birthYear && !rapper.birth_year) {
      updateData.birth_year = birthYear;
    }

    // Only update social handles if they're currently empty (preserve manual entries)
    if (instagramHandle && !rapper.instagram_handle) {
      updateData.instagram_handle = instagramHandle;
    }
    
    // Only update homepage if currently empty
    if (homepageUrl && !rapper.homepage_url) {
      updateData.homepage_url = homepageUrl;
    }

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
        await delay(1100);
      }
    }

    // Save the updateData (including discography_last_updated) to the database
    const { error: updateError } = await supabaseService
      .from('rappers')
      .update(updateData)
      .eq('id', rapperId);
    
    if (updateError) {
      console.error('Failed to update rapper metadata:', updateError);
    } else {
      console.log(`✓ Updated rapper ${rapper.name} with discography_last_updated and metadata`);
    }

// Fetch all albums and EPs with pagination (no 100-item limit)
    const fetchAllReleaseGroups = async (type: 'album' | 'ep') => {
      let offset = 0;
      const limit = 100;
      let allReleases: any[] = [];
      
      while (true) {
        const response = await mbJson<any>(
          `https://musicbrainz.org/ws/2/release-group?artist=${musicbrainzId}&type=${type}&fmt=json&limit=${limit}&offset=${offset}`
        );
        const releases = response['release-groups'] || [];
        allReleases.push(...releases);
        
        if (releases.length < limit) break; // No more pages
        offset += limit;
        await delay(1100); // Rate limit between pages (MusicBrainz requires 1 req/sec)
      }
      
      return allReleases;
    };

    let rgAlbums: any[] = [];
    let rgEps: any[] = [];
    
    try {
      rgAlbums = await fetchAllReleaseGroups('album');
      await delay(1100);
      rgEps = await fetchAllReleaseGroups('ep');
    } catch (mbError: any) {
      console.error('MusicBrainz API error:', mbError);
      
      // Check if this is a rate limit error - return cached data gracefully
      const isRateLimit = mbError.message?.includes('503') || 
                          mbError.message?.includes('429') || 
                          mbError.message?.includes('rate limit');
      
      if (isRateLimit) {
        const payload = await readDiscographyPayload(supabaseService, rapperId);
        if (payload.discography.length > 0) {
          await logAuditEvent(supabaseService, {
            rapper_id: rapperId,
            action: 'FETCH_DISCOGRAPHY',
            status: 'MB_RATE_LIMITED_CACHED',
            user_id: userId,
            ip_address: clientIP,
            user_agent: userAgent,
            request_data: body,
            response_data: { albums: payload.discography.length },
            error_message: mbError.message,
            execution_time_ms: Date.now() - startTime,
          });
          return json({ 
            success: true, 
            cached: true, 
            rate_limited: true,
            message: 'MusicBrainz rate limited — returning cached results',
            ...payload 
          });
        }
      }
      
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
    // Combine and sort: prioritize studio albums first, then by release date (NEWEST first)
    // This ensures canonical studio albums are processed before mixtapes/EPs if we hit time limits
    const releaseGroups: MusicBrainzReleaseGroup[] = [
      // Studio albums first (sorted newest to oldest)
      ...(rgAlbums || []).sort((a, b) => {
        const dateA = a['first-release-date'] || '0000';
        const dateB = b['first-release-date'] || '0000';
        return dateB.localeCompare(dateA);
      }),
      // Then EPs (sorted newest to oldest)
      ...(rgEps || []).sort((a, b) => {
        const dateA = a['first-release-date'] || '0000';
        const dateB = b['first-release-date'] || '0000';
        return dateB.localeCompare(dateA);
      }),
    ];

    console.log(`Processing ${releaseGroups.length} release groups for ${rapper.name}`);

    // Update progress with total count
    await updateProgress({ 
      status: 'processing', 
      total_releases: releaseGroups.length,
      processed_releases: 0 
    });

    // Track valid album IDs for reconciliation
    const validAlbumIds = new Set<string>();
    let processedCount = 0;
    let coverArtDownloads = 0; // Track cover art downloads to limit per run
    let processedAllReleases = true; // Track if we processed ALL releases (for reconciliation safety)

    // Process all release groups (removed .slice(0, 50) limit)
    for (const rg of releaseGroups) {
      // ⏱️ EXECUTION TIME GUARD - prevent timeout
      const elapsedMs = Date.now() - startTime;
      if (elapsedMs > MAX_EXECUTION_TIME_MS) {
        console.warn(`⚠️ Approaching execution limit (${Math.round(elapsedMs/1000)}s elapsed), stopping processing`);
        console.log(`   Processed ${processedCount}/${releaseGroups.length} albums`);
        
        // Log the albums that were skipped (for debugging)
        const skippedAlbums = releaseGroups.slice(processedCount).map(rg => rg.title);
        if (skippedAlbums.length > 0) {
          console.log(`   Skipped ${skippedAlbums.length} older albums: ${skippedAlbums.slice(0, 10).join(', ')}${skippedAlbums.length > 10 ? '...' : ''}`);
        }
        processedAllReleases = false; // Mark that we didn't finish processing all releases
        break;
      }

      // Update progress every N albums (batched to reduce DB calls)
      processedCount++;
      if (processedCount % PROGRESS_UPDATE_INTERVAL === 0 || processedCount === 1 || processedCount === releaseGroups.length) {
        await updateProgress({ 
          processed_releases: processedCount,
          current_album: rg.title 
        });
      }
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

      // Fetch detailed release-group info including artist-credit to verify authenticity
      let rgDetails: any;
      let releases: any[] = []; // Declare here so it's accessible later for track fetching
      let releaseCheckPassed = false;
      
      try {
      rgDetails = await mbJson<any>(`https://musicbrainz.org/ws/2/release-group/${rg.id}?inc=releases+url-rels+artist-credits&fmt=json`);
        await delay(1100); // MusicBrainz requires 1 req/sec
        
        // Verify artist-credit includes this rapper or any of their aliases (prevents tribute albums)
        const artistCredits = rgDetails['artist-credit'] || [];
        const creditIds = artistCredits.map((c: any) => c.artist?.id).filter(Boolean);
        const creditNames = artistCredits.map((c: any) => c.artist?.name).filter(Boolean);
        
        // Check if the primary MusicBrainz ID matches
        const primaryMatch = creditIds.includes(musicbrainzId);
        
        // Check if the rapper's name matches any artist-credit name (important for groups)
        const nameMatch = creditNames.some((creditName: string) => 
          creditName.toLowerCase() === rapper.name.toLowerCase()
        );
        
        // Check if any rapper alias matches the artist-credit names (for name changes like Makaveli)
        const rapperAliases = rapper.aliases || [];
        const aliasMatch = rapperAliases.some((alias: string) => 
          creditNames.some((creditName: string) => 
            creditName.toLowerCase() === alias.toLowerCase()
          )
        );
        
        // Check if the rapper's name appears within any collaboration credit (e.g., "Rakim" in "Eric B. & Rakim")
        const partialMatch = creditNames.some((creditName: string) => 
          creditName.toLowerCase().includes(rapper.name.toLowerCase())
        );
        
        // Partial alias match - only for longer aliases (6+ chars) to prevent false positives
        // Uses word boundary matching to ensure alias is a distinct phrase, not a substring
        // This handles cases like "The Fresh Prince" in "DJ Jazzy Jeff & The Fresh Prince"
        // But protects against short aliases like "BIG", "Ye", "Tip" matching incorrectly
        const MIN_ALIAS_LENGTH_FOR_PARTIAL = 6;
        const partialAliasMatch = rapperAliases.some((alias: string) => {
          // Skip short aliases that could cause false matches (BIG, Ye, Tip, etc.)
          if (alias.length < MIN_ALIAS_LENGTH_FOR_PARTIAL) return false;
          
          return creditNames.some((creditName: string) => {
            const aliasLower = alias.toLowerCase();
            const creditLower = creditName.toLowerCase();
            
            // Check if alias appears as a word boundary match
            // This handles "The Fresh Prince" in "DJ Jazzy Jeff & The Fresh Prince"
            // But rejects "Fresh" matching "Freshly Baked Beats"
            const wordBoundaryPattern = new RegExp(
              `(^|[^a-z])${aliasLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`,
              'i'
            );
            return wordBoundaryPattern.test(creditLower);
          });
        });
        
        // Enhanced logging for debugging
        console.log(`🔍 Artist-credit check for "${rg.title}" (RG: ${rg.id}):`);
        console.log(`   - Credit names: ${creditNames.join(', ')}`);
        console.log(`   - Primary ID match: ${primaryMatch}`);
        console.log(`   - Name match (${rapper.name}): ${nameMatch}`);
        console.log(`   - Alias match: ${aliasMatch}`);
        console.log(`   - Partial match (${rapper.name} in credit): ${partialMatch}`);
        console.log(`   - Partial alias match (6+ char aliases): ${partialAliasMatch}`);
        
        if (!primaryMatch && !nameMatch && !aliasMatch && !partialMatch && !partialAliasMatch) {
          console.log(`❌ EXCLUDED - artist-credit does not include rapper name, ID, or aliases`);
          continue;
        }
        
        if (partialAliasMatch && !primaryMatch && !nameMatch && !aliasMatch && !partialMatch) {
          console.log(`✓ Including "${rg.title}" via partial alias match (collaboration)`);
        } else if (partialMatch && !primaryMatch && !nameMatch && !aliasMatch) {
          console.log(`✓ Including "${rg.title}" via partial name match (collaboration)`);
        } else if (nameMatch && !primaryMatch) {
          console.log(`✓ Including "${rg.title}" via name match`);
        } else if (aliasMatch && !primaryMatch) {
          console.log(`✓ Including "${rg.title}" via alias match`);
        } else {
          console.log(`✓ Including "${rg.title}" via primary ID match`);
        }
        
        // More lenient release status check
        releases = rgDetails?.releases || []; // Assign to outer scope variable
        
        if (releases.length > 0) {
          // Accept if ANY release is marked as Official
          const hasOfficialRelease = releases.some((release: any) => 
            release && release.status === 'Official'
          );
          
          // Check if ALL releases are explicitly unofficial (bootleg, promo, pseudo-release)
          const unofficialStatuses = ['Bootleg', 'Promotion', 'Pseudo-Release'];
          const allReleasesUnofficial = releases.every((release: any) => 
            release?.status && unofficialStatuses.includes(release.status)
          );
          
          // Also accept if status is undefined but release exists (MusicBrainz data gaps)
          // BUT only if there are no explicit unofficial releases
          const hasUndefinedStatus = releases.some((release: any) => 
            release && !release.status
          );
          
          if (hasOfficialRelease) {
            console.log(`✓ Including "${rg.title}" - has official release`);
            releaseCheckPassed = true;
          } else if (allReleasesUnofficial) {
            // Explicitly reject bootlegs/promos - don't give benefit of doubt
            const statusList = releases.map((r: any) => r?.status || 'Unknown').join(', ');
            console.log(`⚠ Skipping "${rg.title}" - no official releases (statuses: ${statusList})`);
            releaseCheckPassed = false;
          } else if (hasUndefinedStatus) {
            // Only give benefit of doubt when no release has explicit unofficial status
            console.log(`✓ Including "${rg.title}" - status verification inconclusive, allowing through`);
            releaseCheckPassed = true;
          } else {
            const statusList = releases.map((r: any) => r?.status || 'Unknown').join(', ');
            console.log(`⚠ Skipping "${rg.title}" - no official releases (statuses: ${statusList})`);
          }
        } else {
          // If no release data but has a release date, be lenient and include it
          console.log(`⚠ Including "${rg.title}" - no release data available but has release date`);
          releaseCheckPassed = true;
        }
      } catch (detailError: any) {
        console.error(`Error fetching details for "${rg.title}":`, detailError);
        // If API fails but we have basic data (title + date), include it with a warning
        console.log(`⚠ Including "${rg.title}" despite API error - has basic metadata`);
        releaseCheckPassed = true;
        rgDetails = null; // Prevent streaming link extraction
      }

      if (!releaseCheckPassed) {
        continue;
      }

      // Additional title guard for tribute patterns (belt-and-suspenders)
      if (/tribute\s+to/i.test(rg.title)) {
        console.log(`⚠ Skipping "${rg.title}" - title contains tribute pattern`);
        continue;
      }

      // Exclude non-studio releases and unofficial types
      // For posthumous releases, be more lenient with "Compilation" as they often contain unreleased material
      const isPosthumous = rapper.death_year && parseInt(rg['first-release-date']) > rapper.death_year;
      
      const excludedSecondaryTypes = [
        'Instrumental', // Instrumental versions (no vocals)
        'Live',         // Concert recordings
        'Remix',        // Remix albums
        'Soundtrack',   // Movie/game soundtracks
        'DJ-mix',       // DJ mixtapes
        'Spokenword',   // Audiobooks, poetry
        'Interview',    // Interview albums
        'Demo',         // Demo recordings
        'Audio drama',  // Audio dramas/plays
        'Tribute',      // Tribute albums
        'Karaoke',      // Karaoke versions
        'Anthology'     // Anthology collections
      ];
      
      // Only exclude Compilation for non-posthumous releases
      if (!isPosthumous) {
        excludedSecondaryTypes.push('Compilation');
      }
      
      const hasExcludedType = secondary.some(type => excludedSecondaryTypes.includes(type));
      if (hasExcludedType) {
        console.log(`Skipping "${rg.title}" - excluded type: [${secondary.join(', ')}]`);
        continue;
      }
      
      // Also check disambiguation field for "Instrumental" (some albums are mislabeled in MusicBrainz)
      const disambiguation = rg.disambiguation?.toLowerCase() || '';
      if (disambiguation.includes('instrumental')) {
        console.log(`⚠ Skipping "${rg.title}" - disambiguation contains "instrumental": "${rg.disambiguation}"`);
        continue;
      }

      // Generate URL-safe slug from title
      const generateSlug = (title: string): string => {
        return title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
          .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      };

      // Ensure unique slug
      const ensureUniqueSlug = async (baseSlug: string, existingId?: string): Promise<string> => {
        let slug = baseSlug;
        let counter = 1;
        
        while (true) {
          const { data } = await supabaseService
            .from('albums')
            .select('id')
            .eq('slug', slug)
            .maybeSingle();
          
          // If no match or it's the same album we're updating, slug is unique
          if (!data || data.id === existingId) {
            return slug;
          }
          
          // Otherwise, append counter and try again
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      };

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
      
      // For mixtapes, use cover art availability as a quality signal
      // Mixtapes without cover art on MusicBrainz are often obscure/unverified releases
      if (isMixtape) {
        const coverArtCheckUrl = `https://coverartarchive.org/release-group/${rg.id}/front-500`;
        const hasCoverArt = await checkCoverArtExists(coverArtCheckUrl);
        await delay(100); // Small delay after cover art check
        
        if (!hasCoverArt) {
          console.log(`⚠ Skipping mixtape "${rg.title}" - no cover art (likely not a prominent release)`);
          continue;
        }
        console.log(`✓ Mixtape "${rg.title}" has cover art - including as quality release`);
      }

      // Try to find existing album by MusicBrainz ID first
      let existingAlbum = await supabaseService
        .from('albums')
        .select('id, has_cover_art, musicbrainz_id, title')
        .eq('musicbrainz_id', rg.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) console.error(`Error finding album by MusicBrainz ID "${rg.id}":`, error);
          return data;
        });
      
      // Fallback: Try to find by title and release date if not found by MusicBrainz ID
      // Parse the date properly to handle year-only formats (e.g., "2005" → "2005-01-01")
      const parsedReleaseDate = parseMusicBrainzDate(rg['first-release-date']);
      
      if (!existingAlbum && parsedReleaseDate) {
        existingAlbum = await supabaseService
          .from('albums')
          .select('id, has_cover_art, musicbrainz_id, title')
          .eq('title', rg.title)
          .eq('release_date', parsedReleaseDate)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) console.error(`Error finding album by title+date "${rg.title}":`, error);
            if (data) console.log(`📌 Found album by title+date match: "${rg.title}" (will update MusicBrainz ID)`);
            return data;
          });
      }
      
      let albumId = existingAlbum?.id as string | undefined;
      
      if (!albumId) {
        console.log(`➕ Creating new album: "${rg.title}" (${rg.id})`)
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
        
        // Verify cover art exists and cache it in Supabase Storage
        const coverArtUrl = `https://coverartarchive.org/release-group/${rg.id}/front-500`;
        let hasCoverArt = false;
        let cachedCoverUrl: string | null = null;
        
        // Only download cover art if under the limit (memory/time optimization)
        if (coverArtDownloads < MAX_COVER_ART_DOWNLOADS) {
          cachedCoverUrl = await downloadAndCacheCoverArt(supabaseService, rg.id, coverArtUrl);
          if (cachedCoverUrl) {
            coverArtDownloads++;
            hasCoverArt = true;
          }
        }
        
        if (!hasCoverArt) {
          // Fallback: just check if cover exists (for reference) - uses HEAD request, minimal overhead
          hasCoverArt = await checkCoverArtExists(coverArtUrl);
        }
        await delay(100); // Small delay after cover art check to avoid rate limiting
        
        // Generate unique slug for the album
        const baseSlug = generateSlug(rg.title);
        const uniqueSlug = await ensureUniqueSlug(baseSlug);
        
        const { data: newAlbum, error: insertError } = await supabaseService
          .from('albums')
          .insert({
            title: rg.title,
            slug: uniqueSlug,
            musicbrainz_id: rg.id,
            release_date: parsedReleaseDate, // Use parsed date to handle year-only formats
            release_type: releaseType,
            track_count: null, // Not available without inc=releases - will be populated on-demand
            cover_art_url: hasCoverArt ? coverArtUrl : null,
            cached_cover_url: cachedCoverUrl,
            has_cover_art: hasCoverArt,
            external_cover_links: externalLinks,
            cover_art_colors: null // Will be populated by future user-generated content
          })
          .select('id')
          .single();
        
        if (insertError) {
          console.error(`❌ Failed to insert album "${rg.title}":`, insertError);
          continue; // Skip to next album
        }
        
        albumId = newAlbum?.id;
        console.log(`✅ Created album "${rg.title}" with ID: ${albumId}${cachedCoverUrl ? ' (cover cached)' : ''}`);
      } else {
        console.log(`🔄 Updating existing album: "${rg.title}" (${albumId})`);
        
        // Update existing albums that need slugs, cover art, or MusicBrainz ID
        const updates: any = {};
        
        // Update MusicBrainz ID if it was found by title+date match
        if (existingAlbum?.musicbrainz_id !== rg.id) {
          updates.musicbrainz_id = rg.id;
          console.log(`  → Updating MusicBrainz ID: ${existingAlbum?.musicbrainz_id} → ${rg.id}`);
        }
        
        // Generate slug if missing
        const { data: currentAlbum } = await supabaseService
          .from('albums')
          .select('slug, title, cached_cover_url')
          .eq('id', existingAlbum.id)
          .single();
        
        if (!currentAlbum?.slug) {
          const baseSlug = generateSlug(currentAlbum?.title || rg.title);
          updates.slug = await ensureUniqueSlug(baseSlug, existingAlbum.id);
          console.log(`  → Generated slug: ${updates.slug}`);
        }
        
        // Cache cover art if not already cached (and under limit)
        if (!currentAlbum?.cached_cover_url && coverArtDownloads < MAX_COVER_ART_DOWNLOADS) {
          const coverArtUrl = `https://coverartarchive.org/release-group/${rg.id}/front-500`;
          
          // Try to download and cache
          const cachedUrl = await downloadAndCacheCoverArt(supabaseService, rg.id, coverArtUrl);
          await delay(100);
          
          if (cachedUrl) {
            coverArtDownloads++;
            updates.cached_cover_url = cachedUrl;
            updates.cover_art_url = coverArtUrl;
            updates.has_cover_art = true;
            console.log(`  → Cached cover art (${coverArtDownloads}/${MAX_COVER_ART_DOWNLOADS})`);
          } else if (!existingAlbum?.has_cover_art) {
            // Fallback: just check if cover exists (HEAD request only)
            const hasCoverArt = await checkCoverArtExists(coverArtUrl);
            if (hasCoverArt) {
              updates.cover_art_url = coverArtUrl;
              updates.has_cover_art = true;
              console.log(`  → Found cover art (not cached - at limit)`);
            }
          }
        }
        
        // Apply updates if needed
        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabaseService
            .from('albums')
            .update(updates)
            .eq('id', existingAlbum.id);
          
          if (updateError) {
            console.error(`❌ Failed to update album "${rg.title}":`, updateError);
          } else {
            console.log(`✅ Updated ${Object.keys(updates).length} field(s) for "${rg.title}"`);
          }
        }
      }

      // Label info not available without inc=releases - skip label processing

      if (albumId) {
        // Link album to rapper
        const { error: linkError } = await supabaseService
          .from('rapper_albums')
          .upsert({ rapper_id: rapperId, album_id: albumId, role: 'primary' }, { onConflict: 'rapper_id,album_id' });
        
        if (linkError) {
          console.error(`❌ Failed to link album "${rg.title}" to rapper:`, linkError);
          // Don't add to validAlbumIds if linking failed
        } else {
          // Track this as a valid album ID only after successful linking
          validAlbumIds.add(albumId);
          console.log(`🔗 Linked album "${rg.title}" to rapper (validAlbumIds: ${validAlbumIds.size})`);
        }

        // NOTE: Track fetching is skipped during discography sync to avoid compute timeouts
        // Tracks should be fetched on-demand when viewing album details or via a separate background job
        // This dramatically reduces API calls and processing time for artists with large discographies
      } else {
        console.warn(`⚠️ No albumId for "${rg.title}" - skipping link`);
      }
      await delay(150);
      } catch (albumError: any) {
        console.error(`Error processing album "${rg?.title}":`, albumError);
        // Continue processing other albums even if one fails
      }
    }

    // Reconciliation: Remove links to albums that are no longer in MusicBrainz
    console.log(`\n📊 Starting reconciliation - valid albums from MusicBrainz: ${validAlbumIds.size}`);
    
    const { data: currentLinks, error: linksError } = await supabaseService
      .from('rapper_albums')
      .select('album_id, albums(id, title, musicbrainz_id, track_count)')
      .eq('rapper_id', rapperId)
      .eq('role', 'primary');
    
    if (linksError) {
      console.error('Error fetching current album links for reconciliation:', linksError);
    }

    if (currentLinks && currentLinks.length > 0) {
      console.log(`📋 Current rapper_albums links: ${currentLinks.length}`);
      
      const invalidAlbumIds = currentLinks
        .map(link => link.album_id)
        .filter(id => !validAlbumIds.has(id));

      if (invalidAlbumIds.length > 0) {
        // Log details about albums being removed for debugging
        console.log(`🔍 Investigating ${invalidAlbumIds.length} albums not in validAlbumIds:`);
        for (const albumId of invalidAlbumIds) {
          const linkData = currentLinks.find(l => l.album_id === albumId);
          const album = linkData?.albums as any;
          if (album) {
            console.log(`  - "${album.title}" (MB: ${album.musicbrainz_id || 'none'}, tracks: ${album.track_count ?? 'null'})`);
          } else {
            console.log(`  - Album ${albumId} (no album data found)`);
          }
        }
        
        // ⚠️ SAFETY CHECK: Only reconcile if we processed ALL releases
        // This prevents removing valid albums when we hit the execution time limit
        const shouldReconcile = processedAllReleases && (validAlbumIds.size >= 3 || forceRefresh);
        
        if (!processedAllReleases) {
          console.log(`⚠️ SKIPPING RECONCILIATION - Did not process all releases (hit time limit)`);
          console.log(`   Preserving existing album links to prevent data loss`);
        } else if (validAlbumIds.size < 3 && !forceRefresh) {
          console.log(`⚠️ SKIPPING RECONCILIATION - Only found ${validAlbumIds.size} valid albums (safety threshold: 3)`);
          console.log(`   This prevents accidental deletion when API returns incomplete data`);
          console.log(`   Use forceRefresh=true to override this safety check`);
        } else {
          console.log(`🗑️ Reconciliation: Removing ${invalidAlbumIds.length} album links not found in MusicBrainz API response`);
          
          const { error: deleteError } = await supabaseService
            .from('rapper_albums')
            .delete()
            .eq('rapper_id', rapperId)
            .in('album_id', invalidAlbumIds);

          if (deleteError) {
            console.error('❌ Error removing invalid links:', deleteError);
          } else {
            console.log(`✅ Removed ${invalidAlbumIds.length} outdated album links`);
            await logAuditEvent(supabaseService, {
              rapper_id: rapperId,
              action: 'RECONCILIATION_CLEANUP',
              status: 'SUCCESS',
              user_id: userId,
              ip_address: clientIP,
              user_agent: userAgent,
              response_data: { removedCount: invalidAlbumIds.length, removedAlbumIds: invalidAlbumIds },
              execution_time_ms: Date.now() - startTime,
            });
          }
        }
      } else {
        console.log('✅ No invalid album links found - all links match MusicBrainz data');
      }
    } else {
      console.log('📋 No existing album links found for this rapper');
    }

    // Calculate and update career_start_year from earliest album release (Phase 3)
    if (validAlbumIds.size > 0) {
      try {
        const { data: earliestAlbum } = await supabaseService
          .from('albums')
          .select('release_date')
          .in('id', Array.from(validAlbumIds))
          .not('release_date', 'is', null)
          .order('release_date', { ascending: true })
          .limit(1)
          .single();

        if (earliestAlbum?.release_date) {
          const careerStartFromDisc = new Date(earliestAlbum.release_date).getFullYear();
          
          // Only update if currently null or different (preserve manual entries if they match)
          if (!rapper.career_start_year || rapper.career_start_year !== careerStartFromDisc) {
            await supabaseService
              .from('rappers')
              .update({ career_start_year: careerStartFromDisc })
              .eq('id', rapperId);
            
            console.log(`✓ Updated career_start_year to ${careerStartFromDisc} from discography`);
          }
        }
      } catch (careerError: any) {
        console.error('Error calculating career_start_year:', careerError);
        // Non-critical error - continue
      }
    }

    // Mark progress as complete
    await updateProgress({ status: 'complete' });

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

    // Cleanup progress record after a short delay
    if (fetchId) {
      setTimeout(async () => {
        try {
          await supabaseService.from('discography_fetch_progress').delete().eq('fetch_id', fetchId);
        } catch {}
      }, 3000);
    }

    return json({ success: true, cached: false, ...payload });
  } catch (error: any) {
    console.error('Error in fetch-rapper-discography:', error);
    
    // Try to return cached data gracefully on error
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      
      // Log the error
      await logAuditEvent(supabaseService, {
        rapper_id: requestedRapperId,
        action: 'FETCH_DISCOGRAPHY',
        status: 'ERROR',
        user_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        request_data: { rapperId: requestedRapperId },
        error_message: error?.message || 'Unknown error',
        execution_time_ms: Date.now() - startTime,
      });
      
      // Try to return cached discography instead of failing
      if (requestedRapperId) {
        const payload = await readDiscographyPayload(supabaseService, requestedRapperId);
        if (payload.discography.length > 0) {
          console.log(`⚠️ Returning ${payload.discography.length} cached albums after error`);
          return json({ 
            success: true, 
            cached: true, 
            partial: true,
            message: 'Partial results - some albums may not have been processed',
            ...payload 
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback error handling failed:', fallbackError);
    }
    
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
        slug,
        release_date,
        release_type,
        cover_art_url,
        cached_cover_url,
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

// Download cover art and cache it in Supabase Storage
async function downloadAndCacheCoverArt(
  supabaseService: any,
  musicbrainzId: string, 
  coverArtUrl: string
): Promise<string | null> {
  try {
    console.log(`📦 Downloading cover art for ${musicbrainzId}...`);
    
    // Download image from Cover Art Archive
    const response = await fetch(coverArtUrl, {
      headers: { 'User-Agent': 'RapperHierarchy/1.1 (https://rapperhierarchy.com)' },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      console.log(`   ❌ Download failed: ${response.status}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageData = await response.arrayBuffer();
    
    // Determine file extension from content type
    const extension = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${musicbrainzId}.${extension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseService.storage
      .from('album-covers')
      .upload(fileName, imageData, {
        contentType: contentType,
        upsert: true
      });
    
    if (error) {
      console.error(`   ❌ Storage upload error:`, error.message);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabaseService.storage
      .from('album-covers')
      .getPublicUrl(fileName);
    
    console.log(`   ✅ Cached successfully: ${fileName}`);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error(`   ❌ Cover art caching failed:`, error.message);
    return null;
  }
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

// Parse MusicBrainz date formats (YYYY, YYYY-MM, or YYYY-MM-DD) into a valid date string
// Returns null if the date is invalid or incomplete for database storage
function parseMusicBrainzDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  // Full date: YYYY-MM-DD (valid as-is)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Year-month: YYYY-MM → YYYY-MM-01
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return `${dateStr}-01`;
  }
  
  // Year only: YYYY → YYYY-01-01
  if (/^\d{4}$/.test(dateStr)) {
    return `${dateStr}-01-01`;
  }
  
  console.warn(`Unexpected date format: "${dateStr}"`);
  return null;
}

async function resolveArtistId(rapperName: string, aliases: string[] = []): Promise<string | null> {
  const searchTerms = [rapperName, ...aliases];
  
  for (const searchTerm of searchTerms) {
    console.log(`Searching MusicBrainz for artist: "${searchTerm}"`);
    
    // Exact + alias-aware search (encode full query)
    const search = encodeURIComponent(`artist:"${searchTerm}"`);
    const url = `https://musicbrainz.org/ws/2/artist?query=${search}&fmt=json&limit=10&inc=aliases`;
    
    try {
      const data = await mbJson<any>(url);
      await delay(1100);
      
      const artists: MusicBrainzArtist[] = data.artists || [];
      const target = normalizeName(searchTerm);

      // 1) Exact normalized name match
      const exact = artists.find(a => normalizeName(a.name) === target);
      if (exact) {
        console.log(`✓ Found exact match for "${searchTerm}": ${exact.name} (ID: ${exact.id})`);
        return exact.id;
      }

      // 2) Match any MusicBrainz alias exactly (normalized)
      for (const a of artists) {
        for (const al of a.aliases || []) {
          if (normalizeName(al.name) === target) {
            console.log(`✓ Found alias match for "${searchTerm}": ${al.name} → ${a.name} (ID: ${a.id})`);
            return a.id;
          }
        }
      }

      // 3) Fallback: highest score for this search term
      let best: MusicBrainzArtist | undefined = undefined;
      for (const a of artists) {
        if (!best || (a.score || 0) > (best.score || 0)) best = a;
      }
      
      if (best && (best.score || 0) >= 80) {
        console.log(`✓ Found high-score match for "${searchTerm}": ${best.name} (ID: ${best.id}, score: ${best.score})`);
        return best.id;
      }
    } catch (error: any) {
      console.error(`Error searching for "${searchTerm}":`, error.message);
      // Continue to next search term
    }
  }
  
  console.log(`✗ No match found for any of: ${searchTerms.join(', ')}`);
  return null;
}

async function mbJson<T>(url: string, retries = 3): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RapperHierarchy/1.1 (https://rapperhierarchy.com; contact@rapperhierarchy.com)',
        'Accept': 'application/json',
      },
    });
    
    // Handle rate limiting - wait and retry with exponential backoff
    if (res.status === 503 || res.status === 429) {
      const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
      console.warn(`MusicBrainz rate limited (${res.status}), waiting ${waitTime}ms before retry ${attempt + 1}/${retries}`);
      await delay(waitTime);
      continue;
    }
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`MusicBrainz API error ${res.status} ${res.statusText} for ${url} - ${text?.slice(0,200)}`);
    }
    
    return await res.json() as T;
  }
  
  throw new Error(`MusicBrainz API failed after ${retries} retries due to rate limiting`);
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
