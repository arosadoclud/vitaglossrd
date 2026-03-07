const fs = require('fs')
const src = fs.readFileSync('../frontend/src/data/posts.js', 'utf-8')

const postBlocks = []
let depth = 0, start = -1
const open = src.indexOf('export const posts = [')
let i = src.indexOf('[', open)
for (let j = i; j < src.length; j++) {
  if (src[j] === '{') { if (depth === 0) start = j; depth++ }
  else if (src[j] === '}') {
    depth--
    if (depth === 0 && start !== -1) { postBlocks.push(src.slice(start, j + 1)); start = -1 }
    else if (depth < 0) break
  }
}

postBlocks.forEach((block, idx) => {
  const slugM = block.match(/slug:\s*['`]([^'`]+)['`]/)
  const slug = slugM ? slugM[1] : '?'

  // Find contenido field — it uses backtick template literals
  const contStart = block.indexOf('contenido:')
  let words = 0
  if (contStart !== -1) {
    const backtickStart = block.indexOf('`', contStart)
    if (backtickStart !== -1) {
      const backtickEnd = block.indexOf('`', backtickStart + 1)
      if (backtickEnd !== -1) {
        const cont = block.slice(backtickStart + 1, backtickEnd)
          .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        words = cont.split(' ').filter(Boolean).length
      }
    }
  }

  const status = words < 600 ? 'CORTO' : words < 1000 ? 'MEDIO' : words < 1500 ? 'BUENO' : 'LARGO'
  const emoji = words < 600 ? 'X' : words < 1000 ? '~' : words < 1500 ? 'O' : 'V'
  console.log(`[${emoji}] ${(idx+1).toString().padStart(2)} ${words.toString().padStart(5)}w  ${status.padEnd(6)} ${slug}`)
})
