import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productos } from '../data/productos'
import ProductoCard from '../components/ProductoCard'
import { useSEO } from '../hooks/useSEO'

const WA_URL = 'https://wa.me/18492763532?text=Hola!%20Quiero%20orientaci%C3%B3n%20para%20elegir%20un%20producto%20en%20VitaGloss%20RD'

const heroSlides = [
  {
    eyebrow: 'Cuidado bucal diario',
    title: 'Tu rutina bucal,',
    accent: 'mejor orientada.',
    description: 'Conoce una opción de limpieza diaria y revisa sus instrucciones antes de elegir.',
    image: '/124106SP-690px-01.webp',
    image400: '/124106SP-400w.webp',
    imageAlt: 'Pasta Dental Glister',
    href: '/producto/pasta-dental-glister',
    cta: 'Conocer la pasta dental',
  },
  {
    eyebrow: 'Nutrición y bienestar',
    title: 'Complementa tu alimentación,',
    accent: 'con información clara.',
    description: 'Revisa la presentación, los ingredientes y el uso indicado de Vitamina C Nutrilite™.',
    image: '/109741CO-690px-01.webp',
    image400: '/109741CO-400w.webp',
    imageAlt: 'Vitamina C Nutrilite',
    href: '/producto/vitamina-c-nutrilite',
    cta: 'Conocer la vitamina C',
  },
  {
    eyebrow: 'Frescura portátil',
    title: 'Cuidado bucal,',
    accent: 'donde lo necesites.',
    description: 'Descubre una presentación compacta para complementar tu rutina de higiene bucal.',
    image: '/124111-690px-01.webp',
    image400: '/124111-400w.webp',
    imageAlt: 'Spray Bucal Glister',
    href: '/producto/spray-bucal-glister',
    cta: 'Conocer el spray bucal',
  },
]

const categories = [
  { name: 'Salud bucal', description: 'Cuidado diario para una rutina completa.', image: '/124106SP-690px-01.webp', href: '/catalogo?categoria=Salud%20Bucal', tone: 'from-cyan-50 to-blue-50' },
  { name: 'Vitaminas y suplementos', description: 'Opciones para complementar tu bienestar.', image: '/109741CO-690px-01.webp', href: '/catalogo?categoria=Vitaminas', tone: 'from-lime-50 to-emerald-50' },
  { name: 'Rutinas y combos', description: 'Selecciones prácticas para comprar en conjunto.', image: '/Solución de envejecimiento saludable KITS.png', href: '/combos', tone: 'from-amber-50 to-orange-50' },
]

function Icon({ name, className = 'w-5 h-5' }) {
  const paths = {
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l7 3v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3zm-3 9l2 2 4-4" />,
    truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 6h11v10H3V6zm11 4h4l3 3v3h-7v-6zM6 19a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z" />,
    chat: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 18l-2 3 5-2a9 9 0 10-3-1z" />,
    return: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 8h11a5 5 0 010 10H9M4 8l4-4M4 8l4 4" />,
    arrow: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-5-5l5 5-5 5" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l4 4L19 6" />,
  }
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)

  useEffect(() => {
    if (carouselPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = window.setInterval(
      () => setActiveSlide(current => (current + 1) % heroSlides.length),
      7000,
    )
    return () => window.clearInterval(timer)
  }, [carouselPaused])

  useSEO({
    title: 'Productos de bienestar y cuidado personal en República Dominicana',
    description: 'Explora productos de salud bucal, vitaminas y bienestar con orientación personalizada y entrega en República Dominicana.',
    canonical: 'https://www.vitaglossrd.com',
    ogImage: 'https://www.vitaglossrd.com/salud-bucal.jpg',
  })

  const featured = productos.slice(0, 4)
  const slide = heroSlides[activeSlide]

  const selectSlide = index => {
    setActiveSlide((index + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="bg-white">
      <section
        className="relative overflow-hidden bg-[#07192f] pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24"
        aria-roledescription="carrusel"
        aria-label="Productos destacados"
        onMouseEnter={() => setCarouselPaused(true)}
        onMouseLeave={() => setCarouselPaused(false)}
        onFocusCapture={() => setCarouselPaused(true)}
        onBlurCapture={() => setCarouselPaused(false)}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_40%,rgba(46,196,182,.22),transparent_34%)]" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.05fr_.95fr] items-center gap-12 lg:gap-6">
          <div key={`copy-${slide.href}`} className="max-w-2xl" aria-live="polite" aria-atomic="true">
            <p className="text-secondary text-xs sm:text-sm font-bold uppercase tracking-[.22em] mb-5">{slide.eyebrow}</p>
            <h1 className="text-white text-4xl sm:text-6xl lg:text-7xl font-black tracking-[-.045em] leading-[1.02] mb-6">{slide.title} <span className="text-secondary">{slide.accent}</span></h1>
            <p className="text-white/70 text-base sm:text-xl leading-relaxed max-w-xl mb-9">{slide.description}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={slide.href} className="inline-flex items-center justify-center gap-3 bg-secondary hover:bg-[#22b5a8] text-[#07192f] font-extrabold px-7 py-4 rounded-xl transition-colors">{slide.cta} <Icon name="arrow" /></Link>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 border border-white/25 hover:border-white/50 hover:bg-white/5 text-white font-bold px-7 py-4 rounded-xl transition-colors">Recibir orientación</a>
            </div>
            <p className="mt-6 text-white/45 text-sm">Atención de un Empresario Independiente de Amway en República Dominicana.</p>
          </div>
          <div className="relative min-h-[360px] sm:min-h-[470px] flex items-center justify-center">
            <div className="absolute w-[330px] h-[330px] sm:w-[450px] sm:h-[450px] rounded-full border border-secondary/30 bg-secondary/5" />
            <div className="absolute w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] rounded-full bg-secondary/10 blur-2xl" />
            <img key={slide.image} src={slide.image} srcSet={`${slide.image400} 400w, ${slide.image} 690w`} sizes="(max-width: 640px) 260px, 410px" alt={slide.imageAlt} width="420" height="520" loading={activeSlide === 0 ? 'eager' : 'lazy'} fetchPriority={activeSlide === 0 ? 'high' : 'auto'} decoding="async" className="relative z-10 w-auto h-[310px] sm:h-[440px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,.35)]" />

            <div className="absolute z-20 inset-x-0 bottom-0 flex items-center justify-center gap-3" aria-label="Seleccionar producto destacado">
              <button type="button" onClick={() => selectSlide(activeSlide - 1)} className="w-10 h-10 rounded-full border border-white/25 bg-[#07192f]/80 text-white hover:border-secondary hover:text-secondary transition-colors" aria-label="Producto anterior">‹</button>
              <div className="flex gap-2">
                {heroSlides.map((item, index) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => selectSlide(index)}
                    aria-label={`Mostrar ${item.imageAlt}`}
                    aria-current={index === activeSlide ? 'true' : undefined}
                    className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-8 bg-secondary' : 'w-2.5 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => selectSlide(activeSlide + 1)} className="w-10 h-10 rounded-full border border-white/25 bg-[#07192f]/80 text-white hover:border-secondary hover:text-secondary transition-colors" aria-label="Producto siguiente">›</button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            ['shield', 'Productos originales', 'Procedencia verificada'],
            ['truck', 'Entrega nacional', 'Coordinación en todo RD'],
            ['chat', 'Atención personal', 'Orientación por WhatsApp'],
            ['return', 'Garantía', 'Políticas claras de devolución'],
          ].map(([icon, title, text]) => <div key={title} className="flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0"><Icon name={icon} /></span><div><p className="font-extrabold text-primary text-sm">{title}</p><p className="text-gray-400 text-xs mt-0.5">{text}</p></div></div>)}
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"><div><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-3">Compra por necesidad</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary">Encuentra tu categoría</h2></div><Link to="/catalogo" className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">Ver catálogo completo <Icon name="arrow" /></Link></div>
          <div className="grid md:grid-cols-3 gap-5">
            {categories.map(category => <Link key={category.name} to={category.href} className={`group relative overflow-hidden min-h-[320px] rounded-[28px] bg-gradient-to-br ${category.tone} border border-white shadow-sm hover:shadow-xl transition-all`}><div className="relative z-10 p-7 max-w-[68%]"><h3 className="text-xl sm:text-2xl font-black text-primary mb-2">{category.name}</h3><p className="text-gray-500 text-sm leading-relaxed">{category.description}</p></div><img src={category.image} alt="" loading="lazy" className="absolute right-[-18px] bottom-[-5px] w-[58%] h-[70%] object-contain group-hover:scale-105 transition-transform duration-500" /><span className="absolute left-7 bottom-7 w-11 h-11 rounded-full bg-white text-primary flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors"><Icon name="arrow" /></span></Link>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12"><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-3">Selección VitaGloss RD</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary mb-4">Los favoritos para comenzar</h2><p className="text-gray-500 leading-relaxed">Explora una selección corta y consulta disponibilidad, precio y forma de entrega de manera privada.</p></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{featured.map(product => <ProductoCard key={product.id} producto={product} />)}</div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-4">Una compra con acompañamiento</p><h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-6">Más claridad antes de elegir.</h2><p className="text-white/65 text-lg leading-relaxed mb-9">Nuestro enfoque es ayudarte a comparar opciones, entender el uso previsto de cada producto y coordinar tu pedido sin presión.</p><a href={WA_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white text-primary font-extrabold px-7 py-4 rounded-xl hover:bg-secondary transition-colors">Hablar con un asesor <Icon name="arrow" /></a></div>
          <div className="grid gap-4">
            {[
              ['Información clara', 'Detalles del producto organizados para que puedas revisar antes de consultar.'],
              ['Atención local', 'Coordinación directa y seguimiento desde República Dominicana.'],
              ['Compra a tu ritmo', 'Consulta disponibilidad y precio de forma privada, sin presión.'],
            ].map(([title, text]) => <div key={title} className="flex gap-4 p-5 sm:p-6 rounded-2xl bg-white/[.06] border border-white/10"><span className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center flex-shrink-0"><Icon name="check" /></span><div><h3 className="font-extrabold text-lg mb-1">{title}</h3><p className="text-white/55 text-sm leading-relaxed">{text}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.2fr_.8fr] gap-8">
          <div className="rounded-[32px] bg-white border border-gray-100 p-8 sm:p-12"><p className="text-secondary text-xs font-bold uppercase tracking-[.2em] mb-4">Aprende antes de comprar</p><h2 className="text-3xl sm:text-4xl font-black text-primary tracking-tight mb-4">Guías prácticas para cuidar mejor tu rutina.</h2><p className="text-gray-500 leading-relaxed max-w-xl mb-8">Contenido editorial sobre cuidado bucal, nutrición y hábitos de bienestar para ayudarte a formular mejores preguntas.</p><Link to="/blog" className="inline-flex items-center gap-2 text-primary font-extrabold hover:text-secondary transition-colors">Explorar el blog <Icon name="arrow" /></Link></div>
          <div className="rounded-[32px] bg-secondary p-8 sm:p-10 flex flex-col justify-between"><div><p className="text-primary/60 text-xs font-bold uppercase tracking-[.2em] mb-4">Oportunidad Amway</p><h2 className="text-3xl font-black text-primary tracking-tight mb-4">¿Te interesa desarrollar un negocio independiente?</h2><p className="text-primary/70 leading-relaxed">Conoce cómo funciona la venta directa, el acompañamiento disponible y las responsabilidades de comenzar.</p></div><Link to="/equipo" className="mt-8 inline-flex items-center gap-2 text-primary font-extrabold">Conocer la oportunidad <Icon name="arrow" /></Link></div>
        </div>
      </section>
    </div>
  )
}
