import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface GridItem {
  heading: string
  body: string
  color?: string
}

interface Props {
  columns: number
  items: GridItem[]
}

interface TooltipState {
  x: number
  y: number
  text: string
}

export default function InfoGridDiagram({ columns, items }: Props) {
  const cols = Math.min(columns, items.length)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleMouseEnter = useCallback((e: React.MouseEvent, text: string) => {
    setTooltip({ x: e.clientX, y: e.clientY, text })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 8,
        padding: 16,
      }}>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
            onMouseEnter={(e) => handleMouseEnter(e, item.body)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              padding: '14px 12px',
              border: '1px solid var(--border)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'default',
              transition: 'border-color 200ms, background 200ms',
            }}
            whileHover={{
              borderColor: 'var(--glass-border-hover)',
              background: 'var(--glass-bg-hover)',
              y: -2,
            }}
          >
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: item.color || 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              marginBottom: 6,
              textTransform: 'uppercase',
            }}>
              {item.heading}
            </div>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              lineHeight: 1.6, fontFamily: 'var(--font-sans)',
            }}>
              {item.body}
            </div>
          </motion.div>
        ))}
      </div>

      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          padding: '4px 10px',
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border-hover)',
          fontSize: 11, color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
          maxWidth: 280,
        }}>
          {tooltip.text.length > 80 ? tooltip.text.slice(0, 80) + '…' : tooltip.text}
        </div>
      )}
    </div>
  )
}
