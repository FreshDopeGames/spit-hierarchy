// Submits URLs to IndexNow (Bing, Yandex, etc.)
// Accepts: { urls: string[] } or { url: string }
// Callable only by DB triggers (x-cron-secret), the server key, or a signed-in admin.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOST = 'spithierarchy.com';
const KEY = 'be386f69fcfeb248fb2c677701ee45e0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

// Allows: scheduled jobs (x-cron-secret checked against the vault), the server key, or a signed-in admin.
async function authorizeRequest(req: Request): Promise<Response | null> {
  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const deny = (status: number, error: string) =>
    new Response(JSON.stringify({ success: false, error }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret) {
    const svc = createClient(url, serviceKey);
    const { data: ok } = await svc.rpc('verify_cron_secret', { _secret: cronSecret });
    if (ok === true) return null;
  }

  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return deny(401, 'Unauthorized');
  const token = authHeader.slice(7);
  if (token === serviceKey) return null;

  const authClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: claims, error: claimsErr } = await authClient.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) return deny(401, 'Unauthorized');
  const { data: isAdmin } = await authClient.rpc('is_admin');
  if (isAdmin !== true) return deny(403, 'Admin access required');
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const denied = await authorizeRequest(req);
  if (denied) return denied;

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
