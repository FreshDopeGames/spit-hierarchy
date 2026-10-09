import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const LB_BASE = 'https://api.listenbrainz.org'
const REQUEST_DELAY_MS = 1100
const BATCH_SIZE = 40 // albums per invocation; cron runs daily, function can be re-invoked for backlog

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface TopTrack {
  name: string
  listen_count: number
}

async function lbFetch(path: string, token?: string): Promise<Response | null> {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'SpitHierarchy/1.0 (https://spithierarchy.com)',
    }
    if (token) headers['Authorization'] = `Token ${token}`
    const res = await fetch(`${LB_BASE}${path}`, { headers })
    if (res.status === 404 || res.status === 204) return null
    if (!res.ok) {
      console.warn(`ListenBrainz ${path} -> ${res.status}`)
      return null
    }
    return res
  } catch (e) {
    console.warn(`ListenBrainz ${path} fetch error:`, e)
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Albums with a MusicBrainz release-group ID, least-recently-fetched first
    let body: { album_id?: string } = {}
    try { body = await req.json() } catch { /* no body */ }

    // PostgREST caps responses at 1000 rows, so page through all albums
    const allAlbums: any[] = []
    for (let from = 0; ; from += 1000) {
      let q = supabase
        .from('albums')
        .select('id, title, musicbrainz_id, rapper_albums(rappers(musicbrainz_id))')
        .not('musicbrainz_id', 'is', null)
        .order('id')
        .range(from, from + 999)
      if (body.album_id) q = q.eq('id', body.album_id)
      const { data, error } = await q
      if (error) throw error
      allAlbums.push(...(data ?? []))
      if (!data || data.length < 1000) break
    }

    const statRows: any[] = []
    for (let from = 0; ; from += 1000) {
      const { data } = await supabase
        .from('album_listen_stats')
        .select('album_id, fetched_at')
        .order('album_id')
        .range(from, from + 999)
      statRows.push(...(data ?? []))
      if (!data || data.length < 1000) break
    }
    const fetchedAt = new Map((statRows ?? []).map((r: any) => [r.album_id, r.fetched_at as string]))
    const albums = allAlbums
      .filter((a: any) => !body.album_id || a.id === body.album_id)
      .sort((a: any, b: any) => (fetchedAt.get(a.id) ?? '').localeCompare(fetchedAt.get(b.id) ?? ''))
      .slice(0, BATCH_SIZE)
    if (!albums?.length) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let processed = 0
    let withData = 0

    for (const album of albums) {
      const rgMbid = album.musicbrainz_id as string
      const artistMbid =
        (album as any).rapper_albums?.[0]?.rappers?.musicbrainz_id ?? null

      // 1) Total plays + listeners for the release group
      const statsRes = await lbFetch(`/1/stats/release-group/${rgMbid}/listeners`)
      await sleep(REQUEST_DELAY_MS)

      let totalListenCount = 0
      let totalUserCount = 0
      if (statsRes) {
        const stats = await statsRes.json()
        totalListenCount = stats?.payload?.total_listen_count ?? 0
        totalUserCount = stats?.payload?.total_user_count ?? 0
      }

      // 2) Top tracks: artist popularity recordings matched against this album's
      // track titles (popularity endpoints require a ListenBrainz user token and
      // return release MBIDs, not release-group MBIDs, so we match by track name)
      const lbToken = Deno.env.get('LISTENBRAINZ_TOKEN')
      const topTracks: TopTrack[] = []
      if (artistMbid && lbToken) {
        const { data: albumTracks } = await supabase
          .from('album_tracks')
          .select('title')
          .eq('album_id', album.id)

        const normalize = (s: string) =>
          s.toLowerCase()
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/\s*[\(\[](feat|ft|with|prod)[^\)\]]*[\)\]]/g, '')
            .replace(/[^a-z0-9]/g, '')
        const trackTitles = new Set(
          (albumTracks ?? []).map((t: { title: string }) => normalize(t.title)),
        )

        if (trackTitles.size > 0) {
          const popRes = await lbFetch(`/1/popularity/top-recordings-for-artist/${artistMbid}`, lbToken)
          await sleep(REQUEST_DELAY_MS)
          if (popRes) {
            const recordings = await popRes.json()
            if (Array.isArray(recordings)) {
              for (const rec of recordings) {
                if (rec?.recording_name && trackTitles.has(normalize(rec.recording_name))) {
                  topTracks.push({
                    name: rec.recording_name,
                    listen_count: rec.total_listen_count ?? 0,
                  })
                }
                if (topTracks.length >= 10) break
              }
            }
          }
        }
      }

      const { error: upsertError } = await supabase
        .from('album_listen_stats')
        .upsert(
          {
            album_id: album.id,
            total_listen_count: totalListenCount,
            total_user_count: totalUserCount,
            top_tracks: topTracks,
            fetched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'album_id' },
        )

      if (upsertError) {
        console.error(`Upsert failed for album ${album.id} (${album.title}):`, upsertError)
      } else {
        processed++
        if (totalListenCount > 0) withData++
      }
    }

    return new Response(
      JSON.stringify({ processed, with_data: withData, batch_size: albums.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('fetch-listenbrainz-stats error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
