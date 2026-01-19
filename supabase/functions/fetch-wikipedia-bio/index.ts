import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface WikipediaRelation {
  type: string;
  url: { resource: string };
}

interface MusicBrainzResponse {
  relations?: WikipediaRelation[];
}

interface WikipediaSummary {
  title: string;
  extract: string;
  extract_html?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { rapperId, forceRefresh = false } = body as { rapperId: string; forceRefresh?: boolean };

    if (!rapperId) {
      return json({ success: false, error: 'rapperId is required' }, 400);
    }

    console.log(`Fetching Wikipedia bio for rapper: ${rapperId}`);

    // Get rapper details
    const { data: rapper, error: rapperError } = await supabaseService
      .from('rappers')
      .select('id, name, musicbrainz_id, bio, birth_year, origin, real_name')
      .eq('id', rapperId)
      .single();

    if (rapperError || !rapper) {
      console.error('Rapper not found:', rapperError);
      return json({ success: false, error: 'Rapper not found' }, 404);
    }

    // Check if bio is already long enough and not forcing refresh
    if (!forceRefresh && rapper.bio && rapper.bio.length >= 2000) {
      console.log(`Bio already sufficient for ${rapper.name} (${rapper.bio.length} chars)`);
      return json({ 
        success: true, 
        skipped: true,
        message: 'Bio already meets length requirements',
        bioLength: rapper.bio.length
      });
    }

    if (!rapper.musicbrainz_id) {
      console.log(`No MusicBrainz ID for ${rapper.name}`);
      return json({ success: false, error: 'No MusicBrainz ID available' }, 400);
    }

    // Step 1: Fetch Wikipedia URL from MusicBrainz
    console.log(`Fetching MusicBrainz relations for ${rapper.musicbrainz_id}`);
    const wikipediaUrl = await getWikipediaUrlFromMusicBrainz(rapper.musicbrainz_id);

    if (!wikipediaUrl) {
      console.log(`No Wikipedia link found for ${rapper.name}`);
      return json({ success: false, error: 'No Wikipedia article linked in MusicBrainz' }, 404);
    }

    console.log(`Found Wikipedia URL: ${wikipediaUrl}`);

    // Step 2: Fetch Wikipedia summary
    const wikipediaTitle = extractWikipediaTitle(wikipediaUrl);
    if (!wikipediaTitle) {
      return json({ success: false, error: 'Could not extract Wikipedia title' }, 400);
    }

    console.log(`Fetching Wikipedia summary for: ${wikipediaTitle}`);
    const wikipediaSummary = await fetchWikipediaSummary(wikipediaTitle);

    if (!wikipediaSummary || !wikipediaSummary.extract) {
      return json({ success: false, error: 'Could not fetch Wikipedia summary' }, 404);
    }

    console.log(`Wikipedia extract length: ${wikipediaSummary.extract.length} chars`);

    // Step 3: Use Lovable AI to expand the bio
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return json({ success: false, error: 'AI service not configured' }, 500);
    }

    const expandedBio = await expandBioWithAI(rapper, wikipediaSummary.extract);

    if (!expandedBio) {
      return json({ success: false, error: 'Failed to generate expanded bio' }, 500);
    }

    console.log(`Generated bio length: ${expandedBio.length} chars`);

    // Step 4: Update the rapper's bio
    const { error: updateError } = await supabaseService
      .from('rappers')
      .update({ bio: expandedBio })
      .eq('id', rapperId);

    if (updateError) {
      console.error('Failed to update bio:', updateError);
      return json({ success: false, error: 'Failed to save bio' }, 500);
    }

    console.log(`Successfully updated bio for ${rapper.name}`);

    return json({
      success: true,
      rapperName: rapper.name,
      bioLength: expandedBio.length,
      wordCount: expandedBio.split(/\s+/).length,
      executionTimeMs: Date.now() - startTime,
      source: 'wikipedia'
    });

  } catch (error: any) {
    console.error('Error in fetch-wikipedia-bio:', error);
    return json({ success: false, error: error.message || 'Internal server error' }, 500);
  }
});

async function getWikipediaUrlFromMusicBrainz(musicbrainzId: string): Promise<string | null> {
  try {
    const url = `https://musicbrainz.org/ws/2/artist/${musicbrainzId}?inc=url-rels&fmt=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RapperHierarchy/1.1 (https://rapperhierarchy.com; contact@rapperhierarchy.com)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`MusicBrainz API error: ${response.status}`);
      return null;
    }

    const data: MusicBrainzResponse = await response.json();
    
    // Look for Wikipedia or Wikidata links
    const relations = data.relations || [];
    
    // Prefer English Wikipedia
    const wikipediaRel = relations.find(r => 
      r.type === 'wikipedia' && r.url.resource.includes('en.wikipedia.org')
    );
    
    if (wikipediaRel) {
      return wikipediaRel.url.resource;
    }

    // Fallback to any Wikipedia
    const anyWikipedia = relations.find(r => r.type === 'wikipedia');
    if (anyWikipedia) {
      return anyWikipedia.url.resource;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from MusicBrainz:', error);
    return null;
  }
}

function extractWikipediaTitle(url: string): string | null {
  try {
    const match = url.match(/wikipedia\.org\/wiki\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

async function fetchWikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RapperHierarchy/1.1 (https://rapperhierarchy.com; contact@rapperhierarchy.com)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Wikipedia API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    return null;
  }
}

async function expandBioWithAI(
  rapper: { name: string; birth_year?: number | null; origin?: string | null; real_name?: string | null },
  wikipediaExtract: string
): Promise<string | null> {
  try {
    const systemPrompt = `You are a music journalist writing comprehensive artist biographies for a hip-hop ranking website. Your bios should be engaging, factual, and well-structured. Write in third person with a professional yet accessible tone. Do not use markdown formatting - write in plain paragraphs.`;

    const userPrompt = `Write a comprehensive biography (500-600 words) for the hip-hop artist "${rapper.name}".

Available information:
- Wikipedia Summary: ${wikipediaExtract}
${rapper.real_name ? `- Real Name: ${rapper.real_name}` : ''}
${rapper.birth_year ? `- Birth Year: ${rapper.birth_year}` : ''}
${rapper.origin ? `- Origin: ${rapper.origin}` : ''}

The biography should cover:
1. Introduction with their full/real name, birth details, and origin
2. Early life and introduction to hip-hop
3. Their breakthrough moment and major releases
4. Their unique style, flow, and contributions to hip-hop
5. Notable collaborations and achievements
6. Current status and legacy in hip-hop

Important guidelines:
- Write exactly 500-600 words
- Use only facts from the Wikipedia summary - do not fabricate information
- If certain details are unknown, gracefully omit them rather than guessing
- Write in flowing paragraphs, not bullet points
- Focus on their musical career and impact on hip-hop culture
- Be engaging and informative for hip-hop fans`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status}`, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response');
      return null;
    }

    return content.trim();
  } catch (error) {
    console.error('Error calling AI:', error);
    return null;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
