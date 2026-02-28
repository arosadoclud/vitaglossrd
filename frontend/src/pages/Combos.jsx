import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const combos = [
  {
    id: 'kit-glister-completo',
    categoria: 'Bucal',
    nombre: 'Kit Glister™ Completo',
    subtitulo: 'El sistema completo de higiene bucal',
    descripcion: 'Los 3 productos Glister™ para una rutina bucal perfecta de mañana a noche. Limpieza profunda, protección total y frescura instantánea donde vayas.',
    badge: '🔥 Más Popular',
    badgeColor: 'bg-orange-500',
    productos: [
      { nombre: 'Pasta Dental Glister™', cantidad: '1 unidad (200g)', img: '/124106SP-690px-01.jpg', precio: 899 },
      { nombre: 'Enjuague Bucal Glister™', cantidad: '1 botella (72ml)', img: '/124108-690px-01.jpg', precio: 1169 },
      { nombre: 'Spray Bucal Glister™', cantidad: '1 envase (14ml)', img: '/124111-690px-01.jpg', precio: 820 },
    ],
    precioNormal: 2888,
    precioCombo: 2590,
    ahorro: 298,
    color: 'from-blue-600 to-blue-800',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Glister™ Completo* (Pasta + Enjuague + Spray).\n\n💰 Precio combo: RD$2,590\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-inmunidad-total',
    categoria: 'Inmunidad',
    nombre: 'Kit Inmunidad Total',
    subtitulo: 'Protección completa para tu sistema inmune',
    descripcion: 'La combinación ideal para reforzar tus defensas: Vitamina C antioxidante, Vitamina D para la función inmune y Zinc para protegerte de enfermedades. Protección 360°.',
    badge: '🛡️ Protección Total',
    badgeColor: 'bg-emerald-600',
    productos: [
      { nombre: 'Vitamina C Nutrilite™', cantidad: '60 comprimidos', img: '/109741CO-690px-01.png', precio: 1099 },
      { nombre: 'Vitamina D Nutrilite™', cantidad: '180 comprimidos', img: '/Nutrilite™ Vitamina D.jpg', precio: 1245 },
      { nombre: 'Defensa Zinc Nutrilite™', cantidad: '60 pastillas', img: '/Nutrilite Defensa inmunológica Zinc+albahaca sagrada.jpg', precio: 699 },
    ],
    precioNormal: 3043,
    precioCombo: 2690,
    ahorro: 353,
    color: 'from-emerald-500 to-teal-700',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Inmunidad Total* (Vitamina C + Vitamina D + Zinc).\n\n💰 Precio combo: RD$2,690\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-energia-vitalidad',
    categoria: 'Energía',
    nombre: 'Kit Energía y Vitalidad',
    subtitulo: 'Máxima energía para tu día a día',
    descripcion: 'Double X con 12 vitaminas esenciales, Vitamina B para el metabolismo energético y Omega 3 para la función cerebral y cardiovascular. Siente la diferencia desde la primera semana.',
    badge: '⚡ Más Energía',
    badgeColor: 'bg-yellow-500',
    productos: [
      { nombre: 'Double X Nutrilite™ 10 días', cantidad: '60 comprimidos', img: '/Multivitamina Double X de Nutrilite – Suministro para 10 días.jpg', precio: 1640 },
      { nombre: 'Vitamina B Doble Acción', cantidad: '60 comprimidos', img: '/Nutrilite™ Vitamina B de acción doble.jpg', precio: 749 },
      { nombre: 'Omega Nutrilite™', cantidad: '120 cápsulas', img: '/Omega Nutrilite.jpg', precio: 1640 },
    ],
    precioNormal: 4029,
    precioCombo: 3590,
    ahorro: 439,
    color: 'from-yellow-500 to-orange-600',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Energía y Vitalidad* (Double X + Vitamina B + Omega).\n\n💰 Precio combo: RD$3,590\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-figura-saludable',
    categoria: 'Figura',
    nombre: 'Kit Figura Saludable',
    subtitulo: 'Tu aliado para el control de peso',
    descripcion: 'Slimmetry para apoyar la reducción de grasa, Proteína Vegetal para mantener masa muscular y Fibra en Polvo para mejorar la digestión y controlar el apetito. El trío perfecto.',
    badge: '💪 Control de Peso',
    badgeColor: 'bg-pink-500',
    productos: [
      { nombre: 'Slimmetry Nutrilite™', cantidad: '60 tabletas', img: '/Nutrilite Suplemento nutricional Slimmetry Ideal para bajar de peso.jpg', precio: 2114 },
      { nombre: 'Proteína Vegetal Nutrilite™', cantidad: 'En polvo', img: '/Proteína vegetal en polvo Nutrilite.jpg', precio: 1449 },
      { nombre: 'Fibra en Polvo Nutrilite™', cantidad: 'En polvo', img: '/Nutrilite Fibra en polvo.jpg', precio: 849 },
    ],
    precioNormal: 4412,
    precioCombo: 3990,
    ahorro: 422,
    color: 'from-pink-500 to-rose-700',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Figura Saludable* (Slimmetry + Proteína Vegetal + Fibra).\n\n💰 Precio combo: RD$3,990\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-belleza-total',
    categoria: 'Belleza',
    nombre: 'Kit Belleza Total',
    subtitulo: 'Brilla desde adentro hacia afuera',
    descripcion: 'Pelo, Piel y Uñas con biotina y colágeno, Vitamina E antioxidante para la piel y Vitamina C para la síntesis de colágeno. La rutina de belleza interna que transforma tu look.',
    badge: '✨ Belleza Interior',
    badgeColor: 'bg-purple-500',
    productos: [
      { nombre: 'Pelo Piel y Uñas Nutrilite™', cantidad: '60 comprimidos', img: '/Pelo, Piel y Uñas Nutrilite.jpg', precio: 1519 },
      { nombre: 'Vitamina E Masticable', cantidad: '90 tabletas', img: '/Nutrilite Vitamina E masticable.jpg', precio: 2825 },
      { nombre: 'Vitamina C Nutrilite™', cantidad: '60 comprimidos', img: '/109741CO-690px-01.png', precio: 1099 },
    ],
    precioNormal: 5443,
    precioCombo: 4890,
    ahorro: 553,
    color: 'from-purple-500 to-indigo-700',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Belleza Total* (Pelo Piel y Uñas + Vitamina E + Vitamina C).\n\n💰 Precio combo: RD$4,890\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-huesos-articulaciones',
    categoria: 'Articulaciones',
    nombre: 'Kit Huesos y Articulaciones',
    subtitulo: 'Fortalece huesos, músculos y articulaciones',
    descripcion: 'Cal Mag D para la densidad ósea, Glucosamina para la salud articular y Vitamina D para la absorción de calcio. Ideal para personas activas y adultos mayores de 40 años.',
    badge: '🦴 Movilidad Activa',
    badgeColor: 'bg-cyan-600',
    productos: [
      { nombre: 'Cal Mag D Nutrilite™', cantidad: '180 comprimidos', img: '/Nutrilite Cal Mag D.jpg', precio: 948 },
      { nombre: 'Glucosamina Nutrilite™', cantidad: '30 días', img: '/Nutrilite™ Glucosamina – Suministro para 30 días Articulaciones.jpg', precio: 2369 },
      { nombre: 'Vitamina D Nutrilite™', cantidad: '180 comprimidos', img: '/Nutrilite™ Vitamina D.jpg', precio: 1245 },
    ],
    precioNormal: 4562,
    precioCombo: 4090,
    ahorro: 472,
    color: 'from-cyan-500 to-blue-700',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Huesos y Articulaciones* (Cal Mag D + Glucosamina + Vitamina D).\n\n💰 Precio combo: RD$4,090\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
  {
    id: 'kit-bienestar-familiar',
    categoria: 'Familia',
    nombre: 'Kit Bienestar Familiar',
    subtitulo: 'Para toda la familia en un solo pedido',
    descripcion: 'La Pasta Dental Glister™ para la higiene bucal de toda la casa, Vitamina C para los adultos y el Multivitamínico Infantil para que los niños crezcan fuertes y saludables.',
    badge: '👨‍👩‍👧 Para toda la familia',
    badgeColor: 'bg-green-600',
    productos: [
      { nombre: 'Pasta Dental Glister™', cantidad: '1 unidad (200g)', img: '/124106SP-690px-01.jpg', precio: 899 },
      { nombre: 'Vitamina C Nutrilite™', cantidad: '60 comprimidos', img: '/109741CO-690px-01.png', precio: 1099 },
      { nombre: 'Multivitamínico Niños', cantidad: '120 tabletas', img: '/Multivitamínico diario para niños Nutrilite.jpg', precio: 1094 },
    ],
    precioNormal: 3092,
    precioCombo: 2750,
    ahorro: 342,
    color: 'from-green-500 to-emerald-700',
    whatsappMsg: encodeURIComponent('Hola VitaGloss RD! 👋 Quiero pedir el *Kit Bienestar Familiar* (Glister + Vitamina C + Multivitamínico Niños).\n\n💰 Precio combo: RD$2,750\n\n¿Cómo hago el pedido? ¡Gracias!'),
  },
]

const categorias = ['Todos', 'Bucal', 'Inmunidad', 'Energía', 'Figura', 'Belleza', 'Articulaciones', 'Familia']

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } }),
}

export default function Combos() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos')
  const combosFiltrados = categoriaActiva === 'Todos' ? combos : combos.filter(c => c.categoria === categoriaActiva)
  const maxAhorro = Math.max(...combos.map(c => c.ahorro))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-blue-800 to-secondary pt-24 sm:pt-32 pb-10 sm:pb-14 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-wider uppercase"
          >
            Ofertas exclusivas
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
          >
            Kits & Combos Inteligentes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-xl mx-auto"
          >
            Productos seleccionados por objetivo de salud. Ahorra más comprando el kit completo.
          </motion.p>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-8 mt-8"
          >
            <div className="text-center">
              <p className="text-2xl font-black">{combos.length}</p>
              <p className="text-white/70 text-xs uppercase tracking-wide">Kits disponibles</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">RD${maxAhorro.toLocaleString()}</p>
              <p className="text-white/70 text-xs uppercase tracking-wide">Ahorro máximo</p>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black">100%</p>
              <p className="text-white/70 text-xs uppercase tracking-wide">Productos Amway</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Banner de ahorro */}
      <div className="bg-secondary text-white text-center py-3 text-sm font-semibold tracking-wide">
        💰 Ahorra hasta <strong>RD${maxAhorro.toLocaleString()}</strong> comprando en kit · Envío a todo el país
      </div>

      {/* Filtros por categoría */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                categoriaActiva === cat
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Combos grid */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {combosFiltrados.map((combo, i) => (
            <motion.div
              key={combo.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Header del combo */}
              <div className={`bg-gradient-to-r ${combo.color} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-block ${combo.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {combo.badge}
                    </span>
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {combo.categoria}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mb-1">{combo.nombre}</h2>
                  <p className="text-white/80 text-sm">{combo.subtitulo}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">

                {/* Descripción */}
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{combo.descripcion}</p>

                {/* Productos incluidos */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Incluye</p>
                  <div className="space-y-3">
                    {combo.productos.map((p, j) => (
                      <div key={j} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden p-1">
                          <img
                            src={p.img}
                            alt={p.nombre}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display='none'; e.target.parentElement.innerHTML='<span class="text-2xl">💊</span>' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-dark font-semibold text-sm leading-tight">{p.nombre}</p>
                          <p className="text-gray-400 text-xs">{p.cantidad}</p>
                        </div>
                        <span className="text-primary font-bold text-sm flex-shrink-0">RD${p.precio.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precio */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Precio normal</span>
                    <span className="text-gray-300 line-through text-sm">RD${combo.precioNormal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-primary">RD${combo.precioCombo.toLocaleString()}</span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      Ahorras RD${combo.ahorro.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Botón WhatsApp */}
                <a
                  href={`https://wa.me/18492763532?text=${combo.whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-base transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg shadow-green-100"
                >
                  <svg className="w-5 h-5 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pedir este kit
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Nota informativa */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center"
        >
          <p className="text-primary font-bold mb-1">¿Quieres un kit personalizado?</p>
          <p className="text-gray-500 text-sm mb-4">Escríbenos y armamos el paquete ideal según tu objetivo y presupuesto.</p>
          <a
            href="https://wa.me/18492763532?text=Hola%20VitaGloss%20RD!%20Quiero%20armar%20un%20kit%20personalizado%20de%20productos%20Amway.%20%C2%BFMe%20pueden%20ayudar%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Kit personalizado
          </a>
        </motion.div>

        {/* Link de regreso */}
        <div className="text-center mt-8">
          <Link to="/catalogo" className="text-gray-400 hover:text-primary text-sm font-semibold transition-colors">
            ← Ver productos individuales
          </Link>
        </div>
      </div>
    </div>
  )
}
