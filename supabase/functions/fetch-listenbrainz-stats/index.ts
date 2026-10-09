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
    const { data: albums, error } = await supabase
      .from('albums')
      .select('id, title, musicbrainz_id, rapper_albums(rappers(musicbrainz_id))')
      .not('musicbrainz_id', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(BATCH_SIZE)

    if (error) throw error
    if (!albums?.length) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let processed = 0
    let withData = 0
    const debug: Record<string, unknown>[] = []

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
      if (debug.length < 3 && album.title === 'Jesus Is King') {
        const entry: Record<string, unknown> = { album: album.title, artist_mbid: artistMbid, has_token: !!lbToken }
        if (artistMbid && lbToken) {
          try {
            const r = await fetch(`https://api.listenbrainz.org/1/popularity/top-recordings-for-artist/${artistMbid}`, {
              headers: { 'User-Agent': 'SpitHierarchy/1.0 (https://spithierarchy.com)', Authorization: `Token ${lbToken}` },
            })
            const body = await r.text()
            entry.pop_status = r.status
            const recs = JSON.parse(body)
            entry.recording_count = Array.isArray(recs) ? recs.length : -1
            entry.recording_names = Array.isArray(recs) ? recs.map((x: any) => x.recording_name) : []
            const { data: trks } = await supabase.from('album_tracks').select('title').eq('album_id', album.id)
            entry.our_tracks = (trks ?? []).map((t: { title: string }) => t.title)
          } catch (err) {
            entry.pop_error = String(err)
          }
        }
        debug.push(entry)
      }
      if (artistMbid && lbToken) {
        const { data: albumTracks } = await supabase
          .from('album_tracks')
          .select('title')
          .eq('album_id', album.id)

        const normalize = (s: string) =>
          s.toLowerCase().replace(/[^a-z0-9]/g, '')
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
      JSON.stringify({ processed, with_data: withData, batch_size: albums.length, has_token: !!Deno.env.get('LISTENBRAINZ_TOKEN'), debug }),
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
