import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pure-noise tokens: never match these as a name/alias (no artist is named exactly this)
const HARD_BLOCKLIST = new Set([
  "lil", "mr", "ms", "dj", "mc", "the", "a", "an", "old", "big", "young", "baby",
]);

// Everyday English words: any rapper name/alias equal to one of these is
// automatically context-gated even if the DB flag isn't set.
const COMMON_WORDS = new Set([
  "evidence", "common", "future", "game", "eve", "logic", "buddy", "juvenile",
  "papoose", "onyx", "scarface", "conway", "shad", "freeway", "boss", "king",
  "queen", "fat", "rich", "money", "love", "ice", "blu", "clipse", "trina",
  "mase", "saigon", "noname", "drake", "nas", "cash", "gold", "hustle", "trap",
  "flow", "bars", "wave", "vision", "prince", "legend", "sauce", "smoke",
]);

// Hip-hop context keywords that confirm an ambiguous name really means the artist
const CONTEXT_KEYWORDS = [
  "rapper", "rap ", "hip-hop", "hip hop", "mc ", "emcee", "album", "mixtape",
  "single", "track", "song", "verse", "bars", "feat.", "featuring", "ft.",
  "dropped", "drops", "drop ", "released", "release", "lp", "ep ", "tour",
  "music video", "freestyle", "collab", "producer", "beat", "billboard",
  "grammy", "diss", "cypher", "studio", "streaming", "spotify", "tracklist",
];

// Feeds that are rap-only: context keyword requirement relaxes (exact case still required)
const RAP_ONLY_SOURCES = new Set([
  "2DOPEBOYZ", "HipHopDX", "The Source", "AllHipHop", "XXL Mag", "Rap-Up",
  "HotNewHipHop", "Reddit r/hiphopheads", "Reddit r/rap", "Reddit r/hiphop101",
]);

const CONTEXT_WINDOW = 120;


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
  url?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const __serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Auth: cron shared secret OR service role OR admin user
  const __cronSecret = req.headers.get('x-cron-secret');
  let __authorized = false;

  if (__cronSecret) {
    const __svc = createClient(Deno.env.get('SUPABASE_URL')!, __serviceKey);
    const { data: __ok, error: __okErr } = await __svc.rpc('verify_cron_secret', { _secret: __cronSecret });
    if (__okErr) console.error('verify_cron_secret error:', __okErr);
    if (__ok === true) __authorized = true;
  }


  if (!__authorized) {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const __token = authHeader.replace('Bearer ', '');
    if (__token !== __serviceKey) {
      const __authClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: `Bearer ${__token}` } } }
      );
      const { data: __claims, error: __claimsErr } = await __authClient.auth.getClaims(__token);
      if (__claimsErr || !__claims?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const { data: __isAdmin } = await __authClient.rpc('is_admin');
      if (!__isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }
  }



  try {
    console.log("Starting trending rappers generation...");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load rappers + aliases
    const { data: rappers, error: rappersError } = await supabase
      .from("rappers")
      .select("id, name, aliases, requires_context_match");
    if (rappersError) throw rappersError;

    // Build matcher: lowercased name/alias -> rapper entry
    const nameToRapper = new Map<string, MatchEntry>();
    for (const r of rappers ?? []) {
      const flagged = r.requires_context_match === true;
      const name = r.name as string;
      const lname = name.toLowerCase();
      if (!HARD_BLOCKLIST.has(lname)) {
        nameToRapper.set(lname, {
          id: r.id as string,
          displayName: name,
          matchText: name,
          needsContext: flagged || isCommonWord(lname),
        });
      }
      for (const alias of (r.aliases as string[] | null) ?? []) {
        const la = alias.toLowerCase();
        if (HARD_BLOCKLIST.has(la) || la.length < 3) continue;
        if (nameToRapper.has(la)) continue;
        nameToRapper.set(la, {
          id: r.id as string,
          displayName: name,
          matchText: alias,
          // Aliases are riskier: gate them whenever the artist is flagged,
          // the alias is a common word, or the alias is a single short word.
          needsContext:
            flagged || isCommonWord(la) || (!la.includes(" ") && la.length <= 5),
        });
      }
    }
    const ambiguousCount = Array.from(nameToRapper.values()).filter((e) => e.needsContext).length;
    console.log(
      `Loaded ${nameToRapper.size} rapper name/alias entries (${ambiguousCount} context-gated)`
    );


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

    // Collected article links per matched rapper (for the "In The News" card)
    type MentionRow = {
      rapper_id: string;
      title: string;
      url: string;
      source: string;
      published_at: string;
    };
    const mentionRows: MentionRow[] = [];
    const seenMentionKeys = new Set<string>();

    // Sort entries by name length desc to avoid partial-match issues
    const sortedEntries = Array.from(nameToRapper.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );
    // Two passes: unambiguous names first so they can vouch for ambiguous ones
    const unambiguousEntries = sortedEntries.filter(([, e]) => !e.needsContext);
    const ambiguousEntries = sortedEntries.filter(([, e]) => e.needsContext);

    let rejectedCount = 0;

    for (const item of allItems) {
      const haystackOriginal = `${item.title} ${item.description}`;
      const haystackLower = haystackOriginal.toLowerCase();
      const recencyAge = (now - new Date(item.pubDate).getTime()) / dayMs;
      const recencyWeight =
        recencyAge < 1 ? 1.0 : recencyAge < 2 ? 0.7 : 0.4;

      const matchedInThisItem = new Set<string>();

      const record = (entry: MatchEntry) => {
        matchedInThisItem.add(entry.id);
        let a = agg.get(entry.id);
        if (!a) {
          a = {
            id: entry.id,
            displayName: entry.displayName,
            mentions: 0,
            score: 0,
            sources: new Set(),
          };
          agg.set(entry.id, a);
        }
        a.mentions += 1;
        a.score += recencyWeight;
        a.sources.add(item.source);

        if (item.url && item.title) {
          const key = `${entry.id}|${item.url}`;
          if (!seenMentionKeys.has(key)) {
            seenMentionKeys.add(key);
            const pub = new Date(item.pubDate);
            mentionRows.push({
              rapper_id: entry.id,
              title: item.title.slice(0, 400),
              url: item.url,
              source: item.source,
              published_at: isNaN(pub.getTime())
                ? new Date().toISOString()
                : pub.toISOString(),
            });
          }
        }
      };

      // Pass 1: names that are not everyday words
      for (const [lname, entry] of unambiguousEntries) {
        if (matchedInThisItem.has(entry.id)) continue;
        const pattern = new RegExp(`\\b${escapeRegex(lname)}\\b`, "i");
        if (pattern.test(haystackLower)) record(entry);
      }

      // Pass 2: everyday-word names — require exact casing + hip-hop context
      for (const [lname, entry] of ambiguousEntries) {
        if (matchedInThisItem.has(entry.id)) continue;
        const idx = findExactCaseIndex(haystackOriginal, entry.matchText);
        if (idx < 0) {
          // The word may still be present in lowercase form — that's a rejection worth logging
          if (new RegExp(`\\b${escapeRegex(lname)}\\b`, "i").test(haystackLower)) {
            rejectedCount += 1;
            console.log(
              `Rejected "${entry.displayName}" (casing) — [${item.source}] ${item.title.slice(0, 90)}`
            );
          }
          continue;
        }
        const reason = confirmContext(
          haystackOriginal,
          idx,
          entry.matchText.length,
          item.source,
          matchedInThisItem.size > 0
        );
        if (reason) {
          record(entry);
        } else {
          rejectedCount += 1;
          console.log(
            `Rejected "${entry.displayName}" (no hip-hop context) — [${item.source}] ${item.title.slice(0, 90)}`
          );
        }
      }
    }

    console.log(`Rejected ${rejectedCount} ambiguous candidate matches`);


    // Persist media mentions (all matched rappers, not just the top 5)
    if (mentionRows.length > 0) {
      for (let i = 0; i < mentionRows.length; i += 500) {
        const chunk = mentionRows.slice(i, i + 500);
        const { error: mentionErr } = await supabase
          .from("rapper_media_mentions")
          .upsert(chunk, { onConflict: "rapper_id,url", ignoreDuplicates: true });
        if (mentionErr) console.error("Mention upsert error:", mentionErr);
      }
      console.log(`Upserted ${mentionRows.length} media mentions`);
    }

    // Prune mentions older than 30 days
    {
      const cutoff = new Date(Date.now() - 30 * dayMs).toISOString();
      const { error: pruneErr } = await supabase
        .from("rapper_media_mentions")
        .delete()
        .lt("published_at", cutoff);
      if (pruneErr) console.error("Mention prune error:", pruneErr);
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
        rejected_count: rejectedCount,

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

type MatchEntry = {
  id: string;
  displayName: string;
  /** The exact text (name or alias) this entry matches on */
  matchText: string;
  /** Everyday-word name: needs exact casing + hip-hop context to count */
  needsContext: boolean;
};

function isCommonWord(lowered: string): boolean {
  if (COMMON_WORDS.has(lowered)) return true;
  // Multi-word names count as common only if every token is a common word
  const parts = lowered.split(/\s+/).filter((p) => p && p !== "the");
  return parts.length > 1 && parts.every((p) => COMMON_WORDS.has(p));
}

/** Index of an exact-case, word-bounded occurrence of `needle`, or -1 */
function findExactCaseIndex(haystack: string, needle: string): number {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])(${escapeRegex(needle)})(?![\\p{L}\\p{N}])`, "u");
  const m = re.exec(haystack);
  return m ? m.index + m[1].length : -1;
}

/**
 * Confirms an ambiguous name really refers to the artist.
 * Returns the reason it was accepted, or null when there is no supporting signal.
 */
function confirmContext(
  haystack: string,
  matchIndex: number,
  matchLength: number,
  source: string,
  hasOtherRapperInItem: boolean
): string | null {
  const start = Math.max(0, matchIndex - CONTEXT_WINDOW);
  const end = Math.min(haystack.length, matchIndex + matchLength + CONTEXT_WINDOW);
  const window = haystack.slice(start, end).toLowerCase();

  if (CONTEXT_KEYWORDS.some((k) => window.includes(k))) return "keyword";

  // Quoted or possessive usage — "Evidence" / Evidence's
  const before = haystack[matchIndex - 1] ?? "";
  const after = haystack.slice(matchIndex + matchLength, matchIndex + matchLength + 2);
  if (/["'“‘]/.test(before) || /^['’]s\b/.test(after)) return "quoted_or_possessive";

  if (hasOtherRapperInItem) return "co_mention";
  if (RAP_ONLY_SOURCES.has(source)) return "rap_only_source";

  return null;
}

function escapeRegex(s: string): string {

  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseRSSFeed(xml: string, source: string, cutoff: Date): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/;
  const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/;
  const dateRegex = /<pubDate>(.*?)<\/pubDate>/;
  const linkRegex = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/;

  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const inner = m[1];
    const title = decodeEntities((inner.match(titleRegex)?.[1] ?? "").trim());
    const desc = (inner.match(descRegex)?.[1] ?? "").replace(/<[^>]*>/g, "").trim();
    const date = (inner.match(dateRegex)?.[1] ?? "").trim();
    let url = (inner.match(linkRegex)?.[1] ?? "").trim();
    if (!url) {
      url = (inner.match(/<guid[^>]*>(https?:\/\/[^<]+)<\/guid>/)?.[1] ?? "").trim();
    }
    if (!title || !date) continue;
    const d = new Date(date);
    if (isNaN(d.getTime()) || d < cutoff) continue;
    items.push({
      title,
      description: desc,
      pubDate: date,
      source,
      url: url.startsWith("http") ? decodeEntities(url) : undefined,
    });
  }
  return items;
}

function decodeEntities(s: string): string {
  const named: Record<string, string> = {
    amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
    nbsp: " ", mdash: "—", ndash: "–", hellip: "…",
    lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"',
  };
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
    if (body[0] === "#") {
      const code = body[1]?.toLowerCase() === "x"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      if (Number.isFinite(code)) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      return match;
    }
    return named[body] ?? match;
  });
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
      title: decodeEntities(d.title ?? ""),
      description: d.selftext ?? "",
      pubDate: created.toISOString(),
      source,
      url: d.permalink ? `https://www.reddit.com${d.permalink}` : (d.url ?? undefined),
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

