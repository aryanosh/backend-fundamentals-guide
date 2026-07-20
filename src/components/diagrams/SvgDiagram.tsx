import { motion } from 'framer-motion'

interface Props {
  svg: string
  caption?: string
}

export default function SvgDiagram({ svg, caption }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: 12,
          display: 'flex', justifyContent: 'center',
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <div style={{
          marginTop: 8,
          fontSize: 10, color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)', textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {caption}
        </div>
      )}
    </div>
  )
}
