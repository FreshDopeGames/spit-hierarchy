import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('Admin access required');
    }

    // Fetch rappers missing birth_year but have musicbrainz_id
    const { data: rappers, error: fetchError } = await supabase
      .from('rappers')
      .select('id, name, musicbrainz_id')
      .is('birth_year', null)
      .not('musicbrainz_id', 'is', null);

    if (fetchError) throw fetchError;

    console.log(`Found ${rappers?.length || 0} rappers missing birth_year`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const rapper of rappers || []) {
      try {
        // Respect MusicBrainz rate limit: 1 request per second
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mbResponse = await fetch(
          `https://musicbrainz.org/ws/2/artist/${rapper.musicbrainz_id}?inc=aliases&fmt=json`,
          {
            headers: {
              'User-Agent': 'RapperRankings/1.0 (https://rapperrankings.com)',
              'Accept': 'application/json'
            }
          }
        );

        if (!mbResponse.ok) {
          throw new Error(`MusicBrainz API error: ${mbResponse.status}`);
        }

        const artistData = await mbResponse.json();
        const lifeSpanBegin = artistData['life-span']?.begin;

        if (lifeSpanBegin) {
          const birthYear = parseInt(lifeSpanBegin.substring(0, 4));

          const { error: updateError } = await supabase
            .from('rappers')
            .update({ birth_year: birthYear })
            .eq('id', rapper.id);

          if (updateError) throw updateError;

          console.log(`✓ Updated ${rapper.name}: birth_year = ${birthYear}`);
          results.push({
            rapper_id: rapper.id,
            rapper_name: rapper.name,
            birth_year: birthYear,
            status: 'success'
          });
          successCount++;
        } else {
          console.log(`⚠ No birth year found for ${rapper.name}`);
          results.push({
            rapper_id: rapper.id,
            rapper_name: rapper.name,
            status: 'no_data'
          });
        }
      } catch (error: any) {
        console.error(`✗ Error for ${rapper.name}:`, error.message);
        results.push({
          rapper_id: rapper.id,
          rapper_name: rapper.name,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: rappers?.length || 0,
        successful: successCount,
        errors: errorCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Backfill error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: error.message.includes('Admin') || error.message.includes('Unauthorized') ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
