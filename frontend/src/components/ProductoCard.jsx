import { Link } from 'react-router-dom'
import { usePrecios } from '../context/PreciosContext'
import { useAuth } from '../context/AuthContext'
import { slugify } from '../utils/slugify'
import { getMyShopUrl, hasDirectMyShopLink, MYSHOP_PRICE_NOTICE } from '../config/myshop'

export default function ProductoCard({ producto }) {
  const { getPrecio } = usePrecios()
  const { user } = useAuth()
  const livePrice = getPrecio(producto.id)
  const precio = livePrice?.precio ?? producto.precio
  const precioOriginal = livePrice?.precioOriginal ?? producto.precioOriginal

  const detailURL = `/producto/${slugify(producto.nombre)}`
  const myShopURL = getMyShopUrl(producto.articulo)

  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100 hover:border-secondary hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative flex items-center justify-center p-6 rounded-t-2xl overflow-hidden bg-white"
        style={{
          minHeight: '220px',
        }}>
        <span className={`absolute top-3 left-3 z-10 ${producto.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
          {producto.badge}
        </span>
        <span className="absolute top-3 right-3 z-10 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 bg-blue-50 text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Ver en MyShop
        </span>
        <Link to={detailURL} aria-label={`Ver detalles de ${producto.nombre}`} className="w-full">
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
        </Link>
      </div>

      {/* Info */}
      <div className="px-4 pb-5 pt-3 flex flex-col flex-1 border-t border-gray-50">
        <span className="text-xs text-secondary font-semibold uppercase tracking-wide mb-1">
          {producto.categoria}
        </span>
        <h3 className="text-dark font-bold text-base leading-snug mb-1 group-hover:text-primary transition-colors">
          <Link to={detailURL}>{producto.nombre}</Link>
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

        {/* Precio — solo para usuarios autenticados */}
        {user ? (
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
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
            <p className="mt-1 text-[10px] leading-relaxed text-gray-400">No incluye impuestos ni gastos de entrega.</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">Precio disponible al iniciar sesión</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-2">
          <Link to={detailURL} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 whitespace-nowrap">
            Ver detalles
          </Link>
          <a
            href={myShopURL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Comprar ${producto.nombre} en MyShop`}
            className="flex-1 bg-primary hover:bg-[#173a6b] text-white text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm"
          >
            Comprar
          </a>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-gray-400 text-center">
          {hasDirectMyShopLink(producto.articulo) ? 'Abre este producto en Amway. ' : 'Abre nuestro catálogo oficial en Amway. '}
          {MYSHOP_PRICE_NOTICE} VitaGloss RD te acompaña antes y después de la compra.
        </p>
      </div>
    </article>
  )
}
