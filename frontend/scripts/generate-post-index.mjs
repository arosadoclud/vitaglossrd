import { mkdir, writeFile } from 'node:fs/promises'
import { posts, postRedirects } from '../src/data/posts.js'

const index = posts
  .map(({ contenido, faqs, ...metadata }) => metadata)
  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

const banner = '// Generado por npm run content:index. No editar a mano.\n'
await writeFile(
  new URL('../src/data/postIndex.generated.js', import.meta.url),
  `${banner}export const posts = ${JSON.stringify(index, null, 2)}\n\nexport const categorias = ['Todas', ...new Set(posts.map(post => post.categoria))]\n\nexport const postRedirects = ${JSON.stringify(postRedirects, null, 2)}\n`,
  'utf8',
)

const contentDir = new URL('../public/blog/content/', import.meta.url)
await mkdir(contentDir, { recursive: true })
await Promise.all(posts.map(({ slug, contenido, faqs = [] }) =>
  writeFile(new URL(`${slug}.json`, contentDir), JSON.stringify({ contenido, faqs }), 'utf8')
))

console.log(`Índice generado: ${index.length} artículos; contenido separado por URL.`)
