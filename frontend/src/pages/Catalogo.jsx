import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { productos } from '../data/productos'
import ProductoCard from '../components/ProductoCard'
import { useSEO } from '../hooks/useSEO'

const categorias = [
  { label: 'Todos' },
  { label: 'Salud Bucal' },
  { label: 'Vitaminas' },
  { label: 'Energizantes' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' }
  })
}

export default function Catalogo() {
  useSEO({
    title: 'Catálogo de Productos',
    description: 'Explora los productos Amway originales en VitaGloss RD: Pasta Dental Glister™, Vitamina C Nutrilite™, Spray y Enjuague Bucal. Envío a todo RD.',
  })
  const [searchParams] = useSearchParams()
  const categoriaInicial = searchParams.get('categoria')
  const [categoriaActiva, setCategoriaActiva] = useState(categorias.some(c => c.label === categoriaInicial) ? categoriaInicial : 'Todos')
  const [busqueda, setBusqueda] = useState('')

  const productosFiltrados = productos.filter(p => {
    const coincideCategoria = categoriaActiva === 'Todos' || p.categoria === categoriaActiva
    const q = busqueda.toLowerCase().trim()
    const coincideBusqueda = !q ||
      p.nombre.toLowerCase().includes(q) ||
      p.nombreCorto.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      (p.articulo && p.articulo.toLowerCase().includes(q))
    return coincideCategoria && coincideBusqueda
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary via-blue-800 to-blue-900 text-white pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <Motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-secondary/20 text-secondary border border-secondary/30 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest mb-4"
          >
            Empresario Independiente de Amway
          </Motion.span>
          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black mb-4"
          >
            Nuestro Catálogo
          </Motion.h1>
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-xl mx-auto"
          >
            Productos Amway originales para tu salud bucal y bienestar. Con envío a domicilio en toda República Dominicana.
          </Motion.p>
        </div>
      </div>

      {/* Filtros sticky */}
      <div className="sticky top-16 sm:top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Filtros por categoría */}
          <div className="flex gap-3 overflow-x-auto flex-1" style={{ scrollbarWidth: 'none' }}>
            {categorias.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategoriaActiva(cat.label)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  categoriaActiva === cat.label
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${categoriaActiva === cat.label ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {cat.label === 'Todos' ? productos.length : productos.filter(p => p.categoria === cat.label).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <Motion.div
            key={categoriaActiva}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {productosFiltrados.map((p, i) => (
              <Motion.div
                key={p.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <ProductoCard producto={p} />
              </Motion.div>
            ))}
          </Motion.div>
        </AnimatePresence>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <svg className="w-14 h-14 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-xl font-semibold">
              {busqueda ? `No encontramos “${busqueda}” en el catálogo.` : 'No hay productos en esta categoría aún.'}
            </p>
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="mt-4 text-primary underline text-sm">Limpiar búsqueda</button>
            )}
          </div>
        )}
      </div>

      {/* Acceso al catálogo oficial */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-[#173f73] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl shadow-primary/20"
        >
          <div>
            <h3 className="text-2xl font-black mb-1">Explora el catálogo completo</h3>
            <p className="text-blue-100">Los seis favoritos son una selección. En MyShop puedes buscar los demás productos disponibles en Amway.</p>
            <p className="text-blue-200 text-sm mt-2">El precio inicial corresponde al producto; impuestos, entrega y total final se calculan durante el checkout.</p>
          </div>
          <a
            href="https://www.amway.com.do/myshop/vitaglossrd"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary text-primary hover:bg-[#38d4ca] px-8 py-4 rounded-2xl font-bold transition-all duration-200 hover:scale-105 shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            Abrir MyShop
          </a>
        </Motion.div>
      </div>
    </div>
  )
}
