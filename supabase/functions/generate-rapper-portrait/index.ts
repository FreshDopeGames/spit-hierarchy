import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STYLE_PROMPT = (rapperName: string, extra?: string) => `Studio portrait of ${rapperName}, photorealistic, 3/4 angle, head and upper shoulders, neutral charcoal seamless backdrop, soft key light from upper left, subtle rim light, sharp focus on eyes, 50mm lens look, color-graded with warm shadows and cool highlights. Match the likeness of the reference photos faithfully — same face, hairstyle, complexion, and signature style cues. No text, no watermark, no logos, no captions.${extra ? `\n\nAdditional notes: ${extra}` : ''}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { rapperId, referenceImages, extraNotes, candidates = 4 } = body || {};

    if (!rapperId || !Array.isArray(referenceImages) || referenceImages.length < 1 || referenceImages.length > 3) {
      return new Response(JSON.stringify({ error: 'Provide rapperId and 1-3 referenceImages (data URLs)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: rapper } = await adminClient
      .from('rappers')
      .select('id, name')
      .eq('id', rapperId)
      .maybeSingle();

    if (!rapper) {
      return new Response(JSON.stringify({ error: 'Rapper not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = STYLE_PROMPT(rapper.name, extraNotes);
    const userContent: any[] = [{ type: 'text', text: prompt }];
    for (const img of referenceImages) {
      userContent.push({ type: 'image_url', image_url: { url: img } });
    }

    const numCandidates = Math.min(Math.max(parseInt(String(candidates)) || 4, 1), 4);
    const results: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < numCandidates; i++) {
      try {
        const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [{ role: 'user', content: userContent }],
            modalities: ['image', 'text'],
          }),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          errors.push(`Candidate ${i + 1}: ${resp.status} ${txt.slice(0, 200)}`);
          if (resp.status === 429 || resp.status === 402) break;
          continue;
        }

        const json = await resp.json();
        const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) results.push(url);
        else errors.push(`Candidate ${i + 1}: no image returned`);
      } catch (e) {
        errors.push(`Candidate ${i + 1}: ${(e as Error).message}`);
      }
    }

    if (results.length === 0) {
      return new Response(JSON.stringify({ error: 'Generation failed', details: errors }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ candidates: results, errors }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
