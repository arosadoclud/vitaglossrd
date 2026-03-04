import { createContext, useContext, useEffect, useState } from 'react'
import { PRECIOS, COMBO_PRECIOS } from '../data/precios.js'
import { api } from '../services/api'

const PreciosCtx = createContext(null)

// Convierte array [{id,precio,precioOriginal}] a objeto {1: {...}, 2: {...}}
function arrayToMap(arr) {
  return arr.reduce((m, item) => { m[item.id] = item; return m }, {})
}

export function PreciosProvider({ children }) {
  // Inicializa con los valores estáticos de precios.js como fallback
  const [preciosMap, setPreciosMap]     = useState(PRECIOS)            // {[id]: {precio, precioOriginal}}
  const [comboPreciosMap, setComboPreciosMap] = useState(COMBO_PRECIOS) // {[comboId]: {precioCombo}}
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    api.getPrecios()
      .then(({ productos, combos }) => {
        if (productos && productos.length > 0) {
          setPreciosMap(arrayToMap(productos))
        }
        if (combos && combos.length > 0) {
          const comboMap = combos.reduce((m, c) => { m[c.id] = { precioCombo: c.precioCombo }; return m }, {})
          setComboPreciosMap(comboMap)
        }
      })
      .catch(() => {/* silently fallback to static */})
      .finally(() => setLoading(false))
  }, [])

  /**
   * Devuelve { precio, precioOriginal } para un producto por su id.
   * Usa el valor en vivo de DB; fallback al objeto del producto.
   */
  function getPrecio(id) {
    return preciosMap[id] ?? PRECIOS[id]
  }

  /**
   * Devuelve { precioCombo } para un kit/combo por su id string.
   */
  function getComboPrecio(id) {
    return comboPreciosMap[id] ?? COMBO_PRECIOS[id]
  }

  return (
    <PreciosCtx.Provider value={{ preciosMap, comboPreciosMap, getPrecio, getComboPrecio, loading, setPreciosMap, setComboPreciosMap }}>
      {children}
    </PreciosCtx.Provider>
  )
}

export function usePrecios() {
  const ctx = useContext(PreciosCtx)
  if (!ctx) throw new Error('usePrecios debe usarse dentro de PreciosProvider')
  return ctx
}
