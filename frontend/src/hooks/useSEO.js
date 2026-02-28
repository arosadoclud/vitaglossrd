import { useEffect } from 'react'

const SITE_URL = 'https://vitaglossrd.com'
const SITE_OG_IMAGE = `${SITE_URL}/salud-bucal.jpg`

// Helper: upsert a <meta> by attribute selector
function setMeta(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    document.head.appendChild(el)
  }
  if (content) el.setAttribute('content', content)
}

// Helper: upsert a <link> by rel
function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * useSEO — inyecta todas las señales SEO críticas en el <head>
 * @param {string}   title        — Título de la página (sin sufijo de site)
 * @param {string}   description  — Meta description (120-160 chars ideal)
 * @param {string}   canonical    — URL canónica completa (https://vitaglossrd.com/…)
 * @param {string}   ogImage      — URL absoluta de imagen OG (1200×630 ideal)
 * @param {string}   ogImageAlt   — Texto alt de la imagen OG
 * @param {object}   articleMeta  — { published, modified, author, section, tags[] } para artículos
 * @param {object}   jsonLd       — Un objeto de JSON-LD
 * @param {array}    jsonLdList   — Varios objetos de JSON-LD (reemplaza jsonLd si ambos)
 */
export function useSEO({ title, description, canonical, ogImage, ogImageAlt, articleMeta, jsonLd, jsonLdList } = {}) {
  const fullTitle    = title ? `${title} | VitaGloss RD` : 'VitaGloss RD — Tu salud, tu sonrisa'
  const resolvedImg  = ogImage || SITE_OG_IMAGE
  const resolvedUrl  = canonical || SITE_URL
  const isArticle    = !!(canonical && canonical.includes('/blog/') && articleMeta)

  useEffect(() => {
    // ── Título ──────────────────────────────────────────────────────────────
    document.title = fullTitle

    // ── Canonical ───────────────────────────────────────────────────────────
    setLink('canonical', resolvedUrl)

    // ── Meta description ────────────────────────────────────────────────────
    if (description) setMeta('name', 'description', description)

    // ── Author ──────────────────────────────────────────────────────────────
    const authorName = articleMeta?.author || 'Andy Rosado — VitaGloss RD'
    setMeta('name', 'author', authorName)

    // ── Open Graph base ─────────────────────────────────────────────────────
    setMeta('property', 'og:title',        title || 'VitaGloss RD')
    if (description) setMeta('property', 'og:description', description)
    setMeta('property', 'og:url',          resolvedUrl)
    setMeta('property', 'og:image',        resolvedImg)
    setMeta('property', 'og:image:width',  '1200')
    setMeta('property', 'og:image:height', '630')
    if (ogImageAlt || title) setMeta('property', 'og:image:alt', ogImageAlt || title)
    setMeta('property', 'og:type',         isArticle ? 'article' : 'website')
    setMeta('property', 'og:locale',       'es_DO')
    setMeta('property', 'og:site_name',    'VitaGloss RD')

    // ── Open Graph article tags (solo en posts) ──────────────────────────────
    if (isArticle && articleMeta) {
      if (articleMeta.published) setMeta('property', 'article:published_time', articleMeta.published)
      if (articleMeta.modified)  setMeta('property', 'article:modified_time',  articleMeta.modified)
      if (articleMeta.author)    setMeta('property', 'article:author',          articleMeta.author)
      if (articleMeta.section)   setMeta('property', 'article:section',         articleMeta.section)
      if (articleMeta.tags?.length) {
        // Primeras 5 tags como article:tag individuales
        articleMeta.tags.slice(0, 5).forEach(tag => {
          let el = document.querySelector(`meta[property="article:tag"][content="${tag}"]`)
          if (!el) {
            el = document.createElement('meta')
            el.setAttribute('property', 'article:tag')
            el.setAttribute('content', tag)
            document.head.appendChild(el)
          }
        })
      }
    }

    // ── Twitter Card ────────────────────────────────────────────────────────
    setMeta('name', 'twitter:card',        'summary_large_image')
    setMeta('name', 'twitter:title',       title || 'VitaGloss RD')
    if (description) setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image',       resolvedImg)
    if (ogImageAlt || title) setMeta('name', 'twitter:image:alt', ogImageAlt || title)

  }, [fullTitle, description, resolvedUrl, resolvedImg, ogImageAlt, isArticle, articleMeta])

  // ── JSON-LD structured data ────────────────────────────────────────────────
  useEffect(() => {
    const id = 'vg-jsonld'
    let el = document.getElementById(id)
    const data = jsonLdList || (jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : null)
    if (!data || data.length === 0) {
      if (el) el.remove()
      return
    }
    if (!el) {
      el = document.createElement('script')
      el.id   = id
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data.length === 1 ? data[0] : data)
    return () => { document.getElementById(id)?.remove() }
  }, [jsonLd, jsonLdList])
}
