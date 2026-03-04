const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const Precio = require('../models/Precio')

// ── GET /api/precios — público, devuelve precios guardados en DB ─────────────
router.get('/', async (req, res) => {
  try {
    const doc = await Precio.findOne({ tipo: 'precios' })
    if (!doc) return res.json({ productos: [], combos: [] })
    res.json({ productos: doc.productos, combos: doc.combos })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener precios.' })
  }
})

// ── PUT /api/precios — solo admin ────────────────────────────────────────────
router.put('/', protect, async (req, res) => {
  // Solo admins pueden actualizar precios
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo los administradores pueden modificar precios.' })
  }

  const { productos, combos } = req.body
  if (!Array.isArray(productos)) {
    return res.status(400).json({ error: 'El campo "productos" debe ser un array.' })
  }

  try {
    const doc = await Precio.findOneAndUpdate(
      { tipo: 'precios' },
      { productos, combos: combos || [] },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    res.json({ ok: true, productos: doc.productos, combos: doc.combos })
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar precios.' })
  }
})

module.exports = router
