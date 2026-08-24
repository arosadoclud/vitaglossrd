export const MYSHOP_URL = 'https://www.amway.com.do/myshop/vitaglossrd'

export const MYSHOP_PRICE_NOTICE = 'El precio mostrado corresponde al producto. Los impuestos y gastos de entrega se calculan en el checkout oficial de Amway antes de confirmar el pago.'

export const MYSHOP_SERVICE_NOTICE = 'VitaGloss RD es tu distribuidor independiente y tu contacto para orientación y servicio antes y después de la compra.'

// Los enlaces individuales deben copiarse desde la función oficial «Compartir»
// de Amway. Hasta tener un enlace verificado, enviamos al MyShop del IBO para
// conservar la atribución y evitar rutas de producto inventadas o caducadas.
const PRODUCT_LINKS = {}

export function getMyShopUrl(articulo) {
  return PRODUCT_LINKS[articulo] || MYSHOP_URL
}

export function hasDirectMyShopLink(articulo) {
  return Boolean(PRODUCT_LINKS[articulo])
}
