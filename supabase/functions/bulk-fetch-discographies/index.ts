import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return json({ success: false, error: 'Authentication required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create authenticated client with the user's token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    userId = user?.id || null;

    if (userError || !userId) {
      console.error('Authentication error:', userError);
      return json({ success: false, error: 'Invalid authentication' }, 401);
    }

    // Check if user is admin using the authenticated client
    const { data: isAdmin, error: adminError } = await supabaseAuth.rpc('is_admin');
    if (adminError) {
      console.error('Admin check error:', adminError);
      return json({ success: false, error: 'Failed to verify admin status' }, 500);
    }
    
    if (!isAdmin) {
      console.log(`User ${userId} is not an admin`);
      return json({ success: false, error: 'Admin access required' }, 403);
    }

    console.log(`Admin user ${userId} authenticated successfully`);

    const body = await req.json().catch(() => ({}));
    const { batchSize = 5, startFromIndex = 0, forceRefresh = false } = body as { 
      batchSize?: number; 
      startFromIndex?: number;
      forceRefresh?: boolean;
    };

    console.log(`Starting bulk discography fetch (batch: ${batchSize}, starting from: ${startFromIndex}, forceRefresh: ${forceRefresh})`);

    // Build query for rappers needing discography
    let query = supabaseService
      .from('rappers')
      .select('id, name, musicbrainz_id, discography_last_updated')
      .not('musicbrainz_id', 'is', null)
      .order('name');

    // Filter based on forceRefresh
    if (!forceRefresh) {
      query = query.is('discography_last_updated', null);
    }

    const { data: rappers, error: rappersError } = await query
      .range(startFromIndex, startFromIndex + batchSize - 1);

    if (rappersError) {
      console.error('Error fetching rappers:', rappersError);
      return json({ success: false, error: 'Failed to fetch rappers' }, 500);
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ rapper: string; error: string }>,
      progress: {
        startIndex: startFromIndex,
        batchSize,
        processedInBatch: 0
      }
    };

    if (!rappers || rappers.length === 0) {
      console.log('No rappers need discography fetching');
      return json({ 
        success: true, 
        message: 'No rappers need discography fetching',
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
        console.log(`Processing ${i + 1}/${rappers.length}: ${rapper.name} (ID: ${rapper.musicbrainz_id})`);
        
        // Skip if no MusicBrainz ID
        if (!rapper.musicbrainz_id) {
          console.log(`✗ Skipping ${rapper.name} - no MusicBrainz ID`);
          results.skipped++;
          continue;
        }

        // Call the existing fetch-rapper-discography function
        const { data: discographyData, error: discographyError } = await supabaseService.functions.invoke(
          'fetch-rapper-discography',
          {
            body: { 
              rapperId: rapper.id,
              forceRefresh: forceRefresh
            }
          }
        );

        if (discographyError) {
          console.error(`Failed to fetch discography for ${rapper.name}:`, discographyError);
          results.failed++;
          results.errors.push({
            rapper: rapper.name,
            error: `Discography fetch failed: ${discographyError.message}`
          });
        } else if (!discographyData?.success) {
          console.log(`✗ No discography data for ${rapper.name}`);
          results.failed++;
          results.errors.push({
            rapper: rapper.name,
            error: discographyData?.error || 'No discography data returned'
          });
        } else {
          const albumCount = discographyData.albums?.length || 0;
          console.log(`✓ Successfully fetched ${albumCount} albums for ${rapper.name}`);
          results.successful++;
        }

        // Rate limiting: 1.5 seconds between MusicBrainz API calls
        if (i < rappers.length - 1) {
          await delay(1500);
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
      action: 'BULK_FETCH_DISCOGRAPHIES',
      status: 'SUCCESS',
      user_id: userId,
      request_data: { batchSize, startFromIndex, forceRefresh },
      response_data: results,
      execution_time_ms: Date.now() - startTime,
    });

    console.log(`Bulk discography fetch completed. Successful: ${results.successful}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return json({
      success: true,
      message: `Processed ${results.processed} rappers. ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped.`,
      results,
      completed: rappers.length < batchSize
    });

  } catch (error: any) {
    console.error('Error in bulk-fetch-discographies:', error);
    
    try {
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
      await logAuditEvent(supabaseService, {
        rapper_id: null,
        action: 'BULK_FETCH_DISCOGRAPHIES',
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

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
