import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Words to never match as a rapper name/alias
const BLOCKLIST = new Set([
  "big", "ice", "young", "lil", "old", "baby", "king", "queen",
  "mr", "ms", "dj", "mc", "the", "a", "an", "future", "common",
  "game", "boss", "fat", "rich", "money", "love",
]);
// Re-allow Nas
BLOCKLIST.delete("nas");

// Names needing exact-case match (common phrases when lowercased)
const CASE_SENSITIVE_NAMES = new Set(["the game", "future", "common", "game"]);

const RSS_FEEDS = [
  { name: "XXL Mag", url: "https://www.xxlmag.com/feed" },
  { name: "The Source", url: "https://thesource.com/feed" },
  { name: "2DOPEBOYZ", url: "https://www.2dopeboyz.com/feed" },
  { name: "AllHipHop", url: "https://allhiphop.com/feed/" },
  { name: "Complex", url: "http://cdnl.complex.com/feeds/channels/all.xml" },
  { name: "Billboard", url: "https://www.billboard.com/c/hip-hop/feed/" },
  { name: "Spin", url: "https://www.spin.com/category/rap/feed/" },
  { name: "HotNewHipHop", url: "https://www.hotnewhiphop.com/rss" },
  { name: "HipHopDX", url: "https://hiphopdx.com/rss/news" },
  { name: "Rap-Up", url: "https://www.rap-up.com/feed/" },
  { name: "Pitchfork Rap", url: "https://pitchfork.com/rss/reviews/albums/" },
  { name: "Hypebeast Music", url: "https://hypebeast.com/music/feed" },
];

const REDDIT_SUBS = ["hiphopheads", "rap", "hiphop101"];

interface NewsItem {
  title: string;
  description: string;
  pubDate: string;
  source: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("Starting trending rappers generation...");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load rappers + aliases
    const { data: rappers, error: rappersError } = await supabase
      .from("rappers")
      .select("id, name, aliases");
    if (rappersError) throw rappersError;

    // Build matcher: lowercased name/alias -> rapper id
    type RapperRef = { id: string; displayName: string };
    const nameToRapper = new Map<string, RapperRef>();
    for (const r of rappers ?? []) {
      const ref = { id: r.id as string, displayName: r.name as string };
      const lname = (r.name as string).toLowerCase();
      if (!BLOCKLIST.has(lname)) nameToRapper.set(lname, ref);
      for (const alias of (r.aliases as string[] | null) ?? []) {
        const la = alias.toLowerCase();
        if (!BLOCKLIST.has(la) && la.length >= 3) {
          if (!nameToRapper.has(la)) nameToRapper.set(la, ref);
        }
      }
    }
    console.log(`Loaded ${nameToRapper.size} rapper name/alias entries`);

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Fetch RSS in parallel
    const rssResults = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { "User-Agent": "SpitHierarchy/1.0 (trending bot)" },
          });
          const xml = await res.text();
          return parseRSSFeed(xml, feed.name, threeDaysAgo);
        } catch (e) {
          console.error(`RSS error ${feed.name}:`, e);
          return [];
        }
      })
    );

    // Fetch Reddit JSON in parallel
    const redditResults = await Promise.allSettled(
      REDDIT_SUBS.map(async (sub) => {
        try {
          const res = await fetch(
            `https://www.reddit.com/r/${sub}/new.json?limit=100`,
            { headers: { "User-Agent": "SpitHierarchy/1.0 (trending bot)" } }
          );
          if (!res.ok) return [];
          const json = await res.json();
          return parseReddit(json, `Reddit r/${sub}`, threeDaysAgo);
        } catch (e) {
          console.error(`Reddit error r/${sub}:`, e);
          return [];
        }
      })
    );

    const allItems: NewsItem[] = [
      ...rssResults.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
      ...redditResults.flatMap((r) => (r.status === "fulfilled" ? r.value : [])),
    ];
    console.log(`Collected ${allItems.length} news/social items in last 3 days`);

    // Score rappers
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    type Agg = {
      id: string;
      displayName: string;
      mentions: number;
      score: number;
      sources: Set<string>;
    };
    const agg = new Map<string, Agg>();

    // Sort entries by name length desc to avoid partial-match issues
    const sortedEntries = Array.from(nameToRapper.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const item of allItems) {
      const haystackOriginal = `${item.title} ${item.description}`;
      const haystackLower = haystackOriginal.toLowerCase();
      const recencyAge = (now - new Date(item.pubDate).getTime()) / dayMs;
      const recencyWeight =
        recencyAge < 1 ? 1.0 : recencyAge < 2 ? 0.7 : 0.4;

      const matchedInThisItem = new Set<string>();
      for (const [lname, ref] of sortedEntries) {
        if (matchedInThisItem.has(ref.id)) continue;
        const caseSensitive = CASE_SENSITIVE_NAMES.has(lname);
        const pattern = new RegExp(
          `\\b${escapeRegex(caseSensitive ? ref.displayName : lname)}\\b`,
          caseSensitive ? "" : "i"
        );
        const target = caseSensitive ? haystackOriginal : haystackLower;
        if (pattern.test(target)) {
          matchedInThisItem.add(ref.id);
          let entry = agg.get(ref.id);
          if (!entry) {
            entry = {
              id: ref.id,
              displayName: ref.displayName,
              mentions: 0,
              score: 0,
              sources: new Set(),
            };
            agg.set(ref.id, entry);
          }
          entry.mentions += 1;
          entry.score += recencyWeight;
          entry.sources.add(item.source);
        }
      }
    }

    // Add source diversity bonus
    for (const entry of agg.values()) {
      entry.score += entry.sources.size * 0.5;
    }

    // Sort + take top 5
    const ranked = Array.from(agg.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.mentions !== a.mentions) return b.mentions - a.mentions;
        return a.displayName.localeCompare(b.displayName);
      })
      .slice(0, 5);

    console.log(`Top 5 trending:`, ranked.map((r) => `${r.displayName} (${r.score.toFixed(1)}, ${r.mentions}m, ${r.sources.size}s)`));

    // Fallback: fill remaining slots from recent blog posts mentioning rappers
    if (ranked.length < 5) {
      console.log(`Only ${ranked.length} from RSS/Reddit — attempting blog fallback`);
      const existingIds = new Set(ranked.map((r) => r.id));
      const fallback = await fetchBlogFallback(supabase, existingIds, 5 - ranked.length);
      for (const f of fallback) {
        ranked.push({
          id: f.id,
          displayName: f.displayName,
          mentions: 0,
          score: 0.1,
          sources: new Set([f.source]),
        });
      }
      console.log(`After blog fallback: ${ranked.length} rappers`);
    }

    if (ranked.length === 0) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_matches", matched: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert snapshot
    const generatedAt = new Date().toISOString();
    const rows = ranked.map((r, idx) => ({
      rapper_id: r.id,
      rank: idx + 1,
      mention_count: r.mentions,
      sources: Array.from(r.sources),
      score: Number(r.score.toFixed(3)),
      generated_at: generatedAt,
    }));

    const { error: insertError } = await supabase
      .from("trending_rappers")
      .insert(rows);
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        generated_at: generatedAt,
        items_processed: allItems.length,
        top: ranked.map((r, i) => ({
          rank: i + 1,
          name: r.displayName,
          mentions: r.mentions,
          score: r.score,
          sources: r.sources.size,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-trending-rappers error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseRSSFeed(xml: string, source: string, cutoff: Date): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/;
  const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>/;

  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const inner = m[1];
    const title = (inner.match(titleRegex)?.[1] ?? "").trim();
    const desc = (inner.match(descRegex)?.[1] ?? "").replace(/<[^>]*>/g, "").trim();
    const date = (inner.match(dateRegex)?.[1] ?? "").trim();
    if (!title || !date) continue;
    const d = new Date(date);
    if (isNaN(d.getTime()) || d < cutoff) continue;
    items.push({ title, description: desc, pubDate: date, source });
  }
  return items;
}

function parseReddit(json: any, source: string, cutoff: Date): NewsItem[] {
  const items: NewsItem[] = [];
  const children = json?.data?.children ?? [];
  for (const c of children) {
    const d = c?.data;
    if (!d) continue;
    const created = new Date((d.created_utc ?? 0) * 1000);
    if (created < cutoff) continue;
    items.push({
      title: d.title ?? "",
      description: d.selftext ?? "",
      pubDate: created.toISOString(),
      source,
    });
  }
  return items;
}

// Extracts /rapper/<slug> links from blog markdown content
function extractRapperSlugsFromContent(content: string): string[] {
  const regex = /\[([^\]]+)\]\((?:https:\/\/spithierarchy\.com)?\/rapper\/([^)#?\s]+)/g;
  const slugs: string[] = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    const slug = m[2];
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }
  return slugs;
}

// Fetch recent published blog posts and pull rappers mentioned via /rapper/<slug> links.
// Walks posts newest first until 2 posts WITH mentions have been consumed, then returns
// up to `needed` rappers (excluding any already in `existingIds`) in mention order.
async function fetchBlogFallback(
  supabase: ReturnType<typeof createClient>,
  existingIds: Set<string>,
  needed: number
): Promise<Array<{ id: string; displayName: string; source: string }>> {
  if (needed <= 0) return [];

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug, content, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  if (error || !posts?.length) {
    console.error("Blog fallback query error:", error);
    return [];
  }

  const collected: Array<{ slug: string; postSlug: string }> = [];
  const seenSlugs = new Set<string>();
  let postsWithMentions = 0;

  for (const post of posts as Array<{ slug: string; content: string }>) {
    const slugs = extractRapperSlugsFromContent(post.content || "");
    if (slugs.length === 0) continue;
    for (const s of slugs) {
      if (!seenSlugs.has(s)) {
        seenSlugs.add(s);
        collected.push({ slug: s, postSlug: post.slug });
      }
    }
    postsWithMentions += 1;
    if (postsWithMentions >= 2) break;
  }

  if (collected.length === 0) return [];

  const { data: rappers } = await supabase
    .from("rappers")
    .select("id, name, slug")
    .in("slug", collected.map((c) => c.slug));

  if (!rappers?.length) return [];

  const bySlug = new Map<string, { id: string; name: string }>();
  for (const r of rappers as Array<{ id: string; name: string; slug: string }>) {
    bySlug.set(r.slug, { id: r.id, name: r.name });
  }

  const result: Array<{ id: string; displayName: string; source: string }> = [];
  for (const c of collected) {
    const r = bySlug.get(c.slug);
    if (!r || existingIds.has(r.id)) continue;
    if (result.find((x) => x.id === r.id)) continue;
    result.push({ id: r.id, displayName: r.name, source: `blog:${c.postSlug}` });
    if (result.length >= needed) break;
  }
  return result;
}
  }
  return items;
}
