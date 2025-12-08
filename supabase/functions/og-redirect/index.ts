import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://spithierarchy.com";
const DEFAULT_IMAGE = "https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/rapper-images/Logo_Rect_02.png";

function getOgImageUrl(featuredImageUrl: string | null): string {
  if (!featuredImageUrl) return DEFAULT_IMAGE;
  
  try {
    const parsed = JSON.parse(featuredImageUrl);
    // Prioritize hero > large > medium > thumbnail
    return parsed.hero || parsed.large || parsed.medium || parsed.thumbnail || DEFAULT_IMAGE;
  } catch {
    // If it's not JSON, it's a plain URL
    return featuredImageUrl || DEFAULT_IMAGE;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: blogPost, error } = await supabase
      .from("blog_posts")
      .select(`
        id,
        title,
        excerpt,
        meta_title,
        meta_description,
        featured_image_url,
        published_at,
        profiles:author_id (username, full_name)
      `)
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !blogPost) {
      console.error("Blog post not found:", slug, error);
      // Redirect to blog listing if post not found
      return new Response(null, {
        status: 302,
        headers: { ...corsHeaders, Location: `${SITE_URL}/blog` },
      });
    }

    const canonicalUrl = `${SITE_URL}/blog/${slug}`;
    const ogImage = getOgImageUrl(blogPost.featured_image_url);
    const title = escapeHtml(blogPost.meta_title || `${blogPost.title} | Spit Hierarchy Blog`);
    const description = escapeHtml(
      blogPost.meta_description || 
      blogPost.excerpt || 
      "Read the latest hip-hop news and culture on Spit Hierarchy Blog."
    );
    const authorName = blogPost.profiles?.full_name || blogPost.profiles?.username || "Spit Hierarchy";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Spit Hierarchy">
  <meta property="article:author" content="${escapeHtml(authorName)}">
  ${blogPost.published_at ? `<meta property="article:published_time" content="${blogPost.published_at}">` : ""}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${canonicalUrl}">
  
  <!-- Redirect for real users -->
  <script>window.location.href = "${canonicalUrl}";</script>
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
</head>
<body>
  <p>Redirecting to <a href="${canonicalUrl}">${escapeHtml(blogPost.title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("og-redirect error:", error);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
});
