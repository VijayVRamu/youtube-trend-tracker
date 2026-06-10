import { viralLabel } from '../utils/viralScore'

export default function ScoreMeter({ score }) {
  const { label, color } = viralLabel(score)
  const pct = Math.min(100, score)

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 4,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
        <span style={{ fontSize: 17, fontWeight: 800, color }}>{score}<span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>/100</span></span>
      </div>
      <div style={{
        background: '#e5e7eb', borderRadius: 999, height: 7, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 999,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  )
}
