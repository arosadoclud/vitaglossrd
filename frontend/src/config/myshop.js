export const MYSHOP_URL = 'https://www.amway.com.do/myshop/vitaglossrd'

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
