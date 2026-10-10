// Temporary one-shot helper: uploads the og-proxy worker script to Cloudflare
// via the connector gateway (multipart upload is not possible from the gateway tool).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WORKER_SCRIPT = `addEventListener('fetch', function(event) { event.respondWith(handleRequest(event.request)); });

var CRAWLERS = /facebookexternalhit|facebot|twitterbot|whatsapp|linkedinbot|slackbot|telegrambot|discordbot|applebot|imessage|googlebot|bingbot|pinterest|redditbot|skypeuripreview|mastodon|bluesky|threads/i;
var OG_FUNCTION = 'https://xzcmkssadekswmiqfbff.supabase.co/functions/v1/og-redirect';
var MAIN_SITE = 'https://spithierarchy.com';

async function handleRequest(request) {
  var url = new URL(request.url);
  var path = url.pathname;

  if (path === '/' || path === '') {
    return Response.redirect(MAIN_SITE + '/blog', 301);
  }

  var ua = request.headers.get('user-agent') || '';

  if (CRAWLERS.test(ua)) {
    var target = OG_FUNCTION + '?path=' + encodeURIComponent('/blog' + path);
    var resp = await fetch(target, { headers: { 'user-agent': ua }, cf: { cacheTtl: 3600, cacheEverything: true } });
    var html = await resp.text();
    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=3600',
        'x-robots-tag': 'index, follow'
      }
    });
  }

  return Response.redirect(MAIN_SITE + '/blog' + path + url.search, 301);
}
`;

serve(async (req) => {
  // Only allow calls carrying the service role key
  const auth = req.headers.get("authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!serviceKey || !auth.includes(serviceKey)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const CLOUDFLARE_API_KEY = Deno.env.get("CLOUDFLARE_API_KEY");
  if (!LOVABLE_API_KEY || !CLOUDFLARE_API_KEY) {
    return new Response(JSON.stringify({ error: "missing connector credentials" }), { status: 500 });
  }

  const accountId = "49cef9816981bee2a05b8b7e7d0dedaf";
  const url = `https://connector-gateway.lovable.dev/cloudflare/client/v4/accounts/${accountId}/workers/scripts/og-proxy`;

  const form = new FormData();
  form.append(
    "metadata",
    new File([JSON.stringify({ main_module: "worker.js" })], "metadata", { type: "application/json" }),
  );
  form.append(
    "worker.js",
    new File([WORKER_SCRIPT], "worker.js", { type: "application/javascript+module" }),
  );

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": CLOUDFLARE_API_KEY,
    },
    body: form,
  });

  const text = await resp.text();
  return new Response(JSON.stringify({ status: resp.status, body: text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
