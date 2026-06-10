import { useState, useEffect, useCallback } from 'react'
import VideoCard from './components/VideoCard'
import StatsBar from './components/StatsBar'
import { calcViralScore } from './utils/viralScore'

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

const YT = 'https://www.googleapis.com/youtube/v3'

const REGIONS = [
  ['US', '🇺🇸 United States'], ['GB', '🇬🇧 United Kingdom'],
  ['IN', '🇮🇳 India'], ['CA', '🇨🇦 Canada'],
  ['AU', '🇦🇺 Australia'], ['JP', '🇯🇵 Japan'],
  ['BR', '🇧🇷 Brazil'], ['DE', '🇩🇪 Germany'],
  ['FR', '🇫🇷 France'], ['KR', '🇰🇷 South Korea'],
]

const CATEGORIES = [
  ['', 'All Categories'], ['1', 'Film & Animation'], ['2', 'Autos'],
  ['10', 'Music'], ['17', 'Sports'], ['20', 'Gaming'],
  ['22', 'People & Blogs'], ['23', 'Comedy'], ['24', 'Entertainment'],
  ['25', 'News & Politics'], ['26', 'How-to & Style'], ['28', 'Science & Tech'],
]

export default function App() {
  const [tab, setTab] = useState('trending')
  const [videos, setVideos] = useState([])
  const [channelStats, setChannelStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [regionCode, setRegionCode] = useState('US')
  const [categoryId, setCategoryId] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function ytFetch(url) {
    const res = await fetch(url)
    const data = await res.json()
    if (data.error) throw new Error(data.error.message)
    return data
  }

  const enrichChannels = useCallback(async (items) => {
    const ids = [...new Set(items.map(v => v.snippet?.channelId).filter(Boolean))]
    if (!ids.length) return
    const data = await ytFetch(`${YT}/channels?part=statistics&id=${ids.join(',')}&key=${API_KEY}`)
    const map = {}
    ;(data.items ?? []).forEach(ch => { map[ch.id] = ch.statistics })
    setChannelStats(map)
  }, [])

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchTrending = useCallback(async (region, cat) => {
    setLoading(true); setError(''); setVideos([]); setChannelStats({})
    try {
      let url = `${YT}/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=${region}&key=${API_KEY}`
      if (cat) url += `&videoCategoryId=${cat}`
      const data = await ytFetch(url)
      const items = data.items ?? []
      setVideos(items)
      await enrichChannels(items)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [enrichChannels])

  const fetchSearch = useCallback(async (q) => {
    if (!q.trim()) return
    setLoading(true); setError(''); setVideos([]); setChannelStats({})
    try {
      const search = await ytFetch(
        `${YT}/search?part=snippet&q=${encodeURIComponent(q)}&type=video&order=viewCount&maxResults=20&key=${API_KEY}`
      )
      const ids = (search.items ?? []).map(i => i.id?.videoId).filter(Boolean).join(',')
      if (!ids) { setVideos([]); setLoading(false); return }
      const vids = await ytFetch(`${YT}/videos?part=snippet,statistics&id=${ids}&key=${API_KEY}`)
      const items = vids.items ?? []
      setVideos(items)
      await enrichChannels(items)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }, [enrichChannels])

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (API_KEY && tab === 'trending') fetchTrending(regionCode, categoryId)
  }, [tab, regionCode, categoryId, fetchTrending])

  // ── Sorted by viral score ──────────────────────────────────────────────────
  const sorted = [...videos].sort((a, b) => {
    const sa = calcViralScore(a.statistics ?? {}, channelStats[a.snippet?.channelId]?.subscriberCount).total
    const sb = calcViralScore(b.statistics ?? {}, channelStats[b.snippet?.channelId]?.subscriberCount).total
    return sb - sa
  })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 16px', minHeight: '100vh' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5, margin: 0 }}>
            📊 YouTube Trend Tracker
          </h1>
          <p style={{ color: '#9ca3af', marginTop: 6, fontSize: 14 }}>
            Real-time viral score calculator · YouTube Data API v3
          </p>
        </header>

        {!API_KEY && (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 0', fontSize: 14 }}>
            Set <code>VITE_YOUTUBE_API_KEY</code> in your <code>.env</code> file and restart the dev server.
          </div>
        )}

        {API_KEY && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[['trending', '🔥 Trending'], ['search', '🔍 Search']].map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '8px 20px', borderRadius: 999, border: 'none',
                    background: tab === t ? '#6366f1' : 'rgba(255,255,255,0.08)',
                    color: tab === t ? '#fff' : '#9ca3af',
                    fontWeight: 700, fontSize: 14,
                    transition: 'background 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Trending controls */}
            {tab === 'trending' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                <select
                  value={regionCode}
                  onChange={e => setRegionCode(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: '1px solid #374151',
                    background: '#1f2937', color: '#fff', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {REGIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, border: '1px solid #374151',
                    background: '#1f2937', color: '#fff', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button
                  onClick={() => fetchTrending(regionCode, categoryId)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: '#374151', color: '#e5e7eb', fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  ↻ Refresh
                </button>
              </div>
            )}

            {/* Search bar */}
            {tab === 'search' && (
              <form
                onSubmit={e => { e.preventDefault(); fetchSearch(searchInput) }}
                style={{ display: 'flex', gap: 8, marginBottom: 16 }}
              >
                <input
                  placeholder="Search YouTube videos…"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #374151', background: '#1f2937',
                    color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px', borderRadius: 8, border: 'none',
                    background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 14,
                  }}
                >
                  Search
                </button>
              </form>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: '#450a0a', border: '1px solid #b91c1c',
                color: '#fca5a5', padding: '12px 16px', borderRadius: 8,
                marginBottom: 16, fontSize: 13,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: 60 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                Fetching data and calculating viral scores…
              </div>
            )}

            {/* Stats bar */}
            {!loading && <StatsBar videos={sorted} channelStats={channelStats} />}

            {/* Video list */}
            {!loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sorted.map((v, i) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    channelStats={channelStats}
                    rank={i + 1}
                  />
                ))}
              </div>
            )}

            {/* Empty state for search */}
            {!loading && !error && sorted.length === 0 && tab === 'search' && (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: 60 }}>
                Search for videos above to see their viral scores.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
