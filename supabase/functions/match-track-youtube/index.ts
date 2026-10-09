import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

// Finds a YouTube video for album tracks that don't have one yet and caches it.
// search.list costs 100 quota units; daily free quota is 10,000, so keep batches small.
const MAX_SEARCHES_PER_CALL = 25

const BodySchema = z.object({
  album_id: z.string().uuid().optional(),
  source: z.string().max(50).optional(),
})

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

function isoDurationToMs(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return ((+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0))) * 1000
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let raw: unknown = {}
  try { raw = await req.json() } catch { /* empty body */ }
  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400)
  const { album_id } = parsed.data

  const apiKey = Deno.env.get('YOUTUBE_API_KEY')
  if (!apiKey) return json({ error: 'YouTube key not configured' }, 500)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    let query = supabase
      .from('album_tracks')
      .select('id, title, duration_ms, album_id, track_youtube_matches(id), albums!inner(title, rapper_albums(rappers(name)))')
      .order('track_number', { ascending: true })
      .limit(album_id ? 100 : 400)
    if (album_id) query = query.eq('album_id', album_id)

    const { data: tracks, error } = await query
    if (error) throw error

    const pending = (tracks ?? [])
      .filter((t: any) => !t.track_youtube_matches || (Array.isArray(t.track_youtube_matches) ? t.track_youtube_matches.length === 0 : false))
      .slice(0, MAX_SEARCHES_PER_CALL)

    let matched = 0
    let notFound = 0
    for (const t of pending as any[]) {
      const rapperName = t.albums?.rapper_albums?.[0]?.rappers?.name ?? ''
      const q = `${rapperName} ${t.title} official audio`
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=5&videoEmbeddable=true&q=${encodeURIComponent(q)}&key=${apiKey}`
      const sRes = await fetch(searchUrl)
      if (!sRes.ok) {
        console.warn('YouTube search failed', sRes.status, await sRes.text())
        if (sRes.status === 403) break // quota exhausted
        continue
      }
      const sData = await sRes.json()
      const items: any[] = sData.items ?? []
      let videoId: string | null = null

      if (items.length) {
        const ids = items.map((i) => i.id.videoId).join(',')
        const vRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids}&key=${apiKey}`)
        const vData = vRes.ok ? await vRes.json() : { items: [] }
        const details: any[] = vData.items ?? []
        const score = (v: any) => {
          let s = 0
          const title = (v.snippet?.title ?? '').toLowerCase()
          const channel = (v.snippet?.channelTitle ?? '').toLowerCase()
          if (channel.endsWith('- topic')) s += 3
          if (title.includes('official audio')) s += 2
          if (title.includes(t.title.toLowerCase())) s += 2
          if (rapperName && channel.includes(rapperName.toLowerCase())) s += 1
          if (/live|reaction|cover|remix|slowed|sped up/.test(title)) s -= 3
          if (t.duration_ms) {
            const diff = Math.abs(isoDurationToMs(v.contentDetails?.duration ?? '') - t.duration_ms)
            if (diff < 15000) s += 2
            else if (diff > 90000) s -= 3
          }
          return s
        }
        const best = details.map((v) => ({ v, s: score(v) })).sort((a, b) => b.s - a.s)[0]
        if (best && best.s >= 1) videoId = best.v.id
      }

      const { error: upErr } = await supabase.from('track_youtube_matches').upsert(
        { track_id: t.id, youtube_video_id: videoId, status: videoId ? 'matched' : 'not_found', checked_at: new Date().toISOString() },
        { onConflict: 'track_id' },
      )
      if (upErr) console.error('upsert failed', upErr)
      videoId ? matched++ : notFound++
    }

    return json({ checked: pending.length, matched, not_found: notFound })
  } catch (e) {
    console.error('match-track-youtube error:', e)
    return json({ error: String(e) }, 500)
  }
})
