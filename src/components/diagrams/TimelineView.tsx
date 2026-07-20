import { motion } from 'framer-motion'

interface Event {
  title: string
  desc: string
  color?: string
  status?: 'done' | 'active' | 'locked'
}

interface Props {
  events: Event[]
}

export default function TimelineView({ events }: Props) {
  return (
    <div style={{ padding: '20px 16px' }}>
      <svg width="100%" height={events.length * 64 + 20} viewBox={`0 0 400 ${events.length * 64 + 20}`} style={{ display: 'block' }}>
        <line x1={40} y1={20} x2={40} y2={events.length * 64 + 10} stroke="var(--border-strong)" strokeWidth={2} />

        {events.map((ev, i) => {
          const y = 20 + i * 64
          const status = ev.status || (i === 0 ? 'active' : 'locked')
          const color = ev.color || (status === 'done' ? 'var(--accent-green)' : status === 'active' ? 'var(--accent-cyan)' : 'var(--locked)')
          const isActive = status === 'active'
          const isDone = status === 'done'
          const r = isActive ? 8 : 6

          return (
            <g key={`tl-${i}`}>
              <motion.circle
                cx={40} cy={y + 10}
                r={r}
                fill={isDone ? 'var(--accent-green)' : isActive ? 'var(--bg-panel)' : 'var(--bg-panel)'}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                initial={false}
                animate={{
                  r: isActive ? 8 : 6,
                  filter: isActive ? 'drop-shadow(0 0 6px var(--accent-cyan))' : 'none',
                }}
              />
              {isDone && (
                <text x={40} y={y + 13} textAnchor="middle" fill="#0A0C14" fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">
                  ✓
                </text>
              )}
              <text x={64} y={y + 6} fill="var(--text)" fontSize={11} fontWeight={600} fontFamily="var(--font-mono)">
                {ev.title}
              </text>
              <text x={64} y={y + 22} fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-mono)">
                {ev.desc}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
