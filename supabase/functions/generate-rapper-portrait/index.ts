import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMIC_PROMPT = (rapperName: string, extra?: string) => `Stylized illustrated portrait of ${rapperName} rendered as bold pop-art / comic-book hip-hop poster art. Square 1:1 composition, head and upper shoulders, 3/4 angle, looking slightly off-camera. Heavy clean black ink outlines around the subject and major shape edges. Flat cel-shaded coloring with 2-3 tonal steps per surface — no photoreal gradients on skin. Subtle halftone dot texture in the mid-tones and background for a screen-printed feel. Background is a clean two-color gradient with light grain — pick the two gradient colors directly from the dominant colors of the subject's outfit, accessories, and overall palette in the reference photos so the backdrop feels custom to this artist (do NOT default to teal/orange; vary it per rapper). Avoid colors that clash with the subject's skin tone. No scenery, no text, no logos, no watermark, no captions, no signatures, no panel borders. Streetwear styling appropriate to the artist (hoodie, jacket, or signature look). Faithfully match the face, hairstyle, complexion, beard, and signature accessories from the reference photos — likeness comes ONLY from the reference photos, never from any other source. Keep the subject centered with breathing room around the head.${extra ? `\n\nAdditional notes: ${extra}` : ''}`;

const PHOTO_PROMPT = (rapperName: string, extra?: string) => `Photorealistic studio portrait of ${rapperName}. Square 1:1 composition, head and upper shoulders, 3/4 angle, looking slightly off-camera. Sharp focus, natural skin texture, realistic lighting with soft key light and gentle rim light. Clean seamless studio backdrop in a tasteful solid or subtly graded color chosen from the dominant tones of the subject's outfit and overall palette in the reference photos (do NOT default to teal/orange; vary per rapper). Streetwear styling appropriate to the artist (hoodie, jacket, chain, or signature look). Faithfully match the face, hairstyle, complexion, beard, tattoos, and signature accessories from the reference photos — likeness comes ONLY from the reference photos, never from any other source. No text, no logos, no watermark, no captions, no signatures. Keep the subject centered with breathing room around the head.${extra ? `\n\nAdditional notes: ${extra}` : ''}`;

const STYLE_PROMPT = (style: string, rapperName: string, extra?: string) =>
  style === 'photoreal' ? PHOTO_PROMPT(rapperName, extra) : COMIC_PROMPT(rapperName, extra);

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
    const errors: string[] = [];

    const generateOne = async (i: number): Promise<string | null> => {
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
          return null;
        }

        const json = await resp.json();
        const url = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (url) return url;
        errors.push(`Candidate ${i + 1}: no image returned`);
        return null;
      } catch (e) {
        errors.push(`Candidate ${i + 1}: ${(e as Error).message}`);
        return null;
      }
    };

    const settled = await Promise.all(
      Array.from({ length: numCandidates }, (_, i) => generateOne(i))
    );
    const results = settled.filter((r): r is string => !!r);


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
