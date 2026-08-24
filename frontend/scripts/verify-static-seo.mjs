import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const site = 'https://www.vitaglossrd.com'
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>https:\/\/www\.vitaglossrd\.com([^<]*)<\/loc>/g)].map(match => match[1])

const get = (html, pattern) => html.match(pattern)?.[1]?.trim() || ''
const normalizeContent = html => get(html, /<div id="root">([\s\S]*?)<\/div>/i)
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
}

console.log(`Verificación SEO estática: ${records.length} rutas.`)
console.log(`Títulos únicos: ${new Set(records.map(record => record.title)).size}.`)
console.log(`Descripciones únicas: ${new Set(records.map(record => record.description)).size}.`)
console.log(`Contenidos únicos: ${new Set(records.map(record => record.content)).size}.`)

for (const [name, items] of Object.entries(failures)) {
  if (items.length) console.error(`${name}: ${items.length}`)
}

if (Object.values(failures).some(items => items.length)) process.exitCode = 1
