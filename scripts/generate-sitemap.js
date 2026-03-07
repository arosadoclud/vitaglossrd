#!/usr/bin/env node
/**
 * generate-sitemap.js — Auto-genera sitemap.xml desde los datos de posts.js
 *
 * Uso:
 *   node scripts/generate-sitemap.js
 *
 * Ejecutar cada vez que se agregue o modifique un post.
 * Lee frontend/src/data/posts.js y escribe frontend/public/sitemap.xml
 */

const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const ROOT = resolve(__dirname, '..')

// ── Rutas ─────────────────────────────────────────────────────────────────
const POSTS_FILE  = resolve(ROOT, 'frontend/src/data/posts.js')
const SITEMAP_OUT = resolve(ROOT, 'frontend/public/sitemap.xml')
const SITE_URL    = 'https://vitaglossrd.com'

// ── Leer posts.js como texto y extraer datos con regex ────────────────────
const src = readFileSync(POSTS_FILE, 'utf-8')

// Extraer bloques de cada post (entre llaves de nivel 1)
// Usa regex simples para extraer campos clave
function extractField(block, field) {
  const re = new RegExp(`${field}:\\s*['"\`]([^'"\`]+)['"\`]`)
  const m  = block.match(re)
  return m ? m[1] : null
}

// Encontrar todos los objetos del array posts (parser de bloques {})
const postBlocks = []
let depth = 0
let start = -1
const open  = src.indexOf('export const posts = [')
if (open === -1) { console.error('No se encontró exports const posts = ['); process.exit(1) }
let i = src.indexOf('[', open)
for (let j = i; j < src.length; j++) {
  if (src[j] === '{') {
    if (depth === 0) start = j  // start of a top-level block
    depth++
  } else if (src[j] === '}') {
    depth--
    if (depth === 0 && start !== -1) {
      postBlocks.push(src.slice(start, j + 1))
      start = -1
    } else if (depth < 0) break  // end of array
  }
}

const posts = postBlocks.map(block => ({
  slug:             extractField(block, 'slug'),
  imagen:           extractField(block, 'imagen'),
  fecha:            extractField(block, 'fecha'),
  fechaActualizacion: extractField(block, 'fechaActualizacion'),
  titulo:           extractField(block, 'titulo'),
})).filter(p => p.slug)

console.log(`✓ ${posts.length} posts extraídos de posts.js`)

// ── Páginas estáticas ─────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10)

const staticPages = [
  { loc: '/',              lastmod: TODAY,       freq: 'weekly',  pri: '1.0' },
  { loc: '/catalogo',      lastmod: TODAY,       freq: 'weekly',  pri: '0.9' },
  { loc: '/combos',        lastmod: '2026-02-28', freq: 'weekly',  pri: '0.8' },
  { loc: '/sobre-nosotros',lastmod: '2026-02-27', freq: 'monthly', pri: '0.7' },
  { loc: '/equipo',        lastmod: '2026-02-27', freq: 'monthly', pri: '0.6' },
  { loc: '/contacto',      lastmod: '2026-02-27', freq: 'monthly', pri: '0.7' },
  { loc: '/faq',           lastmod: '2026-02-27', freq: 'monthly', pri: '0.6' },
  { loc: '/privacidad',    lastmod: '2026-02-27', freq: 'yearly',  pri: '0.3' },
  { loc: '/terminos',      lastmod: '2026-02-27', freq: 'yearly',  pri: '0.3' },
]

const totalProductos = 26
const productPages = Array.from({ length: totalProductos }, (_, k) => ({
  loc:     `/producto/${k + 1}`,
  lastmod: '2026-02-28',
  freq:    'monthly',
  pri:     '0.8',
}))

// ── Encoder XML-safe ──────────────────────────────────────────────────────
function xmlEsc(str) {
  if (!str) return ''
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;')
}

function encodeImgUrl(path) {
  if (!path) return ''
  // Encode each path segment separately
  return path.split('/').map(seg => encodeURIComponent(seg).replace(/%2F/g, '/')).join('/')
}

// ── Construir XML ─────────────────────────────────────────────────────────
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`

xml += `  <!-- PÁGINAS PRINCIPALES -->\n`
for (const p of staticPages) {
  xml += `  <url><loc>${SITE_URL}${p.loc}</loc><lastmod>${p.lastmod}</lastmod>`
  xml += `<changefreq>${p.freq}</changefreq><priority>${p.pri}</priority></url>\n`
}

xml += `\n  <!-- PRODUCTOS -->\n`
for (const p of productPages) {
  xml += `  <url><loc>${SITE_URL}${p.loc}</loc><lastmod>${p.lastmod}</lastmod>`
  xml += `<changefreq>${p.freq}</changefreq><priority>${p.pri}</priority></url>\n`
}

xml += `\n  <!-- BLOG ÍNDICE -->\n`
xml += `  <url><loc>${SITE_URL}/blog</loc><lastmod>${TODAY}</lastmod>`
xml += `<changefreq>daily</changefreq><priority>0.9</priority></url>\n`

xml += `\n  <!-- BLOG ARTÍCULOS -->\n`
for (const p of posts) {
  const lastmod = p.fechaActualizacion || p.fecha || '2026-02-28'
  const imgPath = p.imagen ? `${SITE_URL}${encodeImgUrl(p.imagen)}` : null

  xml += `  <url>\n`
  xml += `    <loc>${SITE_URL}/blog/${p.slug}</loc>\n`
  xml += `    <lastmod>${lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>\n`
  if (imgPath) {
    xml += `    <image:image>\n`
    xml += `      <image:loc>${imgPath}</image:loc>\n`
    xml += `      <image:title>${xmlEsc(p.titulo)} — VitaGloss RD</image:title>\n`
    xml += `    </image:image>\n`
  }
  xml += `  </url>\n`
}

xml += `\n</urlset>\n`

// ── Escribir ──────────────────────────────────────────────────────────────
writeFileSync(SITEMAP_OUT, xml, 'utf-8')
console.log(`✓ Sitemap generado: ${SITEMAP_OUT}`)
console.log(`  ${posts.length} artículos de blog · ${staticPages.length} páginas · ${totalProductos} productos`)
