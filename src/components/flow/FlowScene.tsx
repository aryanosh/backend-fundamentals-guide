import { motion } from 'framer-motion'
import { NODES, CONNECTIONS, PHASES, FORWARD_Y, RETURN_Y, type FlowNodeData, type FlowConnectionData } from './FlowData'

interface FlowSceneProps {
  activePhase: number
  selectedNode: string | null
  completedPhases: number[]
  onNodeClick: (id: string) => void
}

const PHASE_FOR_CONNECTION: Record<number, number> = {}
PHASES.forEach(p => {
  p.connectionIndices.forEach(ci => {
    PHASE_FOR_CONNECTION[ci] = p.index
  })
})

function computeNodeState(id: string, activePhase: number): 'inactive' | 'active' | 'completed' {
  const toConnections = CONNECTIONS.filter(c => c.to === id && !c.isReturn)
  if (toConnections.length === 0) {
    return 'completed'
  }
  let hasActive = false
  let allCompleted = true
  for (const conn of toConnections) {
    const connIdx = CONNECTIONS.indexOf(conn)
    const connPhase = PHASE_FOR_CONNECTION[connIdx] ?? -1
    if (connPhase === activePhase) hasActive = true
    if (connPhase > activePhase) allCompleted = false
  }
  if (hasActive) return 'active'
  if (allCompleted) return 'completed'
  return 'inactive'
}

function FlowNode({ node, state, isSelected, onClick }: {
  node: FlowNodeData
  state: 'inactive' | 'active' | 'completed'
  isSelected: boolean
  onClick: () => void
}) {
  const opacity = state === 'inactive' ? 0.25 : 1
  const borderColor = state === 'active' ? node.color : state === 'completed' ? 'var(--glass-border-accent)' : 'var(--glass-border)'
  const bgColor = state === 'active' ? `${node.color}18` : 'var(--glass-bg)'
  const txtColor = state === 'inactive' ? 'var(--text-dim)' : 'var(--text)'

  return (
    <g
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      role="button"
      tabIndex={0}
      aria-label={node.label}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      {state === 'active' && (
        <motion.circle
          cx={node.x} cy={node.y}
          r={46}
          fill="none"
          stroke={node.color}
          strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.1, 1.35] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {isSelected && (
        <motion.circle
          cx={node.x} cy={node.y}
          r={48}
          fill="none"
          stroke={node.color}
          strokeWidth={1}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <rect
        x={node.x - 54} y={node.y - 24}
        width={108} height={48} rx={10}
        fill={bgColor}
        stroke={isSelected ? node.color : borderColor}
        strokeWidth={isSelected ? 2 : state === 'active' ? 1.5 : 1}
        opacity={opacity}
      />
      <text
        x={node.x - 42} y={node.y + 7}
        fill={node.color}
        fontSize={18}
        fontWeight={700}
        fontFamily="var(--font-mono)"
        opacity={opacity}
      >
        {node.icon}
      </text>
      <text
        x={node.x - 24} y={node.y + 7}
        fill={txtColor}
        fontSize={12}
        fontWeight={600}
        fontFamily="var(--font-display)"
        opacity={opacity}
      >
        {node.label}
      </text>
    </g>
  )
}

function FlowParticle({ x1, x2, y, color, delay = 0 }: { x1: number; x2: number; y: number; color: string; delay?: number }) {
  return (
    <g>
      <circle r={10} fill={color} opacity={0.15}>
        <animateMotion
          path={`M${x1},${y} L${x2},${y}`}
          dur="1.4s"
          begin={`-${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={4} fill={color}>
        <animateMotion
          path={`M${x1},${y} L${x2},${y}`}
          dur="1.4s"
          begin={`-${delay}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;1;0"
          keyTimes="0;0.7;1"
          dur="1.4s"
          begin={`-${delay}s`}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  )
}

export default function FlowScene({ activePhase, selectedNode, completedPhases, onNodeClick }: FlowSceneProps) {
  const phase = PHASES[activePhase]

  return (
    <svg
      viewBox="0 0 1100 500"
      style={{ width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.4))' }}
    >
      <defs>
        <marker id="arrowDot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
        </marker>
      </defs>

      {phase && (
        <>
          <text
            x={550} y={310}
            textAnchor="middle"
            fill="var(--accent-cyan)"
            fontSize={96}
            fontWeight={700}
            fontFamily="var(--font-display)"
            opacity={0.035}
            letterSpacing="0.04em"
            style={{ pointerEvents: 'none' }}
          >
            {phase.label}
          </text>
          <text
            x={550} y={370}
            textAnchor="middle"
            fill="var(--accent-cyan)"
            fontSize={36}
            fontWeight={500}
            fontFamily="var(--font-mono)"
            opacity={0.02}
            letterSpacing="0.15em"
            style={{ pointerEvents: 'none' }}
          >
            {phase.subtitle}
          </text>
        </>
      )}

      <text x="52" y={FORWARD_Y + 4} fill="var(--accent-cyan)" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600} opacity={0.5} letterSpacing="0.08em">
        REQUEST →
      </text>
      <text x="52" y={RETURN_Y + 4} fill="#FFB300" fontSize={9} fontFamily="var(--font-mono)" fontWeight={600} opacity={0.5} letterSpacing="0.08em">
        ← RESPONSE
      </text>
      <rect x="38" y={FORWARD_Y - 8} width="8" height="8" rx="2" fill="var(--accent-cyan)" opacity={0.3} />
      <rect x="38" y={RETURN_Y - 8} width="8" height="8" rx="2" fill="#FFB300" opacity={0.3} />

      {CONNECTIONS.map((conn, i) => {
        const fromNode = NODES.find(n => n.id === conn.from)
        const toNode = NODES.find(n => n.id === conn.to)
        if (!fromNode || !toNode) return null

        const y = conn.isReturn ? RETURN_Y : FORWARD_Y
        const connPhase = PHASE_FOR_CONNECTION[i] ?? -1
        const isActive = connPhase === activePhase
        const isCompleted = completedPhases.includes(connPhase)

        let strokeColor: string
        let strokeWidth: number
        let dashArray: string | undefined
        let markerEnd: string | undefined

        if (isCompleted) {
          strokeColor = conn.isReturn ? 'rgba(255,179,0,0.5)' : 'rgba(0,229,255,0.5)'
          strokeWidth = 2.5
          markerEnd = 'url(#arrowDot)'
        } else if (isActive) {
          strokeColor = conn.isReturn ? '#FFB300' : '#00E5FF'
          strokeWidth = 3
          dashArray = '10 6'
          markerEnd = 'url(#arrowDot)'
        } else {
          strokeColor = 'rgba(255,255,255,0.06)'
          strokeWidth = 1.5
          dashArray = '4 4'
        }

        return (
          <g key={`conn-${i}`}>
            <line
              x1={fromNode.x} y1={y} x2={toNode.x} y2={y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              markerEnd={markerEnd}
              style={isActive ? { filter: `drop-shadow(0 0 4px ${strokeColor})` } : undefined}
            >
              {isActive && (
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-16"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              )}
            </line>
            {isActive && (
              <>
                <FlowParticle x1={fromNode.x} x2={toNode.x} y={y} color={strokeColor} delay={0} />
                <FlowParticle x1={fromNode.x} x2={toNode.x} y={y} color={strokeColor} delay={0.47} />
                <FlowParticle x1={fromNode.x} x2={toNode.x} y={y} color={strokeColor} delay={0.93} />
              </>
            )}
          </g>
        )
      })}

      {NODES.map(node => {
        const state = computeNodeState(node.id, activePhase)
        const isSelected = selectedNode === node.id
        return (
          <FlowNode
            key={node.id}
            node={node}
            state={state}
            isSelected={isSelected}
            onClick={() => onNodeClick(node.id)}
          />
        )
      })}
    </svg>
  )
}
