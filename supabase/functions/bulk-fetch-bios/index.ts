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

    const { data: isAdmin, error: adminError } = await supabaseAuth.rpc('is_admin');
    if (adminError || !isAdmin) {
      return json({ success: false, error: 'Admin access required' }, 403);
    }

    console.log(`Admin user ${userId} authenticated successfully`);

    const body = await req.json().catch(() => ({}));
    const { 
      batchSize = 5, 
      startFromIndex = 0, 
      forceRefresh = false,
      minBioLength = 2000 // ~500 words
    } = body as { 
      batchSize?: number; 
      startFromIndex?: number; 
      forceRefresh?: boolean;
      minBioLength?: number;
    };

    console.log(`Starting bulk bio population (batch: ${batchSize}, starting from: ${startFromIndex})`);

    // Get rappers that need bios - must have MusicBrainz ID
    // Note: We filter by bio length in JavaScript since Supabase PostgREST 
    // doesn't support LENGTH() in query filters
    const query = supabaseService
      .from('rappers')
      .select('id, name, musicbrainz_id, bio')
      .not('musicbrainz_id', 'is', null)
      .order('name');

    const { data: allRappers, error: countError } = await query;

    if (countError) {
      console.error('Error fetching rappers:', countError);
      return json({ success: false, error: 'Failed to fetch rappers' }, 500);
    }

    // Filter by bio length since Supabase doesn't support LENGTH in queries easily
    const rappersNeedingBios = (allRappers || []).filter(r => {
      if (forceRefresh) return true;
      return !r.bio || r.bio.length < minBioLength;
    });

    const totalToProcess = rappersNeedingBios.length;
    const batch = rappersNeedingBios.slice(startFromIndex, startFromIndex + batchSize);

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: [] as Array<{ rapper: string; error: string }>,
      successfulRappers: [] as Array<{ rapper: string; wordCount: number; source: string }>,
      progress: {
        startIndex: startFromIndex,
        batchSize,
        totalToProcess,
        processedInBatch: 0
      }
    };

    if (batch.length === 0) {
      console.log('No rappers need bio population');
      return json({ 
        success: true, 
        message: 'No rappers need bio population',
        results,
        completed: true
      });
    }

    console.log(`Processing ${batch.length} rappers (${totalToProcess} total need bios)`);

    for (let i = 0; i < batch.length; i++) {
      const rapper = batch[i];
      results.processed++;
      results.progress.processedInBatch++;

      try {
        console.log(`Processing ${i + 1}/${batch.length}: ${rapper.name}`);
        
        // Call the single rapper bio fetch function
        const response = await fetch(`${supabaseUrl}/functions/v1/fetch-wikipedia-bio`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({ 
            rapperId: rapper.id,
            forceRefresh 
          }),
        });

        const data = await response.json();

        if (data.success) {
          if (data.skipped) {
            console.log(`⊘ Skipped ${rapper.name} - bio already sufficient`);
            results.skipped++;
          } else {
            console.log(`✓ Updated bio for ${rapper.name} (${data.bioLength} chars, ${data.wordCount} words) via ${data.source}`);
            results.successful++;
            results.successfulRappers.push({
              rapper: rapper.name,
              wordCount: data.wordCount || 0,
              source: data.source || 'unknown'
            });
          }
        } else {
          console.log(`✗ Failed for ${rapper.name}: ${data.error}`);
          results.failed++;
          results.errors.push({
            rapper: rapper.name,
            error: data.error || 'Unknown error'
          });
        }

        // Rate limiting: wait between requests
        if (i < batch.length - 1) {
          await delay(2000); // 2 seconds between requests
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

    const isCompleted = startFromIndex + batch.length >= totalToProcess;

    console.log(`Batch completed. Successful: ${results.successful}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    return json({
      success: true,
      message: `Processed ${results.processed} rappers. ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped.`,
      results,
      completed: isCompleted,
      nextIndex: startFromIndex + batch.length,
      executionTimeMs: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('Error in bulk-fetch-bios:', error);
    return json({ success: false, error: 'Internal server error' }, 500);
  }
});

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
