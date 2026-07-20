export interface StepFlowConfig {
  steps: { label: string; desc?: string; color?: string }[]
}

export interface InfoGridConfig {
  columns: number
  items: { heading: string; body: string; color?: string }[]
}

export interface ComparisonConfig {
  left: { header: string; items: string[] }
  right: { header: string; items: string[] }
  vsLabel?: string
}

export interface TimelineConfig {
  events: { title: string; desc: string; color?: string; status?: 'done' | 'active' | 'locked' }[]
}

export interface AnnotationConfig {
  elements: { x: number; y: number; w: number; h: number; label: string; color?: string }[]
  annotations: { target: number; text: string }[]
}

export interface SvgConfig {
  svg: string
  caption?: string
}

export type DiagramConfig =
  | { type: 'stepFlow'; config: StepFlowConfig }
  | { type: 'infoGrid'; config: InfoGridConfig }
  | { type: 'comparison'; config: ComparisonConfig }
  | { type: 'timeline'; config: TimelineConfig }
  | { type: 'annotation'; config: AnnotationConfig }
  | { type: 'svg'; config: SvgConfig }

export interface ChapterSection {
  title: string
  text: string
  diagram: DiagramConfig | null
  caption?: string
  detail?: string
  code?: string
  codeLang?: string
  callout?: string
  calloutType?: 'tip' | 'warn' | 'info'
  calloutTitle?: string
}

export interface Chapter {
  id: number
  title: string
  subtitle: string
  group: 'foundation' | 'core' | 'scale' | 'devops' | 'roadmap'
  sections: ChapterSection[]
}

export const GROUP_NAMES: Record<string, string> = {
  foundation: 'Foundation',
  core: 'Core',
  scale: 'Scale',
  devops: 'DevOps',
  roadmap: 'Roadmap',
}

export const GROUP_COLORS: Record<string, string> = {
  foundation: 'var(--accent-cyan)',
  core: 'var(--accent-pink)',
  scale: 'var(--accent-amber)',
  devops: 'var(--accent-green)',
  roadmap: 'var(--accent-violet)',
}
