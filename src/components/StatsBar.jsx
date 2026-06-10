import { calcViralScore } from '../utils/viralScore'

export default function StatsBar({ videos, channelStats }) {
  if (!videos.length) return null

  const scores = videos.map(v =>
    calcViralScore(v.statistics ?? {}, channelStats?.[v.snippet?.channelId]?.subscriberCount).total
  )
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  const top = Math.max(...scores)
  const megaCount = scores.filter(s => s >= 85).length

  const stats = [
    { label: 'Videos', val: videos.length, icon: '🎬' },
    { label: 'Avg Score', val: avg, icon: '📊' },
    { label: 'Top Score', val: top, icon: '🏆' },
    { label: 'Mega Viral', val: megaCount, icon: '🔥' },
  ]

  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap',
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '10px 18px', flex: '1 1 80px',
          minWidth: 80,
        }}>
          <div style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {s.icon} {s.label}
          </div>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>
            {s.val}
          </div>
        </div>
      ))}
    </div>
  )
}
