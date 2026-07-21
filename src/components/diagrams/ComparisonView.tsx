import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Props {
  left: { header: string; items: string[] }
  right: { header: string; items: string[] }
  vsLabel?: string
}

interface TooltipState {
  x: number
  y: number
  text: string
}

export default function ComparisonView({ left, right, vsLabel = 'VS' }: Props) {
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
    <div style={{ display: 'flex', gap: 0, padding: 16, position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        whileHover={{ borderColor: 'var(--glass-border-hover)' }}
        style={{
          flex: 1,
          border: '1px solid var(--border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'border-color 200ms',
        }}
      >
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)',
        }}>
          {left.header}
        </div>
        <div style={{ padding: '8px 12px' }}>
          {left.items.map((item, i) => (
            <div
              key={i}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                padding: '6px 0',
                fontSize: 11, color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
                borderBottom: i < left.items.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'default',
                transition: 'color 150ms',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 2,
      }}>
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'backOut' }}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--border-strong)',
            background: 'var(--bg-overlay)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {vsLabel}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        whileHover={{ borderColor: 'var(--glass-border-hover)' }}
        style={{
          flex: 1,
          border: '1px solid var(--border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'border-color 200ms',
        }}
      >
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          color: 'var(--accent-pink)', fontFamily: 'var(--font-mono)',
        }}>
          {right.header}
        </div>
        <div style={{ padding: '8px 12px' }}>
          {right.items.map((item, i) => (
            <div
              key={i}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                padding: '6px 0',
                fontSize: 11, color: 'var(--text-muted)',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.5,
                borderBottom: i < right.items.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'default',
                transition: 'color 150ms',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </motion.div>

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
          maxWidth: 300,
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
