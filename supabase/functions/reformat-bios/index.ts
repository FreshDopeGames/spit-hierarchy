import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all rappers with bios longer than 500 characters that don't have paragraph breaks
    const { data: rappers, error: fetchError } = await supabase
      .from('rappers')
      .select('id, name, bio')
      .not('bio', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch rappers: ${fetchError.message}`);
    }

    // Filter to rappers with bios that need reformatting (no paragraph breaks and > 500 chars)
    const rappersToReformat = rappers?.filter(r => 
      r.bio && 
      r.bio.length > 500 && 
      !r.bio.includes('\n\n')
    ) || [];

    console.log(`Found ${rappersToReformat.length} rappers needing bio reformatting`);

    const results = {
      processed: 0,
      reformatted: 0,
      skipped: 0,
      errors: [] as Array<{ rapper: string; error: string }>,
      reformattedRappers: [] as Array<{ rapper: string; paragraphCount: number }>,
    };

    for (const rapper of rappersToReformat) {
      try {
        const bio = rapper.bio as string;
        
        // Split into sentences using regex that handles common sentence endings
        // This regex splits on period, exclamation, or question mark followed by space
        const sentences = bio.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        
        if (sentences.length < 4) {
          // Too few sentences to reformat meaningfully
          results.skipped++;
          continue;
        }

        // Group sentences into paragraphs of 3 sentences each
        const paragraphs: string[] = [];
        for (let i = 0; i < sentences.length; i += 3) {
          const chunk = sentences.slice(i, i + 3);
          paragraphs.push(chunk.join(' '));
        }

        // Join paragraphs with double newlines
        const reformattedBio = paragraphs.join('\n\n');

        // Update the database
        const { error: updateError } = await supabase
          .from('rappers')
          .update({ bio: reformattedBio })
          .eq('id', rapper.id);

        if (updateError) {
          results.errors.push({ rapper: rapper.name, error: updateError.message });
          continue;
        }

        results.reformatted++;
        results.reformattedRappers.push({
          rapper: rapper.name,
          paragraphCount: paragraphs.length,
        });
        
        console.log(`Reformatted bio for ${rapper.name}: ${paragraphs.length} paragraphs`);

      } catch (error) {
        results.errors.push({
          rapper: rapper.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      results.processed++;
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Reformatted ${results.reformatted} rapper bios`,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reformat-bios:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
