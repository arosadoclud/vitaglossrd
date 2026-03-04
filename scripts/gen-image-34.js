/**
 * Script temporal para generar la imagen del post 34 (Colágeno hidrolizado)
 * Uso: node scripts/gen-image-34.js
 */
const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')
const https = require('https')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const slug = 'colageno-hidrolizado-tipos-cual-comprar-republica-dominicana'
const titulo = 'Colágeno hidrolizado: tipos y cuál comprar en República Dominicana'
const tags = ['colágeno hidrolizado', 'suplementos RD', 'piel saludable']

const temasPrincipales = tags.slice(0, 3).join(', ')
const prompt = `Professional health and wellness blog cover photo for an article about: "${titulo}". \
Visual concept: ${temasPrincipales}. \
Style: high-quality editorial health magazine photography, clean and modern aesthetic, vibrant but professional color palette (teal, deep blue, white accents — matching a premium health brand). \
The image must directly and clearly represent the article topic — use realistic relevant imagery (nutritional supplements, healthy food, skincare products, or lifestyle wellness photography depending on the topic). \
NO text, NO titles, NO watermarks, NO logos in the image. \
Composition: wide landscape format, centered subject with clean background, professional studio lighting or natural light. \
Feel: trustworthy, premium health brand, Latin American wellness market.`

function descargarArchivo(url, destino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destino)
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', err => { fs.unlink(destino, () => {}); reject(err) })
  })
}

;(async () => {
  console.log('🎨 Generando imagen con DALL-E 3...')
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      response_format: 'url',
    })
    const imageUrl = response.data[0].url
    const blogDir = path.join(__dirname, '../frontend/public/blog')
    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true })
    const destino = path.join(blogDir, `${slug}.png`)
    await descargarArchivo(imageUrl, destino)
    console.log(`✅ Imagen guardada en /blog/${slug}.png`)
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
})()
