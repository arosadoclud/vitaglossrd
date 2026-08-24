const router = require('express').Router()
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const protect = require('../middleware/auth')

// ── Generar JWT ──────────────────────────────────────────────────────────
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

function frontendUrl() {
  return (process.env.FRONTEND_URL || 'https://www.vitaglossrd.com')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '')
}

function mailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  })
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const subject = 'Restaura tu contraseña de VitaGloss RD'
  const text = `Solicitaste restaurar tu contraseña. Abre este enlace dentro de los próximos 30 minutos: ${resetUrl}\n\nSi no hiciste esta solicitud, ignora este mensaje.`
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#15243b"><h1 style="font-size:24px">Restaura tu contraseña</h1><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta de VitaGloss RD.</p><p><a href="${resetUrl}" style="display:inline-block;background:#173b67;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700">Crear nueva contraseña</a></p><p style="font-size:13px;color:#667085">Este enlace vence en 30 minutos y solo puede utilizarse una vez. Si no hiciste esta solicitud, puedes ignorar el mensaje.</p></div>`

  // Brevo usa HTTPS y funciona en Railway Hobby, donde SMTP está bloqueado.
  if (process.env.BREVO_API_KEY) {
    const senderEmail = process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER
    if (!senderEmail) throw new Error('BREVO_FROM_EMAIL no está configurado')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_FROM_NAME || 'VitaGloss RD',
            email: senderEmail,
          },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          replyTo: { email: process.env.SMTP_USER || senderEmail, name: 'VitaGloss RD' },
          tags: ['password-reset'],
        }),
      })
      if (!response.ok) throw new Error(`Brevo respondió ${response.status}: ${(await response.text()).slice(0, 200)}`)
      return
    } finally {
      clearTimeout(timeout)
    }
  }

  // Railway Hobby bloquea los puertos SMTP. Resend usa HTTPS y es la opción
  // preferida cuando RESEND_API_KEY está configurada.
  if (process.env.RESEND_API_KEY) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'VitaGloss RD <noreply@vitaglossrd.com>',
          to: [to],
          subject,
          text,
          html,
        }),
      })
      if (!response.ok) throw new Error(`Resend respondió ${response.status}: ${(await response.text()).slice(0, 200)}`)
      return
    } finally {
      clearTimeout(timeout)
    }
  }

  const transporter = mailTransport()
  if (!transporter) throw new Error('No hay proveedor de correo configurado')
  let timeout
  try {
    await Promise.race([
      transporter.sendMail({
        from: `"VitaGloss RD" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      }),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('El proveedor SMTP no respondió dentro de 8 segundos')), 8000)
      }),
    ])
  } finally {
    clearTimeout(timeout)
    transporter.close()
  }
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

// ── POST /api/auth/forgot-password ───────────────────────────────────────
// Siempre devuelve el mismo mensaje para no revelar qué correos existen.
router.post('/forgot-password', async (req, res) => {
  const genericMessage = 'Si el correo está registrado, recibirás un enlace para restaurar tu contraseña.'
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ message: genericMessage })
    }

    const user = await User.findOne({ email, activo: true })
    if (!user) return res.json({ message: genericMessage })

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${frontendUrl()}/restablecer-contrasena?token=${encodeURIComponent(rawToken)}`
    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl })
    } catch (mailError) {
      user.resetPasswordToken = undefined
      user.resetPasswordExpires = undefined
      await user.save({ validateBeforeSave: false })
      console.error('[Password reset] No se pudo enviar el correo:', mailError.message)
    }

    res.json({ message: genericMessage })
  } catch (err) {
    console.error('[Password reset] Error al crear solicitud:', err.message)
    res.json({ message: genericMessage })
  }
})

// ── POST /api/auth/reset-password ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body?.token || '')
    const password = String(req.body?.password || '')
    if (!token || !password) return res.status(400).json({ error: 'El enlace y la nueva contraseña son requeridos.' })

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
      activo: true,
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) return res.status(400).json({ error: 'El enlace es inválido o ya venció. Solicita uno nuevo.' })

    user.password = password
    user.passwordChangedAt = new Date(Date.now() - 1000)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(item => item.message).join('. ')
      return res.status(400).json({ error: message })
    }
    console.error('[Password reset] Error al cambiar contraseña:', err.message)
    res.status(500).json({ error: 'No se pudo actualizar la contraseña.' })
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
