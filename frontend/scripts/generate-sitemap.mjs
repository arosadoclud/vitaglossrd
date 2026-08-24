import { writeFile } from 'node:fs/promises'
import { posts } from '../src/data/posts.js'
import { productos } from '../src/data/productos.js'
import { combos } from '../src/data/combos.js'
import { slugify } from '../src/utils/slugify.js'

const site = 'https://www.vitaglossrd.com'
const today = '2026-08-24'
const staticPages = [
  ['/', 'weekly', '1.0'], ['/catalogo', 'weekly', '0.9'], ['/combos', 'weekly', '0.8'],
  ['/blog', 'weekly', '0.9'], ['/sobre-nosotros', 'monthly', '0.7'], ['/equipo', 'monthly', '0.6'],
  ['/contacto', 'monthly', '0.7'], ['/faq', 'monthly', '0.6'], ['/privacidad', 'yearly', '0.3'],
  ['/devoluciones', 'yearly', '0.3'], ['/terminos', 'yearly', '0.3'], ['/politica-editorial', 'monthly', '0.5'],
  ['/pelo-piel-unas', 'monthly', '0.7'], ['/empieza', 'monthly', '0.6'],
]

const entry = ({ path, lastmod = today, changefreq = 'monthly', priority = '0.6', image }) => `  <url>\n    <loc>${site}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${image ? `\n    <image:image><image:loc>${site}${encodeURI(image)}</image:loc></image:image>` : ''}\n  </url>`

const urls = [
  ...staticPages.map(([path, changefreq, priority]) => ({ path, changefreq, priority })),
  ...productos.map(producto => ({ path: `/producto/${slugify(producto.nombre)}`, priority: '0.8' })),
  ...combos.map(combo => ({ path: `/combos/${combo.id}`, priority: '0.7' })),
  ...posts.map(post => ({
    path: `/blog/${post.slug}`,
    lastmod: post.fechaActualizacion || post.fecha,
    changefreq: 'monthly',
    priority: '0.7',
    image: post.imagen,
  })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(entry).join('\n')}\n</urlset>\n`
await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8')
console.log(`Sitemap generado: ${urls.length} URLs canónicas.`)
