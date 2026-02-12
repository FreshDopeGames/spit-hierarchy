import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common words that should never be matched as rapper names/aliases
const BLOCKLIST = new Set([
  'big', 'ice', 'young', 'lil', 'old', 'baby', 'king', 'queen',
  'mr', 'ms', 'dj', 'mc', 'the', 'a', 'an'
]);

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

    // Fetch all rappers and their aliases with slugs
    console.log('Fetching rappers and aliases...');
    const { data: rappers, error: rappersError } = await supabase
      .from('rappers')
      .select('name, aliases, slug');
    
    if (rappersError) throw rappersError;

    // Build a set of all artist names and aliases (lowercase for matching)
    const artistNames = new Set<string>();
    // Build a map of artist names/aliases to their Spit Hierarchy URLs
    const artistLinkMap = new Map<string, { name: string; url: string }>();
    const siteBaseUrl = 'https://spithierarchy.com';

    rappers?.forEach(rapper => {
      artistNames.add(rapper.name.toLowerCase());
      const rapperUrl = `${siteBaseUrl}/rapper/${rapper.slug}`;
      
      // Add primary name to link map
      artistLinkMap.set(rapper.name.toLowerCase(), { 
        name: rapper.name, 
        url: rapperUrl 
      });
      
      // Add aliases (skip blocklisted words)
      if (rapper.aliases) {
        rapper.aliases.forEach((alias: string) => {
          if (!BLOCKLIST.has(alias.toLowerCase())) {
            artistNames.add(alias.toLowerCase());
            // Add alias to link map (links to same rapper page)
            artistLinkMap.set(alias.toLowerCase(), { 
              name: alias, 
              url: rapperUrl 
            });
          }
        });
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

    // Diversify sources before passing to AI (round-robin selection)
    const diversifiedItems = diversifyArticlesBySource(relevantItems, 15);
    console.log(`Diversified to ${diversifiedItems.length} items across sources`);
    
    // Log source distribution for debugging
    const sourceCount: Record<string, number> = {};
    diversifiedItems.forEach(item => {
      sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
    });
    console.log('Source distribution:', JSON.stringify(sourceCount));

    // Prepare context for AI
    const articlesContext = diversifiedItems.map((item, i) => 
      `${i + 1}. ${item.title}\n   Source: ${item.source}\n   Link: ${item.link}\n   Summary: ${item.description}\n   Date: ${item.pubDate}`
    ).join('\n\n');

    const systemPrompt = `You are a hip-hop culture writer for Spit Hierarchy, a platform celebrating rap excellence. Your voice is sharp, witty, culturally rooted, and saturated in Hip-Hop flavor. Think barbershop debate energy meets music journalism.

OPENING STYLE: Vary your opening EVERY week. NEVER start with "What up, people" or any version of "It's that time again." Rotate between: leading with the week's biggest headline, a rhetorical question, a bold cultural statement, a quick-hit summary of the week's energy, or a hot take that sets the tone. Be unpredictable.

Write a weekly blog post following this EXACT structure:

1. **Top 5 Headlines** — Quick bullets. CRITICAL: Select from at least 3-4 DIFFERENT sources. EVERY headline MUST include a clickable source link. Format each exactly as:
   *   **Headline Title** - [Source Name](article_url): One-line hot take. Be witty, opinionated, and brief. No life lessons.
   Example: *   **Drake Announces Tour** - [XXL Mag](https://www.xxlmag.com/drake-tour/): Drizzy about to run up numbers again.

2. **Deep Move Spotlight** — Pick one story with major industry implications (deal, tour, social move) and riff on how it affects culture. THIS is the only section where you can touch on what it means for independent creators or the hustle. Include a link to the source article.

3. **New Drops & Aliased Plays** — List 3-4 new albums/singles or artist maneuvers. EVERY item MUST include a clickable source link. Format each exactly as:
   *   **Artist - Title/News** - [Source Name](article_url): Sharp, opinionated take on why it matters.
   CRITICAL: Do NOT repeat any story already covered in Top 5 Headlines. Each section covers DIFFERENT stories.

4. **Community Check-In** — Reference SPECIFIC Spit Hierarchy features: vote on rapper rankings at spithierarchy.com, check out a specific rapper's profile page, weigh in on a debate in the rankings, take the hip-hop knowledge quiz, etc. Never use generic "hit the comments below" or "let us know what you think."

CRITICAL Requirements:
- EVERY bullet point in Top 5 Headlines and New Drops MUST have a clickable [Source Name](url) link
- Do NOT add any markdown links to rapper names -- links to rapper profiles are added automatically in post-processing. Just write their names as plain text.
- Use conversational, confident hip-hop vernacular but keep it accessible
- Use contractions, rhythm, short punchy sentences
- Present tense when possible
- Encourage humor, hot takes, slang, and unpredictable phrasing -- avoid repeating the same cadence every week
- Keep total length to 350-500 words
- Stories in Top 5 Headlines MUST NOT repeat in New Drops

Return ONLY markdown content using:
- **bold** for emphasis
- ## for section headers
- * for bullet lists (use asterisk, not dash)
- [text](url) for source links ONLY (not for rapper names)
- Regular paragraphs separated by blank lines`;

    const rapperNamesList = rappers?.map(r => r.name).join(', ') || '';
    const userPrompt = `Here are this week's hip-hop articles to cover:\n\n${articlesContext}\n\nArtists in our database (use exact names as written, do NOT add markdown links to them): ${rapperNamesList}\n\nWrite the weekly roundup blog post.`;

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
    const rawContent = aiData.choices[0].message.content;

    // Post-process content to wrap rapper mentions with links
    const generatedContent = wrapRapperMentionsWithLinks(rawContent, artistLinkMap);
    console.log('Blog post generated and rapper links added, creating database entry...');

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

    // Calculate Sunday of the current week in Pacific Time
    const getSundayInPacific = (): Date => {
      const now = new Date();
      // Get current time in Pacific timezone
      const pacificTimeStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
      const pacificTime = new Date(pacificTimeStr);
      
      // Calculate days until Sunday (0 = Sunday, 6 = Saturday)
      const dayOfWeek = pacificTime.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      
      // Add days to get to Sunday
      pacificTime.setDate(pacificTime.getDate() + daysUntilSunday);
      
      return pacificTime;
    };

    const sundayDate = getSundayInPacific();
    const slug = `weekly-rap-up-${sundayDate.getFullYear()}-${String(sundayDate.getMonth() + 1).padStart(2, '0')}-${String(sundayDate.getDate()).padStart(2, '0')}`;

    // Create blog post
    const { data: blogPost, error: createError } = await supabase
      .from('blog_posts')
      .insert({
        title: `Weekly Rap-Up: ${sundayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
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

// Helper to escape special regex characters
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Names that are common phrases when lowercase - require exact case match
const CASE_SENSITIVE_NAMES = new Set([
  'the game'
]);

// Post-process content to wrap rapper mentions with markdown links
function wrapRapperMentionsWithLinks(
  content: string, 
  artistLinkMap: Map<string, { name: string; url: string }>
): string {
  let processedContent = content;
  
  // Common words that follow rapper name-like words in non-rapper contexts
  // e.g., "future generations", "future plans", "ice cold"
  const CONTEXT_BLOCKLIST = [
    'generations', 'plans', 'projects', 'releases', 'music', 'years',
    'of', 'the', 'is', 'are', 'was', 'will', 'would', 'could', 'should',
    'cold', 'cream', 'berg', 'breaker', 'skating'
  ];
  
  // Sort by name length (longest first) to avoid partial replacements
  // e.g., "Ice Cube" should be matched before "Ice"
  const sortedArtists = Array.from(artistLinkMap.entries())
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [lowerName, { name, url }] of sortedArtists) {
    // Skip single-word names that are common English words (extra safety)
    if (name.length <= 3 && !name.includes(' ')) continue;
    
    // Check if this name requires case-sensitive matching
    const requiresCaseSensitive = CASE_SENSITIVE_NAMES.has(lowerName);
    
    // Use word boundary regex to match whole names only
    // Negative lookahead to skip text already inside markdown links
    // Use 'g' only for case-sensitive names, 'gi' for others
    const regex = new RegExp(
      `\\b(${escapeRegex(name)})\\b(?![^\\[]*\\])`, 
      requiresCaseSensitive ? 'g' : 'gi'
    );
    
    processedContent = processedContent.replace(regex, (match, group1, offset) => {
      // Check if position is inside a markdown URL (between ]( and ))
      const beforeMatch = processedContent.slice(0, offset);
      const lastLinkOpen = beforeMatch.lastIndexOf('](');
      if (lastLinkOpen !== -1) {
        const betweenLinkAndMatch = beforeMatch.slice(lastLinkOpen);
        // If we found ]( but no closing ) yet, we're inside a URL
        if (!betweenLinkAndMatch.includes(')')) {
          return match; // Inside a markdown URL, don't wrap
        }
      }
      
      // Check if already inside markdown link text [...]
      const lastOpenBracket = beforeMatch.lastIndexOf('[');
      const lastCloseBracket = beforeMatch.lastIndexOf(']');
      if (lastOpenBracket > lastCloseBracket) {
        return match; // Inside markdown link text, don't wrap
      }
      
      // Check if followed by a context word that suggests non-rapper usage
      const afterMatch = processedContent.slice(offset + match.length, offset + match.length + 20).toLowerCase();
      for (const contextWord of CONTEXT_BLOCKLIST) {
        if (afterMatch.startsWith(` ${contextWord}`) || afterMatch.startsWith(` ${contextWord}s`)) {
          return match; // Don't link - likely not referring to the rapper
        }
      }
      return `[${match}](${url})`;
    });
  }
  
  return processedContent;
}

// Diversify articles by source using round-robin selection
function diversifyArticlesBySource(items: RSSItem[], maxItems: number = 15): RSSItem[] {
  // Group by source
  const bySource: Map<string, RSSItem[]> = new Map();
  for (const item of items) {
    if (!bySource.has(item.source)) {
      bySource.set(item.source, []);
    }
    bySource.get(item.source)!.push(item);
  }
  
  const sources = Array.from(bySource.keys());
  const diversified: RSSItem[] = [];
  let sourceIndex = 0;
  let emptyRounds = 0;
  
  // Round-robin selection until we hit maxItems or run out
  while (diversified.length < maxItems && emptyRounds < sources.length) {
    const source = sources[sourceIndex % sources.length];
    const sourceItems = bySource.get(source)!;
    
    if (sourceItems.length > 0) {
      diversified.push(sourceItems.shift()!);
      emptyRounds = 0;
    } else {
      emptyRounds++;
    }
    
    sourceIndex++;
  }
  
  return diversified;
}

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
