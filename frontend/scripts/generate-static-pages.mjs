import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { productos } from '../src/data/productos.js'
import { combos } from '../src/data/combos.js'
import { posts } from '../src/data/posts.js'
import { slugify } from '../src/utils/slugify.js'

const root = fileURLToPath(new URL('../dist/', import.meta.url))
const site = 'https://www.vitaglossrd.com'
const template = await readFile(join(root, 'index.html'), 'utf8')

const escapeHtml = value => String(value || '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const plainText = value => String(value || '')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim()

const description = value => plainText(value).slice(0, 155).replace(/\s+\S*$/, '')

const nav = `<nav aria-label="Navegación principal"><a href="/">Inicio</a> · <a href="/catalogo">Catálogo</a> · <a href="/combos">Combos</a> · <a href="/blog">Blog</a> · <a href="/contacto">Contacto</a></nav>`

const pageShell = ({ title, intro, body, path }) => `
  <main class="seo-static" style="max-width:960px;margin:0 auto;padding:32px 24px 56px;font-family:Inter,Arial,sans-serif;color:#173044;line-height:1.65">
    ${nav}
    <article>
      <p style="color:#138f8a;font-weight:800;letter-spacing:.08em;text-transform:uppercase">VitaGloss RD</p>
      <h1 style="font-size:clamp(2rem,5vw,3.4rem);line-height:1.1;color:#08243a">${escapeHtml(title)}</h1>
      <p>${escapeHtml(intro)}</p>
      ${body}
    </article>
    <p><a href="${path.startsWith('/blog/') ? '/blog' : path.startsWith('/combos/') ? '/combos' : '/catalogo'}">Explorar contenido relacionado</a> · <a href="/mapa-del-sitio.html">Mapa del sitio</a></p>
  </main>`

function render({ path, title, description: metaDescription, content, robots = 'index, follow' }) {
  const canonical = `${site}${path === '/' ? '/' : path}`
  const cleanTemplate = template
    .replace(/\s*<link rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<link rel="alternate"[^>]*hreflang[^>]*>/gi, '')

  return cleanTemplate
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)} | VitaGloss RD</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/i, `<meta name="description" content="${escapeHtml(metaDescription)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/i, `<meta name="robots" content="${robots}" />`)
    .replace('</head>', `    <link rel="canonical" href="${canonical}" />\n    <link rel="alternate" hreflang="es" href="${canonical}" />\n    <link rel="alternate" hreflang="es-DO" href="${canonical}" />\n    <link rel="alternate" hreflang="x-default" href="${canonical}" />\n  </head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${content}</div>`)
}

async function save(page) {
  const relative = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`
  const target = join(root, relative)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, render(page), 'utf8')
}

const staticPages = [
  ['catalogo', 'Catálogo de bienestar', 'Consulta productos de nutrición, cuidado personal, salud bucal y hogar disponibles para orientación en República Dominicana.'],
  ['combos', 'Combos y rutinas de bienestar', 'Explora agrupaciones informativas de productos organizadas por objetivo y tipo de rutina.'],
  ['blog', 'Blog de bienestar', 'Artículos educativos sobre nutrición, cuidado personal, salud bucal y hábitos cotidianos con enfoque responsable.'],
  ['sobre-nosotros', 'Sobre VitaGloss RD', 'Conoce quién administra VitaGloss RD, nuestro propósito editorial y la forma responsable en que orientamos a clientes.'],
  ['equipo', 'Vende con nosotros', 'Información para personas interesadas en conocer una actividad independiente de venta directa, sin promesas de empleo o ingresos.'],
  ['contacto', 'Contacto', 'Comunícate con VitaGloss RD para recibir orientación sobre productos, MyShop o el proceso informativo para vendedores.'],
  ['faq', 'Preguntas frecuentes', 'Respuestas claras sobre orientación, compras mediante MyShop, productos y funcionamiento de VitaGloss RD.'],
  ['privacidad', 'Política de privacidad', 'Consulta cómo VitaGloss RD recopila, utiliza y protege la información enviada mediante formularios y canales de contacto.'],
  ['devoluciones', 'Política de devoluciones', 'Información general sobre solicitudes, condiciones y canales aplicables a devoluciones y satisfacción del cliente.'],
  ['terminos', 'Términos de uso', 'Condiciones para navegar y utilizar el contenido, formularios y recursos publicados por VitaGloss RD.'],
  ['politica-editorial', 'Política editorial', 'Criterios de redacción, revisión, transparencia y actualización aplicados al contenido educativo de VitaGloss RD.'],
  ['pelo-piel-unas', 'Rutina para cabello, piel y uñas', 'Guía informativa para conocer opciones de cuidado personal y construir una rutina según tus necesidades.'],
].map(([slug, title, intro]) => ({
  path: `/${slug}`,
  title,
  description: description(intro),
  content: pageShell({
    title,
    intro,
    path: `/${slug}`,
    body: `<h2>Información útil y transparente</h2><p>${escapeHtml(intro)} Esta página forma parte de la guía pública de VitaGloss RD para República Dominicana. Presentamos la información de manera organizada, distinguimos la orientación comercial del consejo profesional y remitimos a las etiquetas y fuentes oficiales cuando corresponde.</p><p>Antes de elegir un producto, revisa sus instrucciones, advertencias y condiciones vigentes. Para preguntas particulares puedes utilizar nuestros canales de contacto y recibir acompañamiento sin presión.</p>`,
  }),
}))

const productPages = productos.map(producto => {
  const path = `/producto/${slugify(producto.nombre)}`
  const intro = producto.descripcionLarga || producto.descripcion
  const benefits = (producto.beneficios || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')
  return {
    path,
    title: producto.nombreCorto || producto.nombre,
    description: description(producto.descripcion),
    content: pageShell({
      title: producto.nombreCorto || producto.nombre,
      intro: producto.descripcion,
      path,
      body: `<h2>Descripción</h2>${plainText(intro).split(/\n+/).filter(Boolean).map(text => `<p>${escapeHtml(text)}</p>`).join('')}<h2>Características principales</h2><ul>${benefits}</ul><p>Consulta siempre la etiqueta, las instrucciones y las advertencias oficiales antes de usar el producto. Esta ficha es informativa y no sustituye consejo médico u odontológico.</p>`,
    }),
  }
})

const comboPages = combos.map(combo => {
  const path = `/combos/${combo.id}`
  const benefits = (combo.beneficios || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')
  const included = (combo.productos || []).map(item => `<li>${escapeHtml(item.nombre)} — ${escapeHtml(item.cantidad)}</li>`).join('')
  return {
    path,
    title: combo.nombre,
    description: description(combo.descripcion),
    content: pageShell({
      title: combo.nombre,
      intro: combo.descripcion,
      path,
      body: `<h2>¿Qué incluye?</h2><ul>${included}</ul><h2>Descripción de la rutina</h2><p>${escapeHtml(plainText(combo.descripcionLarga))}</p><h2>Características</h2><ul>${benefits}</ul><p>Verifica disponibilidad, precio e instrucciones de cada producto en la fuente oficial antes de comprar.</p>`,
    }),
  }
})

const postPages = posts.map(post => {
  const path = `/blog/${post.slug}`
  return {
    path,
    title: post.titulo,
    description: description(post.metaDescripcion || post.excerpt),
    content: pageShell({
      title: post.titulo,
      intro: post.excerpt,
      path,
      body: `<p><strong>Publicado:</strong> ${escapeHtml(post.fecha)} · <strong>Autor:</strong> ${escapeHtml(post.autor || 'Equipo editorial VitaGloss RD')}</p>${post.contenido}`,
    }),
  }
})

const privatePage = {
  path: '/_app',
  title: 'Área privada',
  description: 'Acceso privado de VitaGloss RD.',
  robots: 'noindex, nofollow',
  content: '<main><h1>Área privada de VitaGloss RD</h1><p>Inicia sesión para acceder a esta sección.</p></main>',
}

await Promise.all([...staticPages, ...productPages, ...comboPages, ...postPages, privatePage].map(save))
console.log(`Prerender completado: ${staticPages.length + productPages.length + comboPages.length + postPages.length} rutas públicas únicas.`)
