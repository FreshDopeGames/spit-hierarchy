// Submits URLs to IndexNow (Bing, Yandex, etc.)
// Accepts: { urls: string[] } or { url: string }
// Can be called from the app, from DB triggers via pg_net, or manually.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOST = 'spithierarchy.com';
const KEY = 'be386f69fcfeb248fb2c677701ee45e0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    let urls: string[] = [];

    if (typeof body.url === 'string') urls = [body.url];
    if (Array.isArray(body.urls)) urls = body.urls;

    // Normalize: ensure absolute URLs on our host
    urls = urls
      .filter((u) => typeof u === 'string' && u.length > 0)
      .map((u) => (u.startsWith('http') ? u : `https://${HOST}${u.startsWith('/') ? '' : '/'}${u}`))
      .filter((u) => {
        try {
          return new URL(u).host === HOST;
        } catch {
          return false;
        }
      });

    if (urls.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid URLs provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // IndexNow allows up to 10,000 URLs per submission
    const payload = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.slice(0, 10000),
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log(`IndexNow submitted ${urls.length} URL(s) -> status ${res.status}`, text.slice(0, 200));

    return new Response(
      JSON.stringify({ status: res.status, submitted: urls.length, response: text }),
      {
        status: res.ok || res.status === 202 ? 200 : res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('IndexNow error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
