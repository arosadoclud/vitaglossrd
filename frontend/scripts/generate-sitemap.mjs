import { writeFile } from 'node:fs/promises'
import { posts } from '../src/data/posts.js'
import { productos } from '../src/data/productos.js'
import { combos } from '../src/data/combos.js'
import { slugify } from '../src/utils/slugify.js'

const site = 'https://www.vitaglossrd.com'
const today = new Date().toISOString().slice(0, 10)

const staticPages = [
  { path: '/', label: 'Inicio', changefreq: 'weekly', priority: '1.0' },
  { path: '/catalogo', label: 'Catálogo', changefreq: 'weekly', priority: '0.9' },
  { path: '/combos', label: 'Combos', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', label: 'Blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/sobre-nosotros', label: 'Sobre nosotros', changefreq: 'monthly', priority: '0.7' },
  { path: '/equipo', label: 'Vende con nosotros', changefreq: 'monthly', priority: '0.6' },
  { path: '/contacto', label: 'Contacto', changefreq: 'monthly', priority: '0.7' },
  { path: '/faq', label: 'Preguntas frecuentes', changefreq: 'monthly', priority: '0.6' },
  { path: '/politica-editorial', label: 'Política editorial', changefreq: 'monthly', priority: '0.5' },
  { path: '/pelo-piel-unas', label: 'Cabello, piel y uñas', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacidad', label: 'Política de privacidad', changefreq: 'yearly', priority: '0.3' },
  { path: '/devoluciones', label: 'Política de devoluciones', changefreq: 'yearly', priority: '0.3' },
  { path: '/terminos', label: 'Términos de uso', changefreq: 'yearly', priority: '0.3' },
  { path: '/mapa-del-sitio.html', label: 'Mapa del sitio', changefreq: 'weekly', priority: '0.4' },
]

const productPages = productos.map(producto => ({
  path: `/producto/${slugify(producto.nombre)}`,
  label: producto.nombre,
  priority: '0.8',
}))

const comboPages = combos.map(combo => ({
  path: `/combos/${combo.id}`,
  label: combo.nombre || combo.titulo || `Combo ${combo.id}`,
  priority: '0.7',
}))

const postPages = posts.map(post => ({
  path: `/blog/${post.slug}`,
  label: post.titulo,
  lastmod: post.fechaActualizacion || post.fecha,
  changefreq: 'monthly',
  priority: '0.7',
  image: post.imagen,
}))

const urls = [...staticPages, ...productPages, ...comboPages, ...postPages]

const xmlEntry = ({ path, lastmod = today, changefreq = 'monthly', priority = '0.6', image }) => `  <url>\n    <loc>${site}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${image ? `\n    <image:image><image:loc>${site}${encodeURI(image)}</image:loc></image:image>` : ''}\n  </url>`

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(xmlEntry).join('\n')}\n</urlset>\n`

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const linkList = items => items
  .map(({ path, label }) => `          <li><a href="${path}">${escapeHtml(label)}</a></li>`)
  .join('\n')

const html = `<!doctype html>
<html lang="es-DO">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mapa del sitio | VitaGloss RD</title>
    <meta name="description" content="Directorio de páginas, productos, combos y artículos publicados en VitaGloss RD.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${site}/mapa-del-sitio.html">
    <link rel="alternate" hreflang="es" href="${site}/mapa-del-sitio.html">
    <link rel="alternate" hreflang="es-DO" href="${site}/mapa-del-sitio.html">
    <link rel="alternate" hreflang="x-default" href="${site}/mapa-del-sitio.html">
    <style>
      :root{font-family:Inter,system-ui,sans-serif;color:#173044;background:#f5f8fa}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:1120px;margin:auto;padding:24px}header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #d9e4e8;background:#fff}header a{font-weight:800;color:#0a3850;text-decoration:none}main{background:#fff}h1,h2{color:#08243a}h1{font-size:clamp(2rem,5vw,3.5rem);margin-bottom:.4rem}p{line-height:1.65}section{padding:18px 0;border-top:1px solid #e3eaed}ul{columns:3 260px;gap:32px;padding-left:20px}li{break-inside:avoid;margin:0 0 10px}a{color:#087e7a;text-underline-offset:3px}footer{font-size:.9rem;color:#526774}
    </style>
  </head>
  <body>
    <header><a href="/">VitaGloss RD</a><a href="/contacto">Contacto</a></header>
    <main>
      <h1>Mapa del sitio</h1>
      <p>Encuentra las secciones públicas, fichas de productos, combos informativos y artículos educativos de VitaGloss RD. Este directorio facilita la navegación de personas y buscadores.</p>
      <section><h2>Secciones principales</h2><ul>
${linkList(staticPages.filter(page => page.path !== '/mapa-del-sitio.html'))}
      </ul></section>
      <section><h2>Productos</h2><ul>
${linkList(productPages)}
      </ul></section>
      <section><h2>Combos</h2><ul>
${linkList(comboPages)}
      </ul></section>
      <section><h2>Artículos del blog</h2><ul>
${linkList(postPages)}
      </ul></section>
    </main>
    <footer>Actualizado el ${today}. <a href="/">Volver al inicio</a>.</footer>
  </body>
</html>
`

await Promise.all([
  writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8'),
  writeFile(new URL('../public/mapa-del-sitio.html', import.meta.url), html, 'utf8'),
])

console.log(`Sitemap XML y mapa HTML generados: ${urls.length} URLs canónicas.`)
