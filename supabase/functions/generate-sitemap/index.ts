import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
}

const SITE_URL = 'https://spithierarchy.com'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const urls: SitemapUrl[] = []
    const today = new Date().toISOString().split('T')[0]

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/rankings', priority: '0.9', changefreq: 'daily' },
      { path: '/blog', priority: '0.9', changefreq: 'daily' },
      { path: '/vs', priority: '0.8', changefreq: 'daily' },
      { path: '/all-rappers', priority: '0.9', changefreq: 'weekly' },
      { path: '/quiz', priority: '0.7', changefreq: 'weekly' },
      { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { path: '/terms', priority: '0.3', changefreq: 'yearly' },
      { path: '/cookies', priority: '0.3', changefreq: 'yearly' },
    ]

    for (const page of staticPages) {
      urls.push({
        loc: `${SITE_URL}${page.path}`,
        lastmod: today,
        changefreq: page.changefreq,
        priority: page.priority,
      })
    }

    // Fetch all rappers
    const { data: rappers, error: rappersError } = await supabase
      .from('rappers')
      .select('slug, updated_at')
      .order('activity_score', { ascending: false })
      .limit(5000)

    if (rappersError) {
      console.error('Error fetching rappers:', rappersError)
    } else if (rappers) {
      for (const rapper of rappers) {
        urls.push({
          loc: `${SITE_URL}/rapper/${rapper.slug}`,
          lastmod: rapper.updated_at ? rapper.updated_at.split('T')[0] : today,
          changefreq: 'weekly',
          priority: '0.7',
        })
      }
      console.log(`Added ${rappers.length} rapper URLs`)
    }

    // Fetch published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)

    if (blogError) {
      console.error('Error fetching blog posts:', blogError)
    } else if (blogPosts) {
      for (const post of blogPosts) {
        urls.push({
          loc: `${SITE_URL}/blog/${post.slug}`,
          lastmod: post.updated_at ? post.updated_at.split('T')[0] : post.published_at?.split('T')[0] || today,
          changefreq: 'monthly',
          priority: '0.6',
        })
      }
      console.log(`Added ${blogPosts.length} blog post URLs`)
    }

    // Fetch official rankings
    const { data: rankings, error: rankingsError } = await supabase
      .from('official_rankings')
      .select('slug, updated_at')
      .order('display_order', { ascending: true })
      .limit(500)

    if (rankingsError) {
      console.error('Error fetching rankings:', rankingsError)
    } else if (rankings) {
      for (const ranking of rankings) {
        urls.push({
          loc: `${SITE_URL}/rankings/${ranking.slug}`,
          lastmod: ranking.updated_at ? ranking.updated_at.split('T')[0] : today,
          changefreq: 'daily',
          priority: '0.8',
        })
      }
      console.log(`Added ${rankings.length} ranking URLs`)
    }

    // Fetch VS matches
    const { data: vsMatches, error: vsError } = await supabase
      .from('vs_matches')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(500)

    if (vsError) {
      console.error('Error fetching VS matches:', vsError)
    } else if (vsMatches) {
      for (const match of vsMatches) {
        urls.push({
          loc: `${SITE_URL}/vs/${match.slug}`,
          lastmod: match.updated_at ? match.updated_at.split('T')[0] : today,
          changefreq: 'weekly',
          priority: '0.6',
        })
      }
      console.log(`Added ${vsMatches.length} VS match URLs`)
    }

    console.log(`Total sitemap URLs: ${urls.length}`)

    const sitemap = generateSitemapXml(urls)

    return new Response(sitemap, {
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://spithierarchy.com/</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    )
  }
})
