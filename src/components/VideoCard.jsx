import { useState } from 'react'
import ScoreMeter from './ScoreMeter'
import { calcViralScore, viralLabel } from '../utils/viralScore'
import { fmtNum, timeSince } from '../utils/format'

const YT_WATCH = 'https://www.youtube.com/watch?v='

export default function VideoCard({ video, channelStats, rank }) {
  const [expanded, setExpanded] = useState(false)

  const stats = video.statistics ?? {}
  const snippet = video.snippet ?? {}
  const subs = channelStats?.[snippet.channelId]?.subscriberCount
  const viral = calcViralScore(stats, subs)
  const { color } = viralLabel(viral.total)

  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.14)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex' }}>

        {/* Rank badge */}
        {rank != null && (
          <div style={{
            width: 44, minWidth: 44,
            background: '#f9fafb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: rank <= 3 ? 15 : 13,
            fontWeight: 800,
            color: rank <= 3 ? color : '#9ca3af',
            borderRight: '1px solid #f3f4f6',
          }}>
            #{rank}
          </div>
        )}

        {/* Thumbnail */}
        <a
          href={`${YT_WATCH}${video.id}`}
          target="_blank"
          rel="noreferrer"
          style={{ width: 148, minWidth: 148, display: 'block', position: 'relative', overflow: 'hidden' }}
        >
          <img
            src={snippet.thumbnails?.medium?.url}
            alt={snippet.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', bottom: 5, right: 5,
            background: 'rgba(0,0,0,0.78)',
            color: '#fff', fontSize: 11, padding: '2px 6px',
            borderRadius: 5, fontWeight: 800,
            border: `1.5px solid ${color}`,
          }}>
            {viral.total}
          </div>
        </a>

        {/* Body */}
        <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
          <a
            href={`${YT_WATCH}${video.id}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 14, fontWeight: 600, lineHeight: 1.35,
              color: '#111827', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textDecoration: 'none',
            }}
          >
            {snippet.title}
          </a>

          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, marginBottom: 8 }}>
            {snippet.channelTitle} · {timeSince(snippet.publishedAt)}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#374151' }}>
            <span title="Views">👁 {fmtNum(stats.viewCount)}</span>
            <span title="Likes">👍 {fmtNum(stats.likeCount)}</span>
            <span title="Comments">💬 {fmtNum(stats.commentCount)}</span>
            {subs && <span title="Subscribers">📡 {fmtNum(subs)}</span>}
          </div>

          <ScoreMeter score={viral.total} />

          <button
            onClick={() => setExpanded(x => !x)}
            style={{
              marginTop: 8, fontSize: 11, color: '#6366f1',
              background: 'none', border: 'none', padding: 0,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            {expanded ? '▲ Hide breakdown' : '▼ Score breakdown'}
          </button>

          {expanded && (
            <div style={{
              marginTop: 8, fontSize: 12, color: '#374151',
              background: '#f9fafb', padding: '8px 10px', borderRadius: 8,
              lineHeight: 1.7,
            }}>
              <div>
                📊 <strong>Views / Subscriber ratio:</strong> {viral.ratio}×
                &nbsp;→&nbsp; <strong style={{ color: '#6366f1' }}>{viral.ratioScore} / 50 pts</strong>
              </div>
              <div>
                💡 <strong>Engagement rate:</strong> {viral.engRatePct}%
                &nbsp;→&nbsp; <strong style={{ color: '#6366f1' }}>{viral.engScore} / 50 pts</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
