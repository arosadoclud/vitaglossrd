import { access, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { posts } from '../src/data/posts.js'

const publicDir = path.resolve('public')
const errors = []
const warnings = []
const seenSlugs = new Set()
const seenIds = new Set()
const imageUsage = new Map()
const hashes = new Map()
const healthCategories = new Set(['Nutrición', 'Suplementos', 'Salud bucal', 'Bienestar', 'Vitaminas'])
const pendingSourceReview = []

const textOnly = html => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim()

for (const post of posts) {
  if (seenSlugs.has(post.slug)) errors.push(`${post.slug}: slug duplicado`)
  if (seenIds.has(post.id)) errors.push(`${post.slug}: id duplicado (${post.id})`)
  seenSlugs.add(post.slug)
  seenIds.add(post.id)

  const words = textOnly(post.contenido || '').split(/\s+/).filter(Boolean).length
  if (words < 800) warnings.push(`${post.slug}: contenido breve (${words} palabras); revisar utilidad, no rellenar`)
  if (!post.metaDescripcion || post.metaDescripcion.length < 110 || post.metaDescripcion.length > 165) {
    warnings.push(`${post.slug}: meta description de ${post.metaDescripcion?.length || 0} caracteres`)
  }
  if (healthCategories.has(post.categoria) && !/href=["']https?:\/\//i.test(post.contenido || '') && !post.fuentes?.length) {
    pendingSourceReview.push(post.slug)
  }
  if (!post.imagen?.startsWith('/')) {
    errors.push(`${post.slug}: imagen inválida`)
    continue
  }

  const imagePath = path.join(publicDir, post.imagen.slice(1))
  try {
    await access(imagePath)
    const info = await stat(imagePath)
    const metadata = await sharp(imagePath).metadata()
    imageUsage.set(post.imagen, [...(imageUsage.get(post.imagen) || []), post.slug])
    const hash = createHash('sha256').update(await readFile(imagePath)).digest('hex')
    hashes.set(hash, [...(hashes.get(hash) || []), post.imagen])
    if (post.imagenCover && metadata.format !== 'webp') warnings.push(`${post.slug}: cover no es WebP`)
    if (post.imagenCover && info.size > 200 * 1024) warnings.push(`${post.slug}: cover pesa ${Math.round(info.size / 1024)} KB`)
    if (post.imagen.startsWith('/blog/covers/') && (metadata.width !== 1200 || metadata.height !== 630)) {
      warnings.push(`${post.slug}: cover ${metadata.width}x${metadata.height}; esperado 1200x630`)
    }
  } catch {
    errors.push(`${post.slug}: no existe ${post.imagen}`)
  }

  const internalLinks = [...(post.contenido || '').matchAll(/href=["'](\/[^"]+)["']/g)].map(match => match[1])
  for (const href of internalLinks) {
    if (href.startsWith('/blog/')) {
      const target = href.split('#')[0].replace('/blog/', '')
      if (!posts.some(candidate => candidate.slug === target)) warnings.push(`${post.slug}: enlace interno sin destino ${href}`)
    }
  }
}

for (const [image, slugs] of imageUsage) {
  if (slugs.length > 1) warnings.push(`${image}: usada en ${slugs.length} artículos`)
}
for (const paths of hashes.values()) {
  const unique = [...new Set(paths)]
  if (unique.length > 1) warnings.push(`archivos visualmente idénticos: ${unique.join(', ')}`)
}

if (pendingSourceReview.length) {
  warnings.push(`${pendingSourceReview.length} artículos de salud requieren referencias específicas verificables; ver docs/content/PLANTILLA_ARTICULO_EDITORIAL.md`)
}

console.log(`Auditoría: ${posts.length} artículos, ${errors.length} errores, ${warnings.length} advertencias.`)
warnings.forEach(item => console.warn(`ADVERTENCIA: ${item}`))
errors.forEach(item => console.error(`ERROR: ${item}`))
if (errors.length) process.exitCode = 1
