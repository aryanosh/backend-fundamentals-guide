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

export default function InfoGridDiagram({ columns, items }: Props) {
  const cols = Math.min(columns, items.length)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 8,
      padding: 16,
    }}>
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.25 }}
          style={{
            padding: '12px 10px',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
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
            lineHeight: 1.5, fontFamily: 'var(--font-mono)',
          }}>
            {item.body}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
