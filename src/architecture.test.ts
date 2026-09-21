/**
 * Protege la arquitectura: cada capa solo puede importar lo que le corresponde (como el test del back).
 *
 * modules/<m>/{domain,schemas,services,hooks,components,pages}   más   components/ui, shared, services, lib
 *
 *   domain      TS puro: sin React, sin HTTP.
 *   schemas     validación (zod) sobre el dominio.
 *   services    HTTP/SSE y almacenamiento; sin React.
 *   hooks       casos de uso de UI: React Query + estado; usan services y domain.
 *   components  presentacionales: props y eventos; nunca llaman a services ni a hooks del módulo.
 *   pages       componen hooks + componentes; no llaman a services directamente.
 *
 * Un módulo solo usa a otro por su index.js. Las páginas no se exportan en el index (carga perezosa).
 */
import fs from 'node:fs'
import path from 'node:path'

const SRC = import.meta.dirname
const MODULE_LAYERS = ['domain', 'schemas', 'services', 'hooks', 'components', 'pages'] as const
type ModuleLayer = (typeof MODULE_LAYERS)[number]

interface Area {
  kind: string
  module?: string
  layer?: ModuleLayer
}

interface Import {
  spec: string
  /** ruta relativa a src/ si es un import interno; null si es un paquete */
  targetRel: string | null
}
const REACT_STUFF = ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'react-hook-form']

/** Paquetes de terceros prohibidos por capa. */
const BANNED_PACKAGES: Record<string, string[]> = {
  domain: [...REACT_STUFF, 'zod', '@microsoft/fetch-event-source'],
  schemas: [...REACT_STUFF, '@microsoft/fetch-event-source'],
  services: [...REACT_STUFF],
  components: ['@tanstack/react-query', '@microsoft/fetch-event-source', 'react-router-dom'],
  'shared-utils': [...REACT_STUFF, 'zod', '@microsoft/fetch-event-source'],
  'shared-constants': [...REACT_STUFF, 'zod', '@microsoft/fetch-event-source'],
  'shared-components': ['@tanstack/react-query', '@microsoft/fetch-event-source'],
  ui: ['@tanstack/react-query', '@microsoft/fetch-event-source', 'react-router-dom'],
  lib: [...REACT_STUFF],
  services_global: [...REACT_STUFF],
  'shared-types': [...REACT_STUFF, 'zod', '@microsoft/fetch-event-source'],
}

// shared/types solo tiene tipos (se borran al compilar): cualquier capa puede importarlos.
const SHARED = ['shared-utils', 'shared-constants', 'shared-types']
const UI_SHARED = ['ui', 'lib', 'shared-components', 'shared-hooks', ...SHARED, 'module-index']

/** Qué puede importar cada capa de un módulo: capas del mismo módulo + áreas globales. */
const MODULE_RULES: Record<ModuleLayer, { same: string[]; global: string[] }> = {
  domain: { same: ['domain'], global: SHARED },
  schemas: { same: ['domain', 'schemas'], global: SHARED },
  services: { same: ['domain', 'schemas', 'services'], global: ['services_global', ...SHARED] },
  hooks: {
    same: ['domain', 'schemas', 'services', 'hooks'],
    global: ['shared-hooks', ...SHARED, 'module-index'],
  },
  components: { same: ['domain', 'schemas', 'components'], global: UI_SHARED },
  pages: { same: ['domain', 'schemas', 'hooks', 'components', 'pages'], global: UI_SHARED },
}

/** Qué puede importar cada área no modular. */
const AREA_RULES: Record<string, string[]> = {
  ui: ['lib', 'ui'],
  lib: [],
  'shared-utils': SHARED,
  'shared-constants': ['shared-constants', 'shared-types'],
  'shared-types': ['shared-types'],
  'shared-hooks': ['shared-hooks', 'services_global', ...SHARED],
  'shared-components': ['ui', 'lib', 'shared-components', 'shared-hooks', ...SHARED],
  services_global: ['services_global', 'shared-utils', 'shared-types'],
}

/** Clasifica una ruta relativa a src/. */
export function classify(rel: string): Area {
  const parts = rel.split('/')
  if (parts[0] === 'modules' && parts[1]) {
    // `@/modules/auth` (directorio) y `@/modules/auth/index.js` son lo mismo: el index del módulo.
    if (parts.length === 2 || (parts.length === 3 && /^index(\.[jt]sx?)?$/.test(parts[2]))) {
      return { kind: 'module-index', module: parts[1] }
    }
    if ((MODULE_LAYERS as readonly string[]).includes(parts[2])) {
      return { kind: 'module', module: parts[1], layer: parts[2] as ModuleLayer }
    }
    return { kind: 'module-other', module: parts[1] }
  }
  if (parts[0] === 'components' && parts[1] === 'ui') return { kind: 'ui' }
  if (parts[0] === 'shared' && parts[1]) return { kind: `shared-${parts[1]}` }
  if (parts[0] === 'services') return { kind: 'services_global' }
  if (parts[0] === 'lib') return { kind: 'lib' }
  return { kind: 'composition' } // router, App, main: la raíz de composición puede importar todo
}

function packageName(spec: string): string {
  const parts = spec.split('/')
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

/** Devuelve la lista de violaciones de un archivo dados sus imports (ya resueltos a rutas relativas a src/). */
export function violationsFor(fileRel: string, imports: Import[]): string[] {
  const source = classify(fileRel)
  if (source.kind === 'composition') return []
  const found: string[] = []
  const sourceKey = source.kind === 'module' ? (source.layer as string) : source.kind
  const banned = BANNED_PACKAGES[sourceKey] ?? []

  for (const { spec, targetRel } of imports) {
    if (targetRel === null) {
      if (banned.includes(packageName(spec))) found.push(`${sourceKey} no debe importar el paquete ${spec}`)
      continue
    }
    const target = classify(targetRel)

    if (source.kind === 'module-index') {
      if (target.kind === 'module' && target.module === source.module && target.layer === 'pages') {
        found.push(`el index no debe exportar páginas (${spec}): el router las carga bajo demanda`)
      }
      continue
    }

    if (source.kind === 'module') {
      const rules = MODULE_RULES[source.layer as ModuleLayer]
      if (target.kind === 'module' && target.module === source.module) {
        if (spec.startsWith('@/')) found.push(`usa una ruta relativa dentro del módulo, no ${spec}`)
        else if (!rules.same.includes(target.layer as string)) {
          found.push(`${source.layer} no debe importar ${target.layer} (${spec})`)
        }
      } else if (target.kind === 'module' || target.kind === 'module-other') {
        found.push(`entra a otro módulo por su index, no por ${spec}`)
      } else if (target.kind === 'module-index') {
        if (target.module === source.module) found.push(`no importes el index de tu propio módulo (${spec})`)
        else if (!rules.global.includes('module-index')) found.push(`${source.layer} no debe importar otros módulos (${spec})`)
      } else if (!rules.global.includes(target.kind)) {
        found.push(`${source.layer} no debe importar ${target.kind} (${spec})`)
      }
      continue
    }

    const allowed = AREA_RULES[source.kind] ?? []
    if (!allowed.includes(target.kind)) found.push(`${source.kind} no debe importar ${target.kind} (${spec})`)
  }
  return found
}

/* ---------- lectura de archivos ---------- */

const IMPORT_RE = /(?:import|export)\s[^'";]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return entry.name === 'test' ? [] : walk(full)
    const isSource = /\.[jt]sx?$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)
    return isSource && !/\.test\.[jt]sx?$/.test(entry.name) ? [full] : []
  })
}

function importsOf(file: string): Import[] {
  const text = fs.readFileSync(file, 'utf8')
  const specs = [...text.matchAll(IMPORT_RE)].map((m) => m[1] ?? m[2] ?? m[3])
  return specs
    .filter((spec) => !spec.endsWith('.css') && !spec.startsWith('@fontsource'))
    .map((spec) => {
      let target = null
      if (spec.startsWith('@/')) target = spec.slice(2)
      else if (spec.startsWith('.')) target = path.relative(SRC, path.resolve(path.dirname(file), spec)).split(path.sep).join('/')
      return { spec, targetRel: target }
    })
}

const files = walk(SRC).map((file) => ({ file, rel: path.relative(SRC, file).split(path.sep).join('/') }))

describe('arquitectura por capas', () => {
  it('encuentra el código a revisar', () => {
    expect(files.length).toBeGreaterThan(50)
  })

  it.each(files.map(({ rel }) => rel))('%s respeta sus dependencias', (rel: string) => {
    const entry = files.find((f) => f.rel === rel)
    if (!entry) throw new Error(`archivo desconocido: ${rel}`)
    expect(violationsFor(rel, importsOf(entry.file))).toEqual([])
  })
})

describe('las reglas detectan las violaciones', () => {
  const imp = (spec: string, targetRel: string | null = spec.startsWith('@/') ? spec.slice(2) : null): Import => ({
    spec,
    targetRel,
  })

  it('domain no puede tocar React, services ni componentes', () => {
    const found = violationsFor('modules/waitlist/domain/x.js', [
      imp('react'),
      imp('../services/waitlist.api', 'modules/waitlist/services/waitlist.api'),
      imp('@/components/ui/button'),
    ])
    expect(found).toHaveLength(3)
  })

  it('un componente no llama a services ni a hooks de datos', () => {
    const found = violationsFor('modules/waitlist/components/diner/X.jsx', [
      imp('../../services/waitlist.api', 'modules/waitlist/services/waitlist.api'),
      imp('../../hooks/useTurn', 'modules/waitlist/hooks/useTurn'),
      imp('@tanstack/react-query'),
    ])
    expect(found).toHaveLength(3)
  })

  it('una página no llama a services directamente', () => {
    expect(
      violationsFor('modules/waitlist/pages/diner/X.jsx', [
        imp('../../services/waitlist.api', 'modules/waitlist/services/waitlist.api'),
      ]),
    ).toHaveLength(1)
  })

  it('un módulo solo entra a otro por su index', () => {
    expect(
      violationsFor('modules/waitlist/hooks/X.js', [imp('@/modules/venues/services/venues.api')]),
    ).toHaveLength(1)
    expect(violationsFor('modules/waitlist/hooks/X.js', [imp('@/modules/venues', 'modules/venues/index.js')])).toEqual([])
  })

  it('dentro de un módulo se usan rutas relativas', () => {
    expect(
      violationsFor('modules/auth/hooks/X.js', [imp('@/modules/auth/services/auth.api')]),
    ).toHaveLength(1)
  })

  it('el index no exporta páginas', () => {
    expect(
      violationsFor('modules/auth/index.js', [imp('./pages/LoginPage', 'modules/auth/pages/LoginPage')]),
    ).toHaveLength(1)
  })

  it('los servicios y las utilidades no conocen React; shared no conoce módulos', () => {
    expect(violationsFor('services/api.js', [imp('react')])).toHaveLength(1)
    expect(violationsFor('shared/utils/x.js', [imp('react')])).toHaveLength(1)
    expect(violationsFor('shared/components/X.jsx', [imp('@/modules/auth', 'modules/auth/index.js')])).toHaveLength(1)
  })

  it('shadcn (ui) solo depende de lib', () => {
    expect(violationsFor('components/ui/button.jsx', [imp('@/lib/utils')])).toEqual([])
    expect(violationsFor('components/ui/button.jsx', [imp('@/shared/utils/time')])).toHaveLength(1)
  })
})
