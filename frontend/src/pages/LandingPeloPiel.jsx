/**
 * Super Landing Page — Pelo Piel y Uñas Nutrilite™
 * Diseño premium para mujeres. Pensada para convertir tráfico de redes.
 * Sin navbar. Una sola acción: WhatsApp.
 */
import { useEffect, useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'

const WA_NUMBER  = '18492763532'
const WA_MESSAGE = encodeURIComponent('¡Hola! Vi el anuncio de Pelo Piel y Uñas Nutrilite y quiero más información 💇‍♀️')
const WA_URL     = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`

function trackWA() {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'Contact')
}

function Star() {
  return (
    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function Stars({ n = 5 }) {
  return <span className="flex gap-0.5">{[...Array(n)].map((_, i) => <Star key={i} />)}</span>
}

function StockCounter() {
  const [count, setCount] = useState(7)
  useEffect(() => {
    const id = setTimeout(() => setCount(5), 8000)
    return () => clearTimeout(id)
  }, [])
  return (
    <m.div
      key={count}
      initial={{ scale: 1.2 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full"
    >
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      Solo {count} unidades disponibles
    </m.div>
  )
}

function CTAButton({ texto = '📲 Quiero el mío ahora', full = true, dark = false }) {
  return (
    <m.a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={trackWA}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={[
        full ? 'w-full' : 'inline-flex',
        'flex items-center justify-center gap-3',
        dark
          ? 'bg-white text-green-700 hover:bg-green-50'
          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
        'font-extrabold text-lg sm:text-xl py-5 px-8 rounded-2xl',
        'shadow-[0_8px_30px_rgba(34,197,94,0.45)] transition-all duration-200',
      ].join(' ')}
    >
      <svg className="w-6 h-6 flex-shrink-0 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {texto}
    </m.a>
  )
}

function StickyBar() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl px-4 py-3"
        >
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <img src="/Pelo_-Piel-y-Uñas-Nutrilite.webp" alt="" className="w-10 h-10 object-contain" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-xs truncate">Pelo Piel y Uñas Nutrilite™</div>
              <div className="text-green-600 font-extrabold text-sm">RD$1,700</div>
            </div>
            <m.a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackWA}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg"
            >
              📲 Pedir ahora
            </m.a>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

const BEFORE = [
  'Cabello que se cae al peinar',
  'Puntas abiertas y sin brillo',
  'Uñas que se quiebran y pelan',
  'Piel opaca y sin vida',
  'Shampoos que no funcionan',
]
const AFTER = [
  'Cabello fuerte y abundante',
  'Brillo y suavidad notables',
  'Uñas largas y resistentes',
  'Piel luminosa y suave',
  'Nutrición real desde adentro',
]

const TESTIMONIALS = [
  {
    foto: '/Luisa-Rodriguez.webp',
    nombre: 'Luisa R.',
    ciudad: 'Santo Domingo',
    estrellas: 5,
    semanas: '5 semanas',
    texto: 'Empecé a tomarlo por la caída del cabello y en menos de un mes ya veía menos pelos en el cepillo. Ahora mi cabello tiene un brillo que no tenía antes. Vale cada peso.',
  },
  {
    foto: '/Maria-Fernandez.webp',
    nombre: 'María F.',
    ciudad: 'Santiago',
    estrellas: 5,
    semanas: '6 semanas',
    texto: 'Mis uñas siempre se quebraban, ya era costumbre. Con esto en 3 semanas dejaron de quebrarse y ahora las tengo largas por primera vez en mi vida. Quedé enamorada.',
  },
  {
    foto: '/patricia-gomez.webp',
    nombre: 'Patricia G.',
    ciudad: 'La Romana',
    estrellas: 5,
    semanas: '8 semanas',
    texto: 'No creía mucho pero lo probé y me sorprendió. La piel se me ve diferente — más fresca, más luminosa. Mi esposo hasta me preguntó qué estaba haciendo diferente.',
  },
]

const INGREDIENTES = [
  { emoji: '💊', nombre: 'Biotina',     color: 'from-pink-400 to-rose-500',     texto: 'El nutriente #1 para el cabello. Reduce la caída y fortalece cada hebra desde la raíz.' },
  { emoji: '🔩', nombre: 'Zinc',        color: 'from-violet-400 to-purple-500', texto: 'Regula el cuero cabelludo, apoya el crecimiento y mantiene la salud de la dermis.' },
  { emoji: '✨', nombre: 'Colágeno',    color: 'from-fuchsia-400 to-pink-500',  texto: 'Mejora la elasticidad y tersura de la piel. Las uñas crecen más fuertes y duras.' },
  { emoji: '🍊', nombre: 'Vitamina C',  color: 'from-orange-400 to-amber-500',  texto: 'Antioxidante que activa la síntesis de colágeno. Piel más joven y brillante.' },
]

const TIMELINE = [
  { tiempo: 'Semana 1',   icono: '🌱', titulo: 'El cuerpo empieza a absorber',   texto: 'Los nutrientes llegan al folículo capilar. Las uñas ya no se quiebran tan fácil.' },
  { tiempo: 'Semana 2–3', icono: '🌿', titulo: 'Primeros cambios visibles',       texto: 'Menos cabello en la ducha. La piel se siente más hidratada y suave.' },
  { tiempo: 'Semana 4–5', icono: '🌸', titulo: 'Tu cabello cambia de textura',    texto: 'Brillo, suavidad y menos frizz. Las uñas crecen visiblemente más fuertes.' },
  { tiempo: 'Semana 6–8', icono: '🌺', titulo: 'Transformación completa',         texto: 'Cabello abundante, piel luminosa, uñas largas. La versión que siempre quisiste.' },
]

export default function LandingPeloPiel() {
  useEffect(() => {
    document.title = 'Pelo Piel y Uñas Nutrilite™ — Belleza desde adentro | VitaGloss RD'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', 'El suplemento de biotina, zinc y colágeno para cabello que se cae, piel opaca y uñas frágiles. Distribuidores Amway certificados. Envío a domicilio en RD.')
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <StickyBar />

      {/* BANNER */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-center py-2.5 text-sm font-semibold">
        🇩🇴 &nbsp;Distribuidores Certificados Amway en República Dominicana
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-5 pt-10 pb-16">
        <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-pink-200 rounded-full opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl" />
        <div className="relative max-w-lg mx-auto">
          <m.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 justify-center mb-5">
            <span className="bg-white border border-pink-200 text-pink-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">🏅 Amway Certificado</span>
            <span className="bg-white border border-purple-200 text-purple-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">⭐ 5.0 · 86 reseñas</span>
            <span className="bg-white border border-green-200 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">🛵 Envío a domicilio</span>
          </m.div>

          <m.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-center text-gray-900 leading-tight mb-4">
            Tu cabello merece
            <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              renacer desde adentro
            </span>
          </m.h1>

          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-center text-gray-600 text-lg mb-6 leading-relaxed">
            El suplemento con <strong>biotina, zinc y colágeno</strong> que hace crecer tu cabello,
            ilumina tu piel y endurece tus uñas — nutrición Nutrilite™ desde adentro.
          </m.p>

          <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="relative flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-3xl opacity-40 scale-75" />
              <img
                src="/Pelo_-Piel-y-Uñas-Nutrilite.webp"
                alt="Pelo Piel y Uñas Nutrilite"
                className="relative w-64 h-64 object-contain drop-shadow-[0_20px_40px_rgba(236,72,153,0.35)]"
                loading="eager"
              />
              <div className="absolute -top-2 -right-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-extrabold text-lg px-4 py-2 rounded-2xl shadow-lg rotate-3">
                RD$1,700
              </div>
            </div>
          </m.div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-6">
            <div className="flex -space-x-2">
              {['/Luisa-Rodriguez.webp', '/Maria-Fernandez.webp', '/patricia-gomez.webp'].map((src, i) => (
                <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div>
              <Stars n={5} />
              <p className="text-xs text-gray-500">+86 mujeres ya lo probaron</p>
            </div>
          </m.div>

          <div className="flex justify-center mb-5"><StockCounter /></div>

          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <CTAButton />
          </m.div>
          <p className="text-center text-xs text-gray-400 mt-3">Sin compromisos · Vita te atiende en segundos 💬</p>
        </div>
      </section>

      {/* ANTES / DESPUÉS */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-lg mx-auto">
          <m.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-2">
            ¿Te suena familiar?
          </m.h2>
          <p className="text-center text-gray-500 text-sm mb-10">Muchas mujeres viven así — sin saber que tiene solución</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="bg-red-500 text-white text-center font-bold text-sm py-2 rounded-t-2xl">😔 Antes</div>
              <div className="bg-red-50 border border-red-100 rounded-b-2xl divide-y divide-red-100">
                {BEFORE.map((item, i) => (
                  <m.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2 px-3 py-3 text-xs text-gray-700">
                    <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">✗</span>{item}
                  </m.div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center font-bold text-sm py-2 rounded-t-2xl">✨ Con Nutrilite™</div>
              <div className="bg-gradient-to-b from-pink-50 to-purple-50 border border-pink-100 rounded-b-2xl divide-y divide-pink-100">
                {AFTER.map((item, i) => (
                  <m.div key={i} initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-2 px-3 py-3 text-xs text-gray-700">
                    <span className="text-pink-500 font-bold mt-0.5 flex-shrink-0">✓</span>{item}
                  </m.div>
                ))}
              </div>
            </div>
          </div>
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
            <CTAButton texto="📲 Lo quiero — escríbenos ahora" />
          </m.div>
        </div>
      </section>

      {/* INGREDIENTES */}
      <section className="px-5 py-14 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div className="max-w-lg mx-auto">
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">4 ingredientes, 1 fórmula poderosa</h2>
            <p className="text-gray-500 text-sm">Nutrición certificada Nutrilite™ — base 100% vegetal</p>
          </m.div>
          <div className="grid grid-cols-2 gap-4">
            {INGREDIENTES.map((ing, i) => (
              <m.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-md shadow-pink-100 border border-pink-50 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ing.color} flex items-center justify-center text-2xl mb-3 shadow-md`}>
                  {ing.emoji}
                </div>
                <div className="font-extrabold text-gray-800 text-sm mb-1.5">{ing.nombre}</div>
                <div className="text-gray-500 text-xs leading-snug">{ing.texto}</div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-5 py-14 bg-white">
        <div className="max-w-lg mx-auto">
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Tu transformación semana a semana</h2>
            <p className="text-gray-500 text-sm">Resultados reales — no milagros, pura nutrición inteligente</p>
          </m.div>
          <div className="relative pl-8 border-l-2 border-pink-200 space-y-8">
            {TIMELINE.map((step, i) => (
              <m.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="relative">
                <div className="absolute -left-[2.65rem] w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center text-base shadow-md">
                  {step.icono}
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-wide">{step.tiempo}</span>
                  <h3 className="font-extrabold text-gray-800 text-sm mt-0.5 mb-1">{step.titulo}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{step.texto}</p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOSS */}
      <section className="px-5 py-14 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-lg mx-auto">
          <m.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Ellas ya lo probaron</h2>
            <p className="text-gray-500 text-sm">Resultados reales de mujeres dominicanas</p>
            <div className="flex items-center justify-center gap-1 mt-3">
              <Stars n={5} />
              <span className="font-bold text-gray-800 ml-1">5.0</span>
              <span className="text-gray-400 text-sm">· 86 reseñas verificadas</span>
            </div>
          </m.div>
          <div className="space-y-5">
            {TESTIMONIALS.map((t, i) => (
              <m.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-md shadow-pink-100 border border-pink-50">
                <div className="flex items-start gap-4 mb-3">
                  <img src={t.foto} alt={t.nombre} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
                  <div>
                    <div className="font-extrabold text-gray-900 text-sm">{t.nombre}</div>
                    <div className="text-xs text-gray-400 mb-1">{t.ciudad} · Uso: {t.semanas}</div>
                    <Stars n={t.estrellas} />
                  </div>
                </div>
                <div className="bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
                  <p className="text-gray-700 text-sm leading-relaxed italic">"{t.texto}"</p>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-400">Compra verificada</span>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / ENVÍO */}
      <section className="px-5 py-12 bg-white">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🏅', label: 'Amway',    sub: 'Distribuidor certificado' },
              { icon: '🛡️', label: '30 días',  sub: 'Garantía de devolución' },
              { icon: '🇩🇴', label: 'Local',   sub: 'Empresa dominicana' },
            ].map((item, i) => (
              <m.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="text-3xl mb-1">{item.icon}</div>
                <div className="font-extrabold text-gray-800 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500">{item.sub}</div>
              </m.div>
            ))}
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
            <h3 className="font-extrabold text-green-800 text-base mb-3 flex items-center gap-2">🚚 ¿Cómo lo recibo?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 mt-0.5">SD</span>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Santo Domingo</div>
                  <div className="text-gray-600 text-xs">Entrega a domicilio · Pagas cuando lo recibes en mano 🛵</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 mt-0.5">INT</span>
                <div>
                  <div className="font-bold text-gray-800 text-sm">Interior del país</div>
                  <div className="text-gray-600 text-xs">CaribeaPack · Llega en 1–3 días · RD$250 de envío</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-5 py-16 bg-gradient-to-br from-pink-600 via-rose-600 to-purple-700 relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-56 h-56 bg-white opacity-5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative max-w-lg mx-auto text-center text-white">
          <m.img
            src="/Pelo_-Piel-y-Uñas-Nutrilite.webp"
            alt="Pelo Piel y Uñas Nutrilite"
            className="w-40 h-40 object-contain mx-auto mb-6 drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
              Empieza tu transformación<br/>
              <span className="text-pink-200">hoy mismo</span>
            </h2>
            <p className="text-pink-100 text-lg mb-2">Solo <strong className="text-white text-2xl">RD$1,700</strong></p>
            <p className="text-pink-200 text-sm mb-8">Santo Domingo: pagas cuando lo tienes en mano 🛵</p>
            <CTAButton texto="📲 Pedir ahora por WhatsApp" />
            <div className="mt-5 flex items-center justify-center gap-6 text-pink-200 text-xs">
              <span>🔒 100% seguro</span>
              <span>💬 Respuesta inmediata</span>
              <span>⭐ 5.0 estrellas</span>
            </div>
          </m.div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="bg-gray-950 text-gray-500 text-center py-5 text-xs px-4">
        © 2026 VitaGloss RD — Distribuidores certificados Amway en República Dominicana ·{' '}
        <a href="/privacidad" className="underline hover:text-gray-300 transition-colors">Privacidad</a>
        {' '}·{' '}
        <a href="/catalogo" className="underline hover:text-gray-300 transition-colors">Ver catálogo</a>
      </div>
      <div className="h-16" />
    </div>
  )
}