const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const protect = require('../middleware/auth')

// ── Generar JWT ──────────────────────────────────────────────────────────
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// ── POST /api/auth/register ───────────────────────────────────────────────
// Solo un administrador autenticado puede crear nuevos usuarios.
// El primer administrador se prepara mediante `npm run seed:admin`.
router.post('/register', protect, async (req, res) => {
  try {
    const { nombre, email, password, whatsapp, rol, descripcion } = req.body

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo un administrador puede registrar usuarios.' })
    }

    const user = await User.create({
      nombre,
      email,
      password,
      whatsapp: whatsapp || '',
      rol: rol === 'admin' ? 'admin' : 'vendedor',
      descripcion: descripcion || undefined,
    })

    const token = generateToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Ese email ya está registrado.' })
    }
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ')
      return res.status(400).json({ error: msg })
    }
    res.status(500).json({ error: 'Error al registrar usuario.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' })
    }

    // Traer usuario CON password (select: false en el schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' })
    }

    const esValida = await user.compararPassword(password)
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' })
    }

    const token = generateToken(user._id)
    res.json({ token, user }) // toJSON() quita la password
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user })
})

// ── PATCH /api/auth/me ────────────────────────────────────────────────────
router.patch('/me', protect, async (req, res) => {
  try {
    const { nombre, descripcion, whatsapp, foto, metaMensual } = req.body
    const updates = {}
    if (nombre) updates.nombre = nombre
    if (descripcion !== undefined) updates.descripcion = descripcion
    if (whatsapp !== undefined) updates.whatsapp = whatsapp
    if (foto !== undefined) updates.foto = foto
    if (metaMensual !== undefined) updates.metaMensual = metaMensual

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    res.json({ user })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── PATCH /api/auth/password ──────────────────────────────────────────────
router.patch('/password', protect, async (req, res) => {
  try {
    const { passwordActual, passwordNuevo } = req.body
    const user = await User.findById(req.user._id).select('+password')
    const valida = await user.compararPassword(passwordActual)
    if (!valida) return res.status(400).json({ error: 'Contraseña actual incorrecta.' })
    user.password = passwordNuevo
    await user.save()
    res.json({ message: 'Contraseña actualizada.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── GET /api/auth/ref/:code — track ref link click ───────────────────────
router.get('/ref/:code', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { refCode: req.params.code, activo: true },
      { $inc: { refClicks: 1 } },
      { new: true }
    )
    if (!user) return res.status(404).json({ error: 'Enlace no válido.' })
    res.json({ nombre: user.nombre, refCode: user.refCode, whatsapp: user.whatsapp })
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar enlace.' })
  }
})

module.exports = router
