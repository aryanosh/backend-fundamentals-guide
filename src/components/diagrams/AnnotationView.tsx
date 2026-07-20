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

export default function AnnotationView({ elements, annotations }: Props) {
  const pad = 20
  const svgW = 500
  const svgH = 320

  return (
    <div style={{ padding: 16 }}>
      <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
        {elements.map((el, i) => (
          <g key={`el-${i}`}>
            <motion.rect
              x={el.x} y={el.y} width={el.w} height={el.h} rx={4}
              fill="var(--bg-surface)"
              stroke={el.color || 'var(--border-strong)'}
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
            <text
              x={el.x + el.w / 2} y={el.y + el.h / 2 + 4}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              {el.label}
            </text>
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
                strokeWidth={1}
                strokeDasharray="3,2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              />
              <motion.rect
                x={ax - 90} y={annY - 8} width={180} height={22} rx={2}
                fill="var(--bg-panel)"
                stroke="var(--accent-amber)"
                strokeWidth={1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              />
              <text
                x={ax} y={annY + 6}
                textAnchor="middle"
                fill="var(--text)"
                fontSize={9}
                fontFamily="var(--font-mono)"
              >
                {ann.text.length > 28 ? ann.text.slice(0, 28) + '…' : ann.text}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
