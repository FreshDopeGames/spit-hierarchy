import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSS_FEEDS = [
  { name: "XXL Mag", url: "https://www.xxlmag.com/feed" },
  { name: "The Source", url: "https://thesource.com/feed" },
  { name: "2DOPEBOYZ", url: "https://www.2dopeboyz.com/feed" },
  { name: "AllHipHop", url: "https://allhiphop.com/feed/" },
  { name: "Complex", url: "http://cdnl.complex.com/feeds/channels/all.xml" }
];

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting weekly hip-hop roundup generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all rappers and their aliases
    console.log('Fetching rappers and aliases...');
    const { data: rappers, error: rappersError } = await supabase
      .from('rappers')
      .select('name, aliases');
    
    if (rappersError) throw rappersError;

    // Build a set of all artist names and aliases (lowercase for matching)
    const artistNames = new Set<string>();
    rappers?.forEach(rapper => {
      artistNames.add(rapper.name.toLowerCase());
      if (rapper.aliases) {
        rapper.aliases.forEach((alias: string) => artistNames.add(alias.toLowerCase()));
      }
    });

    console.log(`Loaded ${artistNames.size} artist names and aliases`);

    // Fetch RSS feeds
    console.log('Fetching RSS feeds...');
    const allItems: RSSItem[] = [];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const feed of RSS_FEEDS) {
      try {
        console.log(`Fetching feed from ${feed.name}...`);
        const response = await fetch(feed.url);
        const xmlText = await response.text();
        
        // Parse RSS XML
        const items = parseRSSFeed(xmlText, feed.name, sevenDaysAgo);
        allItems.push(...items);
        console.log(`Found ${items.length} recent items from ${feed.name}`);
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
      }
    }

    console.log(`Total items fetched: ${allItems.length}`);

    // Filter items that mention artists in our database
    const relevantItems = allItems.filter(item => {
      const text = `${item.title} ${item.description}`.toLowerCase();
      return Array.from(artistNames).some(artist => text.includes(artist));
    });

    console.log(`Filtered to ${relevantItems.length} relevant items mentioning our artists`);

    if (relevantItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No relevant articles found this week' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prepare context for AI
    const articlesContext = relevantItems.map((item, i) => 
      `${i + 1}. ${item.title}\n   Source: ${item.source}\n   Link: ${item.link}\n   Summary: ${item.description}\n   Date: ${item.pubDate}`
    ).join('\n\n');

    const systemPrompt = `You are a hip-hop culture writer for Spit Hierarchy, a platform celebrating rap excellence. Your voice is sharp, playful, culturally rooted, and saturated in Hip-Hop flavor. Think street-smart insight plus that founder-on-the-grind energy.

Write a weekly blog post following this EXACT structure:

1. **Top 5 Headlines** — Quick bullets with title, source, and one-line hot-take.

2. **Deep Move Spotlight** — Pick one story with major industry implications (deal, tour, social move) and riff on how it affects culture + independent creators.

3. **New Drops & Aliased Plays** — List 3-4 new albums/singles or artist maneuvers; include link + why it matters for creators.

4. **Community Check-In** — Short call-out to Spit Hierarchy audience: what to watch next week, what to comment on, what to vote on.

Requirements:
- Use conversational, confident hip-hop vernacular but keep it accessible
- Example opening: "What up, people? It's once again that time for the weekly Spit Hierarchy Weekly Rap-Up..."
- Use contractions, rhythm, short punchy sentences
- Present tense when possible
- Weave in references to hustle, culture, creative control, Black & Brown excellence
- Include all links as proper HTML anchor tags
- Keep total length to 400-600 words
- End with a call to action for voting/commenting on Spit Hierarchy

Return ONLY the HTML content (no markdown), starting with an opening paragraph, then the four sections with proper HTML formatting (<h2>, <p>, <ul>, <a> tags, etc.).`;

    const userPrompt = `Here are this week's hip-hop articles to cover:\n\n${articlesContext}\n\nWrite the weekly roundup blog post.`;

    console.log('Generating blog post with Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI generation error:', aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0].message.content;

    console.log('Blog post generated, creating database entry...');

    // Get author - try Staff first, fallback to S2BKAS
    const { data: staffProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', 'staff')
      .maybeSingle();

    let authorId = staffProfile?.id;

    if (!authorId) {
      // Fallback to S2BKAS account as the primary blog author
      const S2BKAS_USER_ID = '6f9dbd2b-246e-43f1-9502-3fccc1699c06';
      console.log('Staff profile not found, using S2BKAS as author...');
      authorId = S2BKAS_USER_ID;
    }

    // Generate slug
    const now = new Date();
    const slug = `weekly-rap-up-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Create blog post
    const { data: blogPost, error: createError } = await supabase
      .from('blog_posts')
      .insert({
        title: `Weekly Rap-Up: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
        slug,
        content: generatedContent,
        excerpt: 'Your weekly roundup of the hottest moves, drops, and headlines from the hip-hop universe.',
        author_id: authorId,
        status: 'draft', // Set to draft for review
        featured_image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=630&fit=crop',
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('Blog post created successfully:', blogPost.id);

    return new Response(
      JSON.stringify({
        success: true,
        post_id: blogPost.id,
        post_slug: slug,
        items_processed: relevantItems.length,
        message: 'Weekly roundup generated and saved as draft'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-weekly-hip-hop-roundup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function parseRSSFeed(xml: string, sourceName: string, cutoffDate: Date): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple regex-based XML parsing (good enough for RSS)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex = /<link>(.*?)<\/link>/;
  const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/;
  const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = itemXml.match(titleRegex);
    const linkMatch = itemXml.match(linkRegex);
    const descMatch = itemXml.match(descriptionRegex);
    const dateMatch = itemXml.match(pubDateRegex);

    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
    const link = linkMatch ? linkMatch[1].trim() : '';
    const description = descMatch ? (descMatch[1] || descMatch[2] || '').replace(/<[^>]*>/g, '').trim() : '';
    const pubDate = dateMatch ? dateMatch[1].trim() : '';

    // Check if article is within the last 7 days
    const articleDate = new Date(pubDate);
    if (articleDate >= cutoffDate && title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        source: sourceName
      });
    }
  }

  return items;
}
