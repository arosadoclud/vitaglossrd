/**
 * VitaGloss RD — Auditoría y corrección automática de posts cortos
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/fix-short-posts.js
 *
 * Lo que hace:
 *   1. Lee todos los posts de frontend/src/data/posts.js
 *   2. Detecta los que tienen menos de 1000 palabras (CORTO / MEDIO)
 *   3. Llama a Claude para expandir el contenido a 1500+ palabras
 *   4. Reemplaza el campo `contenido` en posts.js manteniendo todo lo demás intacto
 *   5. Imprime un reporte de qué posts fueron corregidos
 *
 * GitHub Actions lo ejecuta cada 5 días automáticamente y hace commit si hay cambios.
 */

const Anthropic = require('@anthropic-ai/sdk')
const fs = require('fs')
const path = require('path')

const POSTS_FILE = path.join(__dirname, '../frontend/src/data/posts.js')
const MIN_WORDS_TARGET = 1000   // umbral para considerar un post "corto"
const TARGET_WORDS     = 1600   // objetivo de palabras al expandir

// ─── Contar palabras en texto sin HTML ────────────────────────────────────────
function contarPalabras(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
}

// ─── Extraer todos los posts con su posición en el archivo ───────────────────
function extraerPosts(src) {
  const posts = []
  let depth = 0, start = -1
  const open = src.indexOf('export const posts = [')
  let i = src.indexOf('[', open)

  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') { if (depth === 0) start = j; depth++ }
    else if (src[j] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        const block = src.slice(start, j + 1)

        const slugM     = block.match(/slug:\s*['`"]([^'`"]+)['`"]/)
        const tituloM   = block.match(/titulo:\s*['`"]([^'`"]+)['`"]/)
        const catM      = block.match(/categoria:\s*['`"]([^'`"]+)['`"]/)
        const tagsM     = block.match(/tags:\s*\[([^\]]+)\]/)
        const prodM     = block.match(/productoRelacionadoId:\s*(\d+)/)
        const excerptM  = block.match(/excerpt:\s*['`"]([\s\S]*?)['`"],/)

        // Extraer contenido (backtick template literal)
        const contStart = block.indexOf('contenido:')
        let contenido = ''
        let contAbsStart = -1, contAbsEnd = -1
        if (contStart !== -1) {
          const bt1 = block.indexOf('`', contStart)
          if (bt1 !== -1) {
            const bt2 = block.indexOf('`', bt1 + 1)
            if (bt2 !== -1) {
              contenido = block.slice(bt1 + 1, bt2)
              contAbsStart = start + bt1 + 1
              contAbsEnd   = start + bt2
            }
          }
        }

        posts.push({
          slug:       slugM    ? slugM[1]    : '?',
          titulo:     tituloM  ? tituloM[1]  : '?',
          categoria:  catM     ? catM[1]     : 'Salud',
          tags:       tagsM    ? tagsM[1].replace(/['"]/g, '').split(',').map(t => t.trim()) : [],
          productoId: prodM    ? parseInt(prodM[1]) : null,
          excerpt:    excerptM ? excerptM[1] : '',
          contenido,
          palabras:   contarPalabras(contenido),
          contAbsStart,
          contAbsEnd,
        })
        start = -1
      } else if (depth < 0) break
    }
  }
  return posts
}

// ─── Llamar a Claude para expandir el contenido ──────────────────────────────
async function expandirConIA(post, client) {
  console.log(`\n🤖 Expandiendo: "${post.titulo}" (${post.palabras} palabras → ${TARGET_WORDS}+)`)

  const prompt = `Eres el redactor senior del blog de VitaGloss RD, una tienda dominicana de suplementos Nutrilite™/Amway.

Tienes este artículo de blog que está demasiado corto (${post.palabras} palabras). Tu tarea es EXPANDIRLO para que tenga mínimo ${TARGET_WORDS} palabras.

DATOS DEL ARTÍCULO:
- Título: ${post.titulo}
- Categoría: ${post.categoria}
- Tags: ${post.tags.join(', ')}
- Extracto: ${post.excerpt}

CONTENIDO ACTUAL (HTML):
${post.contenido}

INSTRUCCIONES:
1. MANTÉN TODO el contenido existente — no elimines nada que ya está.
2. AGREGA secciones nuevas relevantes al tema para llegar a ${TARGET_WORDS}+ palabras.
3. Usa etiquetas HTML correctas: <h2>, <h3>, <p>, <ul>, <li>, <strong>.
4. El tono es: informativo, accesible, dominicano (sin ser informal en exceso). Orientado a convencer al lector de que necesita el suplemento.
5. Enfócate en el problema real que resuelve el producto, datos de salud locales (República Dominicana / Caribe), y llamados de acción sutiles.
6. NO incluyas introducción ni explicación — responde SOLO con el HTML del contenido expandido, empezando directamente con una etiqueta HTML.
7. NO repitas el título ni pongas el nombre del producto en exceso.
8. El contenido debe ser útil, no publicitario. Educa primero, vende después.

Responde ÚNICAMENTE con el HTML del contenido. Sin explicaciones, sin markdown, sin \`\`\`.`

  const message = await client.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: 4096,
    messages:   [{ role: 'user', content: prompt }],
  })

  const nuevoContenido = message.content[0].text.trim()
  const nuevasPalabras = contarPalabras(nuevoContenido)
  console.log(`   ✅ Expandido a ${nuevasPalabras} palabras`)
  return nuevoContenido
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY no está definida.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  console.log('📋 Leyendo posts...')
  let src = fs.readFileSync(POSTS_FILE, 'utf-8')
  const posts = extraerPosts(src)

  // Detectar posts cortos
  const cortos = posts.filter(p => p.palabras < MIN_WORDS_TARGET && p.contAbsStart !== -1)

  if (cortos.length === 0) {
    console.log(`✅ Todos los posts tienen ${MIN_WORDS_TARGET}+ palabras. Nada que corregir.`)
    process.exit(0)
  }

  console.log(`\n⚠️  ${cortos.length} post(s) con menos de ${MIN_WORDS_TARGET} palabras:`)
  cortos.forEach(p => console.log(`   • ${p.slug} (${p.palabras}w)`))

  // Expandir cada post corto
  // Procesar en orden inverso para no desalinear las posiciones al reemplazar
  const ordenados = [...cortos].sort((a, b) => b.contAbsStart - a.contAbsStart)

  const corregidos = []
  for (const post of ordenados) {
    try {
      const nuevoContenido = await expandirConIA(post, client)
      // Reemplazar en el string del archivo usando las posiciones absolutas
      src = src.slice(0, post.contAbsStart) + '\n      ' + nuevoContenido + '\n    ' + src.slice(post.contAbsEnd)
      corregidos.push(post.slug)
    } catch (err) {
      console.error(`   ❌ Error expandiendo "${post.slug}": ${err.message}`)
    }
  }

  if (corregidos.length === 0) {
    console.log('\n❌ No se pudo corregir ningún post.')
    process.exit(1)
  }

  // Guardar el archivo actualizado
  fs.writeFileSync(POSTS_FILE, src, 'utf-8')

  console.log(`\n🎉 ${corregidos.length} post(s) corregido(s) y guardados en posts.js:`)
  corregidos.forEach(s => console.log(`   ✔ ${s}`))

  // Output para GitHub Actions
  console.log(`\n::set-output name=posts_fixed::${corregidos.join(', ')}`)
}

main().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
