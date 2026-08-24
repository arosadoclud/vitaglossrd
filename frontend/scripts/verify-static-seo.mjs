import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const site = 'https://www.vitaglossrd.com'
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>https:\/\/www\.vitaglossrd\.com([^<]*)<\/loc>/g)].map(match => match[1])

const get = (html, pattern) => html.match(pattern)?.[1]?.trim() || ''
const normalizeContent = html => (get(html, /<div id="root">([\s\S]*?)<\/div>/i) || get(html, /<body[^>]*>([\s\S]*?)<\/body>/i))
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const records = await Promise.all(paths.map(async path => {
  const relative = path === '/' ? 'index.html' : path === '/mapa-del-sitio.html' ? 'mapa-del-sitio.html' : `${path.slice(1)}.html`
  try {
    const html = await readFile(join(dist, relative), 'utf8')
    return {
      path,
      title: get(html, /<title>([\s\S]*?)<\/title>/i),
      description: get(html, /<meta name="description" content="([^"]*)"/i),
      canonical: get(html, /<link rel="canonical" href="([^"]*)"/i),
      h1: (html.match(/<h1[ >]/gi) || []).length,
      content: normalizeContent(html),
      links: [...html.matchAll(/href="(\/[^"]*)"/g)].map(match => match[1]),
    }
  } catch {
    return { path, missing: true, title: '', description: '', canonical: '', h1: 0, content: '' }
  }
}))

const duplicateGroups = key => [...Map.groupBy(records, record => record[key]).entries()]
  .filter(([value, group]) => value && group.length > 1)

const failures = {
  missingFiles: records.filter(record => record.missing),
  duplicateTitles: duplicateGroups('title'),
  duplicateDescriptions: duplicateGroups('description'),
  duplicateContent: duplicateGroups('content'),
  badCanonicals: records.filter(record => record.canonical !== `${site}${record.path}`),
  invalidH1: records.filter(record => record.h1 !== 1),
  longTitles: records.filter(record => record.title.length > 60),
  lowWordCount: records.filter(record => record.content.split(/\s+/).filter(Boolean).length < 200),
}

const inboundCounts = new Map(records.map(record => [record.path, 0]))
for (const record of records) {
  for (const link of new Set(record.links || [])) {
    const normalized = link.split(/[?#]/)[0]
    if (inboundCounts.has(normalized) && normalized !== record.path) {
      inboundCounts.set(normalized, inboundCounts.get(normalized) + 1)
    }
  }
}
failures.lowInternalInbound = records.filter(record => record.path !== '/' && (inboundCounts.get(record.path) || 0) < 2)

console.log(`Verificación SEO estática: ${records.length} rutas.`)
console.log(`Títulos únicos: ${new Set(records.map(record => record.title)).size}.`)
console.log(`Descripciones únicas: ${new Set(records.map(record => record.description)).size}.`)
console.log(`Contenidos únicos: ${new Set(records.map(record => record.content)).size}.`)

for (const [name, items] of Object.entries(failures)) {
  if (items.length) {
    console.error(`${name}: ${items.length}`)
    if (items[0]?.path) console.error(items.slice(0, 10).map(item => `  - ${item.path}`).join('\n'))
  }
}

if (Object.values(failures).some(items => items.length)) process.exitCode = 1
