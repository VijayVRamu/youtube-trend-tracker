/**
 * Calculates a viral score (0–100) for a YouTube video.
 *
 * Components:
 *  - Views/Subscriber ratio score (0–50 pts): how far the video punches above
 *    the channel's normal reach. A ratio of 1× (views == subs) scores ~30 pts;
 *    10× scores 50 pts.
 *  - Engagement rate score (0–50 pts): (likes + comments) / views.
 *    2% engagement = 10 pts; 10% = 50 pts.
 */
export function calcViralScore(statistics, subscriberCount) {
  const views = parseInt(statistics?.viewCount ?? 0)
  const likes = parseInt(statistics?.likeCount ?? 0)
  const comments = parseInt(statistics?.commentCount ?? 0)
  const subs = parseInt(subscriberCount ?? 1)

  // Component 1: views-to-subscriber ratio (log-scaled, max 50)
  const ratio = views / Math.max(subs, 1)
  const ratioScore = Math.min(50, Math.round(Math.log10(Math.max(ratio, 0.001) + 1) * 30))

  // Component 2: engagement rate (likes + comments) / views (max 50)
  const engRate = views > 0 ? (likes + comments) / views : 0
  const engScore = Math.min(50, Math.round(engRate * 500))

  return {
    total: ratioScore + engScore,
    ratioScore,
    engScore,
    engRatePct: (engRate * 100).toFixed(2),
    ratio: ratio.toFixed(2),
  }
}

export function viralLabel(score) {
  if (score >= 85) return { label: '🔥 Mega Viral', color: '#ef4444' }
  if (score >= 65) return { label: '📈 Trending Hard', color: '#f97316' }
  if (score >= 45) return { label: '⚡ Gaining Steam', color: '#eab308' }
  if (score >= 25) return { label: '👀 Moderate', color: '#22c55e' }
  return { label: '💤 Low Traction', color: '#6b7280' }
}
