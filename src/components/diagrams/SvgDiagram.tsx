import { motion } from 'framer-motion'

interface Props {
  svg: string
  caption?: string
}

export default function SvgDiagram({ svg, caption }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          border: '1px solid var(--border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: 16,
          display: 'flex', justifyContent: 'center',
          overflow: 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            marginTop: 8,
            fontSize: 11, color: 'var(--text-dim)',
            fontFamily: 'var(--font-sans)', textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {caption}
        </motion.div>
      )}
    </div>
  )
}
