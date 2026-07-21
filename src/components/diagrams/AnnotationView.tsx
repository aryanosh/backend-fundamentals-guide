import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Element {
  x: number
  y: number
  w: number
  h: number
  label: string
  color?: string
}

interface Annotation {
  target: number
  text: string
}

interface Props {
  elements: Element[]
  annotations: Annotation[]
}

interface TooltipState {
  x: number
  y: number
  text: string
}

export default function AnnotationView({ elements, annotations }: Props) {
  const pad = 20
  const svgW = 500
  const svgH = 320
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
    <div style={{ padding: 16, position: 'relative' }}>
      <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
        {elements.map((el, i) => (
          <g
            key={`el-${i}`}
            onMouseEnter={(e) => handleMouseEnter(e, el.label)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMouseEnter(e as any, el.label) } }}
            role="button"
            tabIndex={0}
            aria-label={`Element: ${el.label}`}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            <motion.rect
              x={el.x} y={el.y} width={el.w} height={el.h} rx={6}
              fill="var(--glass-bg)"
              stroke={el.color || 'var(--border-strong)'}
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12, duration: 0.3, ease: 'backOut' }}
              whileHover={{ strokeWidth: 2.5 }}
            />
            <motion.text
              x={el.x + el.w / 2} y={el.y + el.h / 2 + 4}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12 + 0.15 }}
            >
              {el.label}
            </motion.text>
          </g>
        ))}

        {annotations.map((ann, i) => {
          const el = elements[ann.target]
          if (!el) return null
          const ax = el.x + el.w / 2
          const ay = el.y + el.h + 6
          const annY = ay + 26 + i * 28

          return (
            <g key={`ann-${i}`}>
              <motion.line
                x1={ax} y1={ay} x2={ax} y2={annY}
                stroke="var(--accent-amber)"
                strokeWidth={1.5}
                strokeDasharray="3,3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
              />
              <motion.rect
                x={ax - 95} y={annY - 10} width={190} height={24} rx={4}
                fill="var(--glass-bg)"
                stroke="var(--accent-amber)"
                strokeWidth={1}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.12, ease: 'backOut' }}
                whileHover={{ background: 'var(--glass-bg-hover)' }}
              />
              <motion.text
                x={ax} y={annY + 6}
                textAnchor="middle"
                fill="var(--text)"
                fontSize={10}
                fontFamily="var(--font-sans)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.12 }}
              >
                {ann.text.length > 30 ? ann.text.slice(0, 30) + '…' : ann.text}
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
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid var(--glass-border-hover)',
          fontSize: 11, color: 'var(--text)',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
