const router = require('express').Router()
const Lead = require('../models/Lead')
const protect = require('../middleware/auth')

const PUBLIC_LEAD_WINDOW_MS = 15 * 60 * 1000
const publicLeadAttempts = new Map()

function trim(value, max = 120) {
  return String(value || '').trim().substring(0, max)
}

function publicLeadRateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const recent = (publicLeadAttempts.get(key) || []).filter(timestamp => now - timestamp < PUBLIC_LEAD_WINDOW_MS)
  if (recent.length >= 6) return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' })
  recent.push(now)
  publicLeadAttempts.set(key, recent)
  if (publicLeadAttempts.size > 5000) {
    for (const [ip, timestamps] of publicLeadAttempts) {
      if (!timestamps.some(timestamp => now - timestamp < PUBLIC_LEAD_WINDOW_MS)) publicLeadAttempts.delete(ip)
    }
  }
  next()
}

async function notifyNewLead(lead) {
  const apiKey = process.env.BREVO_API_KEY
  const recipient = process.env.LEAD_NOTIFY_EMAIL || process.env.SMTP_USER
  const senderEmail = process.env.BREVO_FROM_EMAIL || process.env.SMTP_USER
  if (!apiKey || !recipient || !senderEmail) return

  const dashboardUrl = `${String(process.env.FRONTEND_URL || 'https://vitaglossrd.com').replace(/\/$/, '')}/dashboard`
  const safe = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]))
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { email: senderEmail, name: process.env.BREVO_FROM_NAME || 'VitaGloss RD' },
      to: [{ email: recipient }],
      subject: `Nuevo lead: ${trim(lead.nombre, 60)}`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#16324a"><h2>Nuevo contacto recibido</h2><p><strong>Nombre:</strong> ${safe(lead.nombre)}</p><p><strong>Interés:</strong> ${safe(lead.tipoInteres)}</p><p><strong>Origen:</strong> ${safe(lead.origen)}</p><p><strong>Campaña:</strong> ${safe(lead.campana?.name || 'Orgánico / sin identificar')}</p><p style="margin-top:24px"><a href="${dashboardUrl}" style="background:#0c7757;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">Revisar en el panel</a></p><p style="color:#718193;font-size:12px;margin-top:24px">Contacta únicamente si la persona otorgó consentimiento.</p></div>`,
      tags: ['nuevo-lead'],
    }),
  })
  if (!response.ok) throw new Error(`Brevo respondió ${response.status}`)
}

// ── Helper: enviar mensaje WA via whatsapp-service ────────────────────────
async function sendWA(numero, texto) {
  const WA_URL    = process.env.WA_SERVICE_URL  || 'http://localhost:3002'
  const WA_SECRET = process.env.WA_SECRET       || 'vitagloss_wa_2026'
  try {
    const res = await fetch(`${WA_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': WA_SECRET },
      body: JSON.stringify({ number: numero, text: texto }),
    })
    const data = await res.json()
    return data.ok
  } catch {
    return false  // No bloquear el flujo si WA falla
  }
}

// Mensaje de confirmación para webinar
function msgWebinar(nombre) {
  const WEBINAR_LINK = process.env.WEBINAR_LINK || 'https://meet.google.com/vitaglossrd'
  return [
    `🎙️ *¡Hola ${nombre}! Tu registro está confirmado* ✅`,
    ``,
    `Gracias por inscribirte al webinar de *VitaGloss RD × Amway*.`,
    ``,
    `📅 *Fecha:* Sábado 15 de marzo, 2026`,
    `🕖 *Hora:* 7:00 pm (hora RD)`,
    `🔗 *Link para entrar:*`,
    `${WEBINAR_LINK}`,
    ``,
    `📌 *¿Qué vas a aprender?*`,
    `• Cómo generar ingresos extra desde casa`,
    `• Cómo conseguir tus primeros clientes`,
    `• Los productos Amway que más se venden`,
    `• Cómo te capacito y apoyo personalmente`,
    ``,
    `Si tienes preguntas antes del webinar, escríbeme aquí mismo 👇`,
    `¡Nos vemos el sábado! 🚀`,
    ``,
    `_— Andy Rosado, VitaGloss RD_`,
  ].join('\n')
}

// ── POST /api/leads/public — Captura pública (LeadPopup, JoinCTA, etc.) ──────
// No requiere autenticación. vendedor queda null (lead sin asignar).
router.post('/public', publicLeadRateLimit, async (req, res) => {
  try {
    const { nombre, telefono, email, productoInteres, nota, origen, refCode, ciudad, tipoInteres, consentimientoContacto, consentimientoTexto, campana, website } = req.body
    if (website) return res.status(201).json({ ok: true })
    if (!trim(nombre, 60)) return res.status(400).json({ error: 'El nombre es requerido' })
    const cleanPhone = trim(telefono, 20)
    const cleanEmail = trim(email, 120).toLowerCase()
    if (!cleanPhone && !cleanEmail) return res.status(400).json({ error: 'Indica un teléfono o correo de contacto' })
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: 'El correo no es válido' })

    const duplicateSince = new Date(Date.now() - 10 * 60 * 1000)
    const duplicateQuery = cleanPhone ? { telefono: cleanPhone } : { email: cleanEmail }
    const duplicate = await Lead.findOne({ ...duplicateQuery, createdAt: { $gte: duplicateSince } }).select('_id')
    if (duplicate) return res.status(200).json({ ok: true, duplicate: true })
    const allowedOrigins = ['whatsapp', 'referido', 'web', 'instagram', 'facebook', 'amway-landing', 'webinar', 'campana', 'otro']

    const lead = await Lead.create({
      nombre:          trim(nombre, 60),
      telefono:        cleanPhone,
      email:           cleanEmail,
      productoInteres: trim(productoInteres || 'Catálogo general', 160),
      nota:            trim(nota, 500),
      origen:          allowedOrigins.includes(origen) ? origen : 'web',
      tipoInteres:     ['cliente', 'vendedor', 'ambos', 'otro'].includes(tipoInteres) ? tipoInteres : 'cliente',
      relacion:        ['vendedor', 'ambos'].includes(tipoInteres) ? 'prospecto_vendedor' : 'prospecto_cliente',
      refCode:         trim(refCode, 80),
      ciudad:          trim(ciudad, 80),
      consentimientoContacto: consentimientoContacto === true,
      consentimientoFecha: consentimientoContacto === true ? new Date() : null,
      consentimientoTexto: trim(consentimientoTexto, 300),
      consentimientoOrigen: consentimientoContacto === true
        ? (['instagram', 'facebook', 'whatsapp'].includes(origen) ? origen : 'formulario_web')
        : '',
      campana: {
        source: trim(campana?.source, 80),
        medium: trim(campana?.medium, 80),
        name: trim(campana?.name, 120),
        content: trim(campana?.content, 120),
        landingPath: trim(campana?.landingPath, 160),
      },
    })

    notifyNewLead(lead).catch(error => console.error('[Lead notification]', error.message))

    // Enviar mensaje de confirmación si es registro de webinar y tiene teléfono
    if (origen === 'webinar' && telefono) {
      const msg = msgWebinar(nombre.trim())
      sendWA(telefono.trim(), msg) // fire-and-forget (no await)
    }

    res.status(201).json({ ok: true, leadId: lead._id })
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar lead' })
  }
})

// ── GET /api/leads/cupos — Cupos disponibles este mes para /empieza (público) ─
router.get('/cupos', async (req, res) => {
  try {
    const MAX_CUPOS = 15
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const count = await Lead.countDocuments({
      origen: 'amway-landing',
      createdAt: { $gte: inicioMes },
    })
    const disponibles = Math.max(1, MAX_CUPOS - count)
    res.json({ disponibles })
  } catch {
    res.status(200).json({ disponibles: 4 })
  }
})

// Todos los demás endpoints requieren autenticación
router.use(protect)

// ── GET /api/leads — Mis leads (o todos si admin) ─────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = req.user.rol === 'admin' ? {} : { vendedor: req.user._id }
    const leads = await Lead.find(filter)
      .populate('vendedor', 'nombre')
      .sort({ createdAt: -1 })
    res.json({ leads })
  } catch {
    res.status(500).json({ error: 'Error al obtener leads.' })
  }
})

router.patch('/mark-seen', async (req, res) => {
  try {
    const filter = req.user.rol === 'admin' ? { leido: { $ne: true } } : { vendedor: req.user._id, leido: { $ne: true } }
    const result = await Lead.updateMany(filter, { $set: { leido: true, leidoAt: new Date() } })
    res.json({ updated: result.modifiedCount })
  } catch {
    res.status(500).json({ error: 'No se pudieron marcar los leads.' })
  }
})

// ── POST /api/leads — Crear lead ──────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email, productoInteres, estado, nota, origen, tipoInteres, relacion, etapaConversion, consentimientoContacto, consentimientoOrigen, proximoSeguimiento, comunidadTipo, comunidadEstado } = req.body
    if (['aceptado', 'activo'].includes(comunidadEstado) && consentimientoContacto !== true) {
      return res.status(400).json({ error: 'Registra el consentimiento antes de añadir una persona a una comunidad.' })
    }
    if (comunidadTipo === 'equipo_ibo') {
      return res.status(400).json({ error: 'Confirma primero el registro oficial desde la ficha antes de asignar la comunidad de equipo.' })
    }
    const lead = await Lead.create({
      vendedor: req.user._id,
      nombre,
      telefono,
      email,
      productoInteres,
      estado,
      nota,
      origen,
      tipoInteres,
      relacion: relacion || (['vendedor', 'ambos'].includes(tipoInteres) ? 'prospecto_vendedor' : 'prospecto_cliente'),
      etapaConversion: etapaConversion || 'contacto',
      consentimientoContacto: consentimientoContacto === true,
      consentimientoFecha: consentimientoContacto === true ? new Date() : null,
      consentimientoOrigen: consentimientoContacto === true ? (consentimientoOrigen || 'verbal') : '',
      comunidadTipo: comunidadTipo || 'ninguna',
      comunidadEstado: comunidadEstado || 'no_invitado',
      comunidadIngresoAt: ['aceptado', 'activo'].includes(comunidadEstado) ? new Date() : null,
      leido: true,
      leidoAt: new Date(),
      proximoSeguimiento: proximoSeguimiento || null,
    })
    res.status(201).json({ lead })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join('. ') })
    }
    res.status(500).json({ error: 'Error al crear lead.' })
  }
})

// ── PATCH /api/leads/:id — Actualizar estado/nota ────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado.' })
    if (req.user.rol !== 'admin' && (!lead.vendedor || lead.vendedor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Sin permiso.' })
    }
    const { estado, nota, nombre, telefono, email, productoInteres, origen, vendedor, tipoInteres, relacion, etapaConversion, registroOficial, actividadEquipo, leido, ultimoContacto, proximoSeguimiento, consentimientoContacto, consentimientoOrigen, comunidadTipo, comunidadEstado, comunidadIngresoAt, comunidadSalidaAt } = req.body
    if (estado) lead.estado = estado
    if (nota !== undefined) lead.nota = nota
    if (nombre) lead.nombre = nombre
    if (telefono !== undefined) lead.telefono = telefono
    if (email !== undefined) lead.email = email
    if (productoInteres !== undefined) lead.productoInteres = productoInteres
    if (origen !== undefined) lead.origen = origen
    if (tipoInteres !== undefined) lead.tipoInteres = tipoInteres
    if (relacion !== undefined) lead.relacion = relacion
    if (etapaConversion !== undefined) lead.etapaConversion = etapaConversion
    if (registroOficial !== undefined) {
      const confirmado = registroOficial?.confirmado === true
      lead.registroOficial.confirmado = confirmado
      lead.registroOficial.fecha = confirmado ? (registroOficial.fecha || lead.registroOficial.fecha || new Date()) : null
      lead.registroOficial.verificadoAt = confirmado ? new Date() : null
      if (confirmado) lead.relacion = 'miembro_equipo'
      if (!confirmado && lead.relacion === 'miembro_equipo') lead.relacion = 'prospecto_vendedor'
    }
    if (actividadEquipo !== undefined) {
      if (actividadEquipo.estado !== undefined) lead.actividadEquipo.estado = actividadEquipo.estado
      if (actividadEquipo.ultimaCompra !== undefined) lead.actividadEquipo.ultimaCompra = actividadEquipo.ultimaCompra || null
    }
    if (lead.actividadEquipo?.estado === 'activo' && !lead.registroOficial?.confirmado) {
      return res.status(400).json({ error: 'Confirma primero el registro oficial antes de marcar un miembro como activo.' })
    }
    if (lead.registroOficial?.confirmado && lead.actividadEquipo?.estado === 'activo') lead.etapaConversion = 'activo'
    if (leido !== undefined) { lead.leido = Boolean(leido); lead.leidoAt = lead.leido ? new Date() : null }
    if (ultimoContacto !== undefined) lead.ultimoContacto = ultimoContacto || null
    if (proximoSeguimiento !== undefined) lead.proximoSeguimiento = proximoSeguimiento || null
    if (consentimientoContacto !== undefined) {
      lead.consentimientoContacto = Boolean(consentimientoContacto)
      lead.consentimientoFecha = lead.consentimientoContacto ? (lead.consentimientoFecha || new Date()) : null
      if (!lead.consentimientoContacto) lead.consentimientoOrigen = ''
    }
    if (consentimientoOrigen !== undefined && lead.consentimientoContacto) lead.consentimientoOrigen = consentimientoOrigen
    if (comunidadTipo !== undefined) lead.comunidadTipo = comunidadTipo
    if (comunidadEstado !== undefined) {
      lead.comunidadEstado = comunidadEstado
      if (['aceptado', 'activo'].includes(comunidadEstado) && !lead.comunidadIngresoAt) lead.comunidadIngresoAt = comunidadIngresoAt || new Date()
      if (['salio', 'removido'].includes(comunidadEstado)) lead.comunidadSalidaAt = comunidadSalidaAt || new Date()
      if (!['salio', 'removido'].includes(comunidadEstado)) lead.comunidadSalidaAt = null
    }
    if (lead.comunidadTipo === 'equipo_ibo' && !lead.registroOficial?.confirmado) {
      return res.status(400).json({ error: 'Solo un IBO confirmado puede acceder a la comunidad del equipo.' })
    }
    if (lead.comunidadTipo !== 'ninguna' && ['aceptado', 'activo'].includes(lead.comunidadEstado) && !lead.consentimientoContacto) {
      return res.status(400).json({ error: 'Registra el consentimiento antes de añadir una persona a una comunidad.' })
    }
    if (vendedor !== undefined && req.user.rol === 'admin') lead.vendedor = vendedor || null
    await lead.save()
    res.json({ lead })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── DELETE /api/leads/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado.' })
    if (req.user.rol !== 'admin' && (!lead.vendedor || lead.vendedor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Sin permiso.' })
    }
    await lead.deleteOne()
    res.json({ message: 'Lead eliminado.' })
  } catch {
    res.status(500).json({ error: 'Error al eliminar lead.' })
  }
})

module.exports = router
