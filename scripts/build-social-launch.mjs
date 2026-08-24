import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from '../frontend/node_modules/sharp/lib/index.js'

const [identitySource, questionsSource, trustSource] = process.argv.slice(2)

if (!identitySource || !questionsSource || !trustSource) {
  console.error('Uso: node scripts/build-social-launch.mjs <fondo-1> <fondo-2> <fondo-3>')
  process.exit(1)
}

const outputDirectory = path.resolve('docs/content/social/relaunch-01')
await fs.mkdir(outputDirectory, { recursive: true })

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const line = (text, x, y, size, color, weight = 700, letterSpacing = 0) =>
  `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${letterSpacing}" fill="${color}">${escapeXml(text)}</text>`

const brand = (color) => `
  ${line('VITAGLOSS', 86, 106, 24, color, 800, 3)}
  ${line('RD', 260, 106, 24, '#6fbd45', 800, 3)}
  <rect x="86" y="128" width="52" height="6" rx="3" fill="#18bdb5"/>
`

const overlay = (content, background = 'none') => Buffer.from(`
  <svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    ${background}
    ${content}
  </svg>
`)

const assets = [
  {
    input: identitySource,
    output: '01-nueva-etapa.jpg',
    position: 'centre',
    overlay: overlay(`
      <rect x="62" y="62" width="690" height="730" rx="34" fill="#fffdf7" fill-opacity="0.90"/>
      ${brand('#08243a')}
      ${line('UNA NUEVA', 86, 250, 26, '#138f8a', 800, 4)}
      ${line('ETAPA.', 86, 350, 88, '#08243a', 800)}
      ${line('La misma intención:', 86, 438, 49, '#08243a', 650)}
      ${line('orientarte mejor.', 86, 505, 49, '#138f8a', 750)}
      <line x1="86" y1="585" x2="610" y2="585" stroke="#08243a" stroke-opacity="0.16" stroke-width="2"/>
      ${line('Bienestar elegido', 86, 650, 31, '#344e5e', 500)}
      ${line('con criterio.', 86, 692, 31, '#344e5e', 500)}
      ${line('01 / 03', 86, 748, 18, '#667985', 700, 2)}
    `),
  },
  {
    input: questionsSource,
    output: '02-mejores-preguntas.jpg',
    position: 'centre',
    overlay: overlay(`
      <rect x="56" y="56" width="650" height="884" rx="34" fill="#fffdf8" fill-opacity="0.92"/>
      ${brand('#08243a')}
      ${line('ANTES DE ELEGIR,', 86, 228, 24, '#138f8a', 800, 3)}
      ${line('haz mejores', 86, 325, 72, '#08243a', 800)}
      ${line('preguntas.', 86, 405, 72, '#08243a', 800)}
      <line x1="86" y1="466" x2="632" y2="466" stroke="#08243a" stroke-opacity="0.16" stroke-width="2"/>
      ${line('01', 86, 550, 25, '#18a7a0', 800)}
      ${line('¿Cuál es su uso previsto?', 150, 550, 27, '#253f50', 600)}
      ${line('02', 86, 632, 25, '#18a7a0', 800)}
      ${line('¿Qué indica la etiqueta?', 150, 632, 27, '#253f50', 600)}
      ${line('03', 86, 714, 25, '#18a7a0', 800)}
      ${line('¿Cómo se usa correctamente?', 150, 714, 27, '#253f50', 600)}
      ${line('Decidir informado también', 86, 820, 25, '#566c79', 500)}
      ${line('es parte del bienestar.', 86, 856, 25, '#566c79', 500)}
      ${line('02 / 03', 86, 916, 18, '#667985', 700, 2)}
    `),
  },
  {
    input: trustSource,
    output: '03-compromiso-confianza.jpg',
    position: 'centre',
    overlay: overlay(`
      ${brand('#f7fbf8')}
      ${line('NUESTRO COMPROMISO', 86, 254, 24, '#5ed2c7', 800, 3)}
      ${line('Información', 86, 355, 72, '#ffffff', 800)}
      ${line('clara.', 86, 430, 72, '#ffffff', 800)}
      ${line('Fuentes oficiales.', 86, 525, 48, '#8fe0d7', 750)}
      ${line('Acompañamiento', 86, 592, 48, '#8fe0d7', 750)}
      ${line('responsable.', 86, 659, 48, '#8fe0d7', 750)}
      <line x1="86" y1="726" x2="690" y2="726" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
      ${line('La confianza se construye', 86, 790, 28, '#f2f6f4', 500)}
      ${line('con hechos.', 86, 830, 28, '#f2f6f4', 500)}
      ${line('03 / 03', 86, 916, 18, '#d6e4e2', 700, 2)}
    `),
  },
]

for (const asset of assets) {
  await sharp(asset.input)
    .resize(1080, 1080, { fit: 'cover', position: asset.position })
    .composite([{ input: asset.overlay }])
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 90, progressive: true, mozjpeg: true })
    .toFile(path.join(outputDirectory, asset.output))
}

console.log(outputDirectory)
