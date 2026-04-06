import { Link } from 'react-router-dom'
import { usePrecios } from '../context/PreciosContext'
import { useAuth } from '../context/AuthContext'
import { slugify } from '../utils/slugify'

export default function ProductoCard({ producto }) {
  const stockBajo = producto.stockUnidades && producto.stockUnidades <= 5
  const { getPrecio } = usePrecios()
  const { user } = useAuth()
  const livePrice = getPrecio(producto.id)
  const precio = livePrice?.precio ?? producto.precio
  const precioOriginal = livePrice?.precioOriginal ?? producto.precioOriginal

  const whatsappMsg = encodeURIComponent(
    `Hola VitaGloss RD! 👋 Me interesa *${producto.nombre}*. ¿Está disponible? ¿Cómo hago el pedido?`
  )
  const whatsappURL = `https://wa.me/18492763532?text=${whatsappMsg}`

  return (
    <Link
      to={`/producto/${slugify(producto.nombre)}`}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 hover:border-secondary hover:-translate-y-1"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {/* Imagen */}
      <div className="relative flex items-center justify-center p-6 rounded-t-2xl overflow-hidden bg-white"
        style={{
          minHeight: '220px',
        }}>
        <span className={`absolute top-3 left-3 z-10 ${producto.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
          {producto.badge}
        </span>
        <span className={`absolute top-3 right-3 z-10 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${producto.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${producto.disponible ? 'bg-green-500' : 'bg-red-400'}`}></span>
          {producto.stock}
        </span>
        {/* Badge stock bajo */}
        {stockBajo && (
          <span className="absolute bottom-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow animate-pulse">
            🔥 Solo {producto.stockUnidades} disponibles
          </span>
        )}
        <img
          src={producto.imagen}
          srcSet={producto.imagen400w ? `${producto.imagen400w} 400w, ${producto.imagen} 690w` : undefined}
          sizes={producto.imagen400w ? '(max-width: 640px) calc(50vw - 32px), 308px' : undefined}
          alt={producto.nombre}
          loading="lazy"
          decoding="async"
          width="308"
          height="176"
          className="h-44 w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="px-4 pb-5 pt-3 flex flex-col flex-1 border-t border-gray-50">
        <span className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
          {producto.categoria}
        </span>
        <h3 className="text-dark font-bold text-base leading-snug mb-1 group-hover:text-primary transition-colors">
          {producto.nombre}
        </h3>
        <p className="text-gray-400 text-xs mb-3">Art. {producto.articulo}</p>
        <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">
          {producto.descripcion}
        </p>

        {/* Rating */}
        {producto.rating && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, s) => (
                <span key={s} className={`text-sm ${s < Math.round(producto.rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <span className="text-xs font-bold text-gray-600">{producto.rating}</span>
            <span className="text-xs text-gray-400">({producto.reviewCount})</span>
          </div>
        )}

        {/* Contador ventas */}
        {producto.ventasSemana && (
          <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-3">
            <span>🔥</span>
            <span>{producto.ventasSemana} personas compraron esta semana</span>
          </div>
        )}

        {/* Precio — solo para usuarios autenticados */}
        {user ? (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xl font-extrabold text-primary">RD${precio.toLocaleString('es-DO', { minimumFractionDigits: precio % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}</span>
            {precioOriginal && (
              <>
                <span className="text-gray-300 text-xs line-through">RD${precioOriginal.toLocaleString('es-DO')}</span>
                <span className="bg-red-100 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  -{Math.round(((precioOriginal - precio) / precioOriginal) * 100)}%
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 italic">Inicia sesión para ver el precio</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <span className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 whitespace-nowrap">
            Ver más →
          </span>
          <a
            href={whatsappURL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Consultar
          </a>
        </div>
      </div>
    </Link>
  )
}
