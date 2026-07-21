import { useState, useCallback } from 'react'
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

interface TooltipState {
  x: number
  y: number
  text: string
}

function TimelineFlowDot({ yStart, yEnd }: { yStart: number; yEnd: number }) {
  return (
    <>
      <circle cx={40} cy={yStart} r={6} fill="var(--accent-cyan)" style={{ pointerEvents: 'none' }}>
        <animate
          attributeName="cy"
          values={`${yStart};${yEnd}`}
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;1;0"
          keyTimes="0;0.8;1"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={40} cy={yStart} r="10" fill="var(--accent-cyan)" style={{ pointerEvents: 'none' }} opacity="0.15">
        <animate
          attributeName="cy"
          values={`${yStart};${yEnd}`}
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.15;0.15;0"
          keyTimes="0;0.8;1"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </>
  )
}

export default function TimelineView({ events }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleMouseEnter = useCallback((e: React.MouseEvent, text: string) => {
    setTooltip({ x: e.clientX, y: e.clientY, text })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (tooltip) {
      setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
    }
  }, [tooltip])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const lineTop = 20
  const lineBottom = events.length * 72 + 10

  return (
    <div style={{ padding: '20px 16px', position: 'relative' }}>
      <svg width="100%" height={events.length * 72 + 40} viewBox={`0 0 400 ${events.length * 72 + 40}`} style={{ display: 'block' }}>
        <motion.line
          x1={40} y1={lineTop} x2={40} y2={lineBottom}
          stroke="var(--border-strong)"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        <TimelineFlowDot yStart={lineTop} yEnd={lineBottom} />

        {events.map((ev, i) => {
          const y = 20 + i * 72
          const status = ev.status || (i === 0 ? 'active' : 'locked')
          const color = ev.color || (status === 'done' ? 'var(--complete)' : status === 'active' ? 'var(--accent-cyan)' : 'var(--locked)')
          const isActive = status === 'active'
          const isDone = status === 'done'
          const r = isActive ? 9 : 6

          return (
            <g
              key={`tl-${i}`}
              onMouseEnter={(e) => handleMouseEnter(e, `${ev.title}: ${ev.desc}`)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMouseEnter(e as any, `${ev.title}: ${ev.desc}`) } }}
              role="button"
              tabIndex={0}
              aria-label={`Timeline: ${ev.title} - ${ev.desc}`}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <motion.circle
                cx={40} cy={y + 10}
                r={r}
                fill={isDone ? 'var(--complete)' : isActive ? 'rgba(0,0,0,0.4)' : 'var(--glass-bg)'}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1, r: isActive ? 9 : 6 }}
                transition={{ duration: 0.3, delay: i * 0.08, ease: 'backOut' }}
              />
              {isActive && (
                <motion.circle
                  cx={40} cy={y + 10} r={13}
                  fill="none"
                  stroke={color}
                  strokeWidth={1}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.3, 1.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              {isDone && (
                <motion.text
                  x={40} y={y + 13} textAnchor="middle" fill="var(--bg)" fontSize={9} fontWeight={700} fontFamily="var(--font-mono)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ✓
                </motion.text>
              )}
              <motion.text
                x={64} y={y + 6}
                fill="var(--text)" fontSize={12} fontWeight={600} fontFamily="var(--font-display)"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.15 }}
              >
                {ev.title}
              </motion.text>
              <motion.text
                x={64} y={y + 24}
                fill="var(--text-muted)" fontSize={10} fontFamily="var(--font-sans)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.25 }}
              >
                {ev.desc}
              </motion.text>
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          padding: '4px 10px',
          background: 'rgba(10,12,20,0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border-hover)',
          fontSize: 11, color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
          maxWidth: 300,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
