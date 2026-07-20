import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import vm from 'vm'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const raw = readFileSync(resolve(root, 'js', 'content.js'), 'utf-8')

const diagramStubs = {
  illustratedFlow: (...args) => JSON.stringify({ __diagramRef: 'illustratedFlow', __args: args }),
  infographic: (...args) => JSON.stringify({ __diagramRef: 'infographic', __args: args }),
  comparisonIllustrated: (...args) => JSON.stringify({ __diagramRef: 'comparisonIllustrated', __args: args }),
  steppedTimeline: (...args) => JSON.stringify({ __diagramRef: 'steppedTimeline', __args: args }),
  annotatedDiagram: (...args) => JSON.stringify({ __diagramRef: 'annotatedDiagram', __args: args }),
}

const sandbox = {
  window: { diagram: diagramStubs, CHAPTERS: [] },
  setTimeout,
  console,
}

vm.createContext(sandbox)
vm.runInContext(raw, sandbox)

const chapters = sandbox.window.CHAPTERS
console.log(`Parsed ${chapters.length} chapters`)

function resolveDiagrams(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(resolveDiagrams)

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'extraDiagram' && typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        if (parsed.__diagramRef && parsed.__args) {
          result.type = parsed.__diagramRef
          result.args = parsed.__args.map(resolveDiagrams)
          const lastArg = parsed.__args[parsed.__args.length - 1]
          if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg) && lastArg.caption) {
            result.caption = lastArg.caption
          }
        } else {
          result[key] = value
        }
      } catch {
        result[key] = value
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveDiagrams(value)
    } else {
      result[key] = value
    }
  }
  return result
}

const processed = chapters.map(resolveDiagrams)

const outDir = resolve(root, 'src', 'content')
mkdirSync(outDir, { recursive: true })

processed.forEach((ch, idx) => {
  const pad = String(idx + 1).padStart(2, '0')
  writeFileSync(resolve(outDir, `ch-${pad}.json`), JSON.stringify(ch, null, 2))
  console.log(`  Written: ch-${pad}.json`)
})

const imports = processed.map((_, idx) => {
  const pad = String(idx + 1).padStart(2, '0')
  return `import ch${pad} from './ch-${pad}.json'`
}).join('\n')

const exports = processed.map((_, idx) => {
  return `  ch${String(idx + 1).padStart(2, '0')}`
}).join(',\n')

writeFileSync(resolve(outDir, 'index.ts'), `${imports}\n\nexport const chapters = [\n${exports}\n]\n`)
console.log('  Written: index.ts')
