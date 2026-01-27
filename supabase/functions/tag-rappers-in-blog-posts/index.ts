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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, all = false, dryRun = false } = await req.json();
    
    console.log('Starting rapper tagging...', { postId, all, dryRun });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all rappers with names, aliases, and slugs
    console.log('Fetching rappers and aliases...');
    const { data: rappers, error: rappersError } = await supabase
      .from('rappers')
      .select('name, aliases, slug');
    
    if (rappersError) throw rappersError;

    // Build artist link map
    const artistLinkMap = new Map<string, { name: string; url: string }>();
    const siteBaseUrl = 'https://spithierarchy.com';

    rappers?.forEach(rapper => {
      const rapperUrl = `${siteBaseUrl}/rapper/${rapper.slug}`;
      
      // Add primary name
      artistLinkMap.set(rapper.name.toLowerCase(), { 
        name: rapper.name, 
        url: rapperUrl 
      });
      
      // Add aliases (skip blocklisted words)
      if (rapper.aliases) {
        rapper.aliases.forEach((alias: string) => {
          if (!BLOCKLIST.has(alias.toLowerCase())) {
            artistLinkMap.set(alias.toLowerCase(), { 
              name: alias, 
              url: rapperUrl 
            });
          }
        });
      }
    });

    console.log(`Loaded ${artistLinkMap.size} artist names and aliases`);

    // Fetch blog posts to process
    let query = supabase
      .from('blog_posts')
      .select('id, title, content');
    
    if (postId) {
      query = query.eq('id', postId);
    } else if (all) {
      // Get posts that don't already have rapper links
      query = query.not('content', 'like', '%](https://spithierarchy.com/rapper/%');
    }

    const { data: posts, error: postsError } = await query;
    if (postsError) throw postsError;

    console.log(`Found ${posts?.length || 0} posts to process`);

    const results: Array<{
      id: string;
      title: string;
      rappersLinked: number;
      updated: boolean;
    }> = [];

    for (const post of posts || []) {
      const originalContent = post.content;
      const processedContent = wrapRapperMentionsWithLinks(originalContent, artistLinkMap);
      
      // Count new links added
      const originalLinkCount = (originalContent.match(/\]\(https:\/\/spithierarchy\.com\/rapper\//g) || []).length;
      const newLinkCount = (processedContent.match(/\]\(https:\/\/spithierarchy\.com\/rapper\//g) || []).length;
      const rappersLinked = newLinkCount - originalLinkCount;

      if (rappersLinked > 0) {
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('blog_posts')
            .update({ content: processedContent })
            .eq('id', post.id);
          
          if (updateError) {
            console.error(`Error updating post ${post.id}:`, updateError);
            continue;
          }
        }

        results.push({
          id: post.id,
          title: post.title,
          rappersLinked,
          updated: !dryRun
        });

        console.log(`${dryRun ? '[DRY RUN] ' : ''}Post "${post.title}": ${rappersLinked} rappers linked`);
      }
    }

    const totalRappersLinked = results.reduce((sum, r) => sum + r.rappersLinked, 0);

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        postsProcessed: posts?.length || 0,
        postsUpdated: results.length,
        totalRappersLinked,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in tag-rappers-in-blog-posts:', error);
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

// Post-process content to wrap rapper mentions with markdown links
// Names that are common phrases when lowercase - require exact case match
const CASE_SENSITIVE_NAMES = new Set([
  'the game'
]);

function wrapRapperMentionsWithLinks(
  content: string, 
  artistLinkMap: Map<string, { name: string; url: string }>
): string {
  let processedContent = content;
  
  // Sort by name length (longest first) to avoid partial replacements
  const sortedArtists = Array.from(artistLinkMap.entries())
    .sort((a, b) => b[0].length - a[0].length);
  
  for (const [lowerName, { name, url }] of sortedArtists) {
    // Check if this name requires case-sensitive matching
    const requiresCaseSensitive = CASE_SENSITIVE_NAMES.has(lowerName);
    
    // Use word boundary regex to match whole names only
    // Negative lookahead to skip text already inside markdown links
    // Use 'g' only for case-sensitive names, 'gi' for others
    const regex = new RegExp(
      `\\b(${escapeRegex(name)})\\b(?![^\\[]*\\])`, 
      requiresCaseSensitive ? 'g' : 'gi'
    );
    
    processedContent = processedContent.replace(regex, (match) => {
      return `[${match}](${url})`;
    });
  }
  
  return processedContent;
}
