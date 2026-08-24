import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { useSEO } from '../hooks/useSEO'
import PreciosTab from '../components/PreciosTab'
import { productos } from '../data/productos'
import './Dashboard.css'

// ─── helpers ────────────────────────────────────────────────────────────────
const ESTADO_LEAD = ['nuevo', 'contactado', 'interesado', 'cerrado', 'perdido']
const ETAPA_CONVERSION = [
  ['contacto', 'Contacto recibido'],
  ['informacion', 'Información solicitada'],
  ['registro_iniciado', 'Registro oficial iniciado'],
  ['registro_completado', 'Registro oficial completado'],
  ['activo', 'Miembro activo'],
  ['inactivo', 'Miembro inactivo'],
  ['descartado', 'Descartado'],
]
const RELACIONES = [
  ['prospecto_cliente', 'Prospecto de productos'],
  ['prospecto_vendedor', 'Prospecto de negocio'],
  ['cliente', 'Cliente confirmado'],
  ['miembro_equipo', 'Miembro oficial del equipo'],
]
const COMUNIDADES = [
  ['ninguna', 'Sin comunidad'],
  ['clientes', 'Círculo de clientes'],
  ['orientacion_negocio', 'Orientación sobre el negocio'],
  ['equipo_ibo', 'Equipo IBO activo'],
]
const ESTADOS_COMUNIDAD = [
  ['no_invitado', 'No invitado'],
  ['invitado', 'Invitación enviada'],
  ['aceptado', 'Aceptó participar'],
  ['activo', 'Miembro activo'],
  ['salio', 'Salió voluntariamente'],
  ['removido', 'Removido'],
]
const ORIGENES_CONSENTIMIENTO = [
  ['', 'Sin registrar'],
  ['formulario_web', 'Formulario web'],
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['whatsapp', 'WhatsApp'],
  ['verbal', 'Confirmación verbal'],
  ['otro', 'Otro'],
]
const ESTADO_VENTA = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado']
const METODO_PAGO = ['transferencia', 'efectivo', 'tarjeta', 'pago_movil', 'otro']

const BADGE_LEAD = {
  nuevo:       'bg-sky-100 text-sky-700',
  contactado:  'bg-yellow-100 text-yellow-700',
  interesado:  'bg-purple-100 text-purple-700',
  cerrado:     'bg-green-100 text-green-700',
  perdido:     'bg-red-100 text-red-700',
}
const BADGE_VENTA = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  pagado:     'bg-sky-100 text-sky-700',
  enviado:    'bg-purple-100 text-purple-700',
  entregado:  'bg-green-100 text-green-700',
  cancelado:  'bg-red-100 text-red-700',
}

// ─── Order states ────────────────────────────────────────────────────────────
const ORDER_ESTADOS = [
  { value: 'nuevo',      label: '🆕 Nuevo',      badge: 'bg-sky-100 text-sky-700' },
  { value: 'confirmado', label: '💬 Confirmado',  badge: 'bg-blue-100 text-blue-700' },
  { value: 'preparando', label: '📦 Preparando',  badge: 'bg-amber-100 text-amber-700' },
  { value: 'enviado',    label: '🚚 Enviado',     badge: 'bg-purple-100 text-purple-700' },
  { value: 'en_camino',  label: '🛣️ En camino',   badge: 'bg-orange-100 text-orange-700' },
  { value: 'entregado',  label: '✅ Entregado',   badge: 'bg-green-100 text-green-700' },
  { value: 'cancelado',  label: '❌ Cancelado',   badge: 'bg-red-100 text-red-700' },
]
const ORDER_PAGO = [
  { value: 'pendiente', label: '⏳ Pendiente', badge: 'bg-yellow-100 text-yellow-700' },
  { value: 'parcial',   label: '〽️ Parcial',   badge: 'bg-orange-100 text-orange-700' },
  { value: 'pagado',    label: '✅ Pagado',     badge: 'bg-green-100 text-green-700' },
]

function waMessageForEstado(order) {
  const n = order.nombre || 'cliente'
  const t = `RD$${order.total.toLocaleString()}`
  switch (order.estado) {
    case 'nuevo':      return `Hola *${n}* 👋 Acabo de recibir tu pedido de ${t}. ¿Lo confirmamos?`
    case 'confirmado': return `Hola *${n}* ✅ Tu pedido de ${t} está confirmado. Lo estamos preparando ahora mismo 📦`
    case 'preparando': return `Hola *${n}* 📦 Tu pedido ya está siendo preparado. Te aviso cuando esté listo para envío.`
    case 'enviado':    return `Hola *${n}* 🚚 Tu pedido de ${t} ha sido enviado. ¡Espéralo pronto!`
    case 'en_camino':  return `Hola *${n}* 🛣️ Tu pedido está *en camino* y llegará en breve. ¡Prepárate para recibirlo!`
    case 'entregado':  return `Hola *${n}* ✅ ¡Tu pedido fue entregado! Espero que estés satisfecho/a. ¿Todo bien con el producto?`
    default:           return `Hola *${n}*, hablamos sobre tu pedido de ${t}`
  }
}

const TABS_ALL = [
  { label: 'Resumen', icon: 'overview' },
  { label: 'Prospectos y equipo', icon: 'users' },
  { label: 'My Shop', icon: 'sales' },
  { label: 'Plantillas', icon: 'message' },
  { label: 'Pedidos web', icon: 'orders' },
  { label: 'Mi perfil', icon: 'profile' },
  { label: 'Precios', icon: 'prices' },
]

function DashboardIcon({ name, className = 'h-5 w-5' }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    sales: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></>,
    message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>,
    orders: <><path d="M6 2h12l3 5-9 4-9-4 3-5Z"/><path d="M3 7v10l9 5 9-5V7M12 11v11"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>,
    prices: <><path d="M20 13 13 20a2 2 0 0 1-3 0l-6-6a2 2 0 0 1 0-3l7-7h6l3 3v6Z"/><circle cx="15.5" cy="8.5" r="1"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
    academy: <><path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M7 12.5V17c3 2 7 2 10 0v-4.5M21 10v6"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.overview}
    </svg>
  )
}

const WA_TEMPLATES_BY_STAGE = [
  {
    etapa: 'Primer contacto autorizado',
    desc: 'Úsalo solamente cuando la persona pidió información o autorizó el contacto.',
    plantillas: [
      { producto: 'Confirmar la solicitud', msg: 'Hola, [nombre]. Soy Andy Rosado, Empresario Independiente de Amway. Recibí tu solicitud de información en [canal]. ¿Prefieres conocer información oficial sobre productos o sobre el negocio independiente?' },
      { producto: 'Orientación de producto', msg: 'Hola, [nombre]. Gracias por solicitar orientación sobre [producto o categoría]. Puedo compartirte la descripción, las instrucciones y el enlace oficial aplicable en República Dominicana. ¿Cuál es tu principal duda?' },
    ],
  },
  {
    etapa: 'Seguimiento con consentimiento',
    desc: 'Un recordatorio breve, sin presión ni urgencia artificial.',
    plantillas: [
      { producto: 'Recordatorio respetuoso', msg: 'Hola, [nombre]. Retomo la información que me solicitaste sobre [tema]. Si todavía deseas revisarla, puedo aclarar tus preguntas. Si prefieres cerrar el seguimiento, indícamelo y no volveré a escribirte sobre este tema.' },
      { producto: 'Fuente oficial', msg: 'Hola, [nombre]. Te comparto la fuente oficial correspondiente a [producto o tema] para que puedas revisarla directamente. Si surge alguna pregunta sobre su contenido, estoy disponible para orientarte.' },
    ],
  },
  {
    etapa: 'Decisión informada',
    desc: 'Facilita el siguiente paso sin promesas, descuentos inventados ni presión.',
    plantillas: [
      { producto: 'Compra mediante MyShop', msg: 'Hola, [nombre]. Si ya revisaste la información y deseas continuar, puedes realizar la compra directamente en mi MyShop oficial. Antes de hacerlo, confirma que el producto y sus instrucciones corresponden a lo que buscas.' },
      { producto: 'Orientación sobre el negocio', msg: 'Hola, [nombre]. La opción que conversamos es un negocio independiente de venta directa ofrecido por Amway; no es un empleo ni ofrece ingresos garantizados. Si deseas continuar, coordinamos una orientación privada para revisar responsabilidades, costos y el proceso oficial.' },
    ],
  },
  {
    etapa: 'Servicio posventa',
    desc: 'Seguimiento de entrega y uso, sin solicitar afirmaciones de resultados.',
    plantillas: [
      { producto: 'Confirmar entrega', msg: 'Hola, [nombre]. Quiero confirmar que recibiste tu pedido correctamente. ¿El empaque llegó en buenas condiciones? Si necesitas revisar las instrucciones oficiales de uso, puedo ayudarte.' },
      { producto: 'Consulta de servicio', msg: 'Hola, [nombre]. ¿Tienes alguna duda sobre las instrucciones, almacenamiento o uso indicado en la etiqueta de [producto]? Estoy disponible para ayudarte a localizar la información oficial.' },
    ],
  },
]

// Mantener compatibilidad con la variable anterior (por si se usa en algún otro lugar)
const WA_TEMPLATES = WA_TEMPLATES_BY_STAGE.flatMap(s => s.plantillas)

function copyToClipboard(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text)
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

// ─── stat card ──────────────────────────────────────────────────────────────
function StatCard({ titulo, valor, sub, icono, color = 'primary' }) {
  const colors = {
    primary: 'vg-stat--navy',
    green:   'vg-stat--green',
    purple:  'vg-stat--violet',
    orange:  'vg-stat--amber',
  }
  return (
    <div className={`vg-stat-card ${colors[color]}`}>
      <div className="flex items-start justify-between mb-5">
        <p className="vg-stat-label">{titulo}</p>
        <span className="vg-stat-icon"><DashboardIcon name={icono} className="h-5 w-5" /></span>
      </div>
      <p className="vg-stat-value">{valor}</p>
      {sub && <p className="vg-stat-sub">{sub}</p>}
    </div>
  )
}

// ─── section wrapper ─────────────────────────────────────────────────────────
function Section({ children }) {
  return (
    <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </m.div>
  )
}

function LeadDetailModal({ lead, setLead, onClose, onSave, onContact, onDelete, saving, isAdmin, teamMembers }) {
  if (!lead) return null
  return (
    <m.div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#07192b]/65 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <m.form onSubmit={onSave} onClick={event => event.stopPropagation()} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="vg-lead-detail">
        <div className="vg-lead-detail-head">
          <div><p>Ficha de seguimiento</p><h3>{lead.nombre}</h3></div>
          <button type="button" onClick={onClose} aria-label="Cerrar ficha">×</button>
        </div>
        <div className="vg-lead-detail-body">
          <div className="grid sm:grid-cols-2 gap-4">
            <label>Nombre<input required value={lead.nombre || ''} onChange={event => setLead(current => ({ ...current, nombre: event.target.value }))} /></label>
            <label>Teléfono<input value={lead.telefono || ''} onChange={event => setLead(current => ({ ...current, telefono: event.target.value }))} /></label>
            <label>Correo<input type="email" value={lead.email || ''} onChange={event => setLead(current => ({ ...current, email: event.target.value }))} /></label>
            <label>Tipo de interés<select value={lead.tipoInteres || 'cliente'} onChange={event => setLead(current => ({ ...current, tipoInteres: event.target.value }))}><option value="cliente">Productos</option><option value="vendedor">Negocio independiente</option><option value="ambos">Ambos</option><option value="otro">Otro</option></select></label>
            <label>Clasificación<select value={lead.relacion || (lead.tipoInteres === 'vendedor' ? 'prospecto_vendedor' : 'prospecto_cliente')} onChange={event => setLead(current => ({ ...current, relacion: event.target.value }))}>{RELACIONES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Etapa de conversión<select value={lead.etapaConversion || 'contacto'} onChange={event => setLead(current => ({ ...current, etapaConversion: event.target.value }))}>{ETAPA_CONVERSION.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Estado<select value={lead.estado || 'nuevo'} onChange={event => setLead(current => ({ ...current, estado: event.target.value }))}>{ESTADO_LEAD.map(estado => <option key={estado} value={estado}>{estado}</option>)}</select></label>
            <label>Próximo seguimiento<input type="datetime-local" value={lead.proximoSeguimiento || ''} onChange={event => setLead(current => ({ ...current, proximoSeguimiento: event.target.value }))} /></label>
            <label>Comunidad<select value={lead.comunidadTipo || 'ninguna'} onChange={event => setLead(current => ({ ...current, comunidadTipo: event.target.value }))}>{COMUNIDADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Estado en comunidad<select value={lead.comunidadEstado || 'no_invitado'} onChange={event => setLead(current => ({ ...current, comunidadEstado: event.target.value }))}>{ESTADOS_COMUNIDAD.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Origen del consentimiento<select value={lead.consentimientoOrigen || ''} onChange={event => setLead(current => ({ ...current, consentimientoOrigen: event.target.value, consentimientoContacto: Boolean(event.target.value) || current.consentimientoContacto }))}>{ORIGENES_CONSENTIMIENTO.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            {isAdmin && <label>Responsable<select value={lead.vendedor || ''} onChange={event => setLead(current => ({ ...current, vendedor: event.target.value }))}><option value="">Sin asignar</option>{teamMembers.map(member => <option key={member._id} value={member._id}>{member.nombre}</option>)}</select></label>}
            <label>Interés específico<input value={lead.productoInteres || ''} onChange={event => setLead(current => ({ ...current, productoInteres: event.target.value }))} /></label>
            <label>Actividad en equipo<select value={lead.actividadEquipo?.estado || 'no_aplica'} onChange={event => setLead(current => ({ ...current, actividadEquipo: { ...(current.actividadEquipo || {}), estado: event.target.value } }))}><option value="no_aplica">No aplica / no confirmado</option><option value="sin_compra">Sin compras registradas</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
            <label>Última compra conocida<input type="date" value={lead.actividadEquipo?.ultimaCompra ? new Date(lead.actividadEquipo.ultimaCompra).toISOString().slice(0, 10) : ''} onChange={event => setLead(current => ({ ...current, actividadEquipo: { ...(current.actividadEquipo || {}), ultimaCompra: event.target.value } }))} /></label>
          </div>
          <label className="vg-official-check"><span><input type="checkbox" checked={lead.registroOficial?.confirmado === true} onChange={event => setLead(current => ({ ...current, registroOficial: { ...(current.registroOficial || {}), confirmado: event.target.checked }, relacion: event.target.checked ? 'miembro_equipo' : (current.relacion === 'miembro_equipo' ? 'prospecto_vendedor' : current.relacion), actividadEquipo: event.target.checked ? current.actividadEquipo : { ...(current.actividadEquipo || {}), estado: 'no_aplica' } }))} /> Confirmé manualmente que terminó el registro oficial</span><small>Márcalo solamente después de comprobarlo en el portal oficial. Un lead por sí solo no pertenece a tu línea.</small></label>
          <label>Notas<textarea rows={4} value={lead.nota || ''} onChange={event => setLead(current => ({ ...current, nota: event.target.value }))} /></label>
          <div className="vg-lead-source-grid">
            <div><span>Origen</span><strong>{lead.origen || 'web'}</strong></div>
            <div><span>Campaña</span><strong>{lead.campana?.name || 'Sin identificar'}</strong></div>
            <div><span>Registro</span><strong>{new Date(lead.createdAt).toLocaleString('es-DO')}</strong></div>
            <div><span>Consentimiento</span><strong className={lead.consentimientoContacto ? 'text-green-700' : 'text-amber-700'}>{lead.consentimientoContacto ? `Registrado · ${lead.consentimientoOrigen || 'sin fuente'}` : 'No registrado'}</strong></div>
          </div>
          {!lead.consentimientoContacto && <p className="vg-consent-warning">No consta consentimiento de contacto. Confírmalo antes de enviar mensajes promocionales.</p>}
        </div>
        <div className="vg-lead-detail-actions">
          {lead.telefono && <a href={`https://wa.me/${lead.telefono.replace(/\D/g, '')}`} onClick={() => onContact(lead)} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>}
          <button type="button" className="is-danger" onClick={() => onDelete(lead._id)}>Eliminar</button>
          <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </m.form>
    </m.div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  useSEO({ title: 'Dashboard – VitaGloss RD', description: 'Panel de gestión para el equipo de ventas VitaGloss RD.' })

  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)

  // Solo admins ven el tab de Precios
  const displayTabs = user?.rol === 'admin' ? TABS_ALL : TABS_ALL.slice(0, 6)

  // stats
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // leads
  const [leads, setLeads] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [leadForm, setLeadForm] = useState({ nombre: '', telefono: '', email: '', productoInteres: '', nota: '', origen: 'whatsapp', tipoInteres: 'cliente', relacion: 'prospecto_cliente', etapaConversion: 'contacto', consentimientoContacto: false, consentimientoOrigen: '', comunidadTipo: 'ninguna', comunidadEstado: 'no_invitado', proximoSeguimiento: '' })
  const [leadFormOpen, setLeadFormOpen] = useState(false)
  const [savingLead, setSavingLead] = useState(false)
  const [leadQuery, setLeadQuery] = useState('')
  const [leadFilter, setLeadFilter] = useState('atencion')
  const [leadDetail, setLeadDetail] = useState(null)
  const [savingLeadDetail, setSavingLeadDetail] = useState(false)

  // sales
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [saleForm, setSaleForm] = useState({ cliente: '', telefono: '', productos: [{ nombre: '', cantidad: 1, precio: '' }], metodoPago: 'transferencia', notas: '' })
  const [saleFormOpen, setSaleFormOpen] = useState(false)
  const [savingSale, setSavingSale] = useState(false)

  // profile
  const [profileForm, setProfileForm] = useState({ nombre: '', descripcion: '', whatsapp: '', metaMensual: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // kanban view toggle
  const [kanbanView, setKanbanView] = useState(false)

  // orders
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [orderEstadoFilter, setOrderEstadoFilter] = useState('')
  const [orderModal, setOrderModal] = useState(false)
  const [orderSaving, setOrderSaving] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const EMPTY_ORDER = { nombre: '', whatsapp: '', direccionEntrega: '', notas: '', pagado: 'pendiente', items: [{ nombre: '', precio: '', cantidad: 1 }] }
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER)

  // invoice
  const [facturaModal, setFacturaModal] = useState(false)
  const [facturaOrder, setFacturaOrder] = useState(null)
  const [facturaEditMode, setFacturaEditMode] = useState(false)
  const [facturaEditData, setFacturaEditData] = useState(null)
  const [savingFactura, setSavingFactura] = useState(false)
  const [facturaDropdownIdx, setFacturaDropdownIdx] = useState(null)

  // templates copy feedback
  const [copied, setCopied] = useState(null)

  // ranking
  const [ranking, setRanking] = useState([])
  const [loadingRanking, setLoadingRanking] = useState(false)

  // team members (para asignación de leads, admin only)
  const [teamMembers, setTeamMembers] = useState([])

  // ── fetch on tab change ──────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    try { const d = await api.getDashboard(); setStats(d) } catch {}
    finally { setLoadingStats(false) }
  }, [])

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true)
    try { const d = await api.getLeads(); setLeads(d.leads || []) } catch {}
    finally { setLoadingLeads(false) }
  }, [])

  const loadSales = useCallback(async () => {
    setLoadingSales(true)
    try { const d = await api.getSales(); setSales(d.sales || []) } catch {}
    finally { setLoadingSales(false) }
  }, [])

  const loadOrders = useCallback(async (estado = '') => {
    setLoadingOrders(true)
    try {
      const q = estado ? `?estado=${estado}` : ''
      const d = await api.getOrders(q)
      setOrders(d.orders || [])
    } catch {}
    finally { setLoadingOrders(false) }
  }, [])

  const loadRanking = useCallback(async () => {
    setLoadingRanking(true)
    try { const d = await api.getTeamRanking(); setRanking(d.ranking || []) } catch {}
    finally { setLoadingRanking(false) }
  }, [])

  const loadTeamMembers = useCallback(async () => {
    if (user?.rol !== 'admin') return
    try { const d = await api.getTeamMembersAdmin(); setTeamMembers(d.members || []) } catch {}
  }, [user?.rol])

  // ── CSV export helpers ─────────────────────────────────────────────────
  const toCSV = (headers, rows) => {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    return [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  }
  const downloadCSV = (csv, filename) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }
  const exportLeadsCSV = () => {
    const h = ['Nombre', 'Teléfono', 'Producto', 'Clasificación', 'Etapa de conversión', 'Registro oficial confirmado', 'Actividad', 'Comunidad', 'Estado comunidad', 'Consentimiento', 'Origen consentimiento', 'Estado de seguimiento', 'Origen', 'Nota', 'Fecha']
    const r = leads.map(l => [l.nombre, l.telefono, l.productoInteres, l.relacion || 'sin_clasificar', l.etapaConversion || 'contacto', l.registroOficial?.confirmado ? 'Sí' : 'No', l.actividadEquipo?.estado || 'no_aplica', l.comunidadTipo || 'ninguna', l.comunidadEstado || 'no_invitado', l.consentimientoContacto ? 'Sí' : 'No', l.consentimientoOrigen || '', l.estado, l.origen, l.nota, new Date(l.createdAt).toLocaleDateString('es-DO')])
    downloadCSV(toCSV(h, r), `leads-${new Date().toISOString().split('T')[0]}.csv`)
  }
  const exportSalesCSV = () => {
    const h = ['Cliente', 'Fecha', 'Total RD$', 'Método Pago', 'Estado', 'Notas']
    const r = sales.map(v => [v.cliente, new Date(v.fecha).toLocaleDateString('es-DO'), v.total, v.metodoPago, v.estado, v.notas])
    downloadCSV(toCSV(h, r), `ventas-${new Date().toISOString().split('T')[0]}.csv`)
  }

  // ── order helpers ──────────────────────────────────────────────────────────
  const orderTotal = (items) => items.reduce((s, i) => s + (Number(i.precio) || 0) * (Number(i.cantidad) || 1), 0)

  const addOrderItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { nombre: '', precio: '', cantidad: 1 }] }))
  const removeOrderItem = (idx) => setOrderForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  const setOrderItem = (idx, field, val) => setOrderForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [field]: val } : it) }))

  const submitOrderAdmin = async (e) => {
    e.preventDefault()
    const items = orderForm.items.filter(i => i.nombre && i.precio)
    if (!items.length) return
    setOrderSaving(true)
    try {
      const mappedItems = items.map(i => ({ nombre: i.nombre, cantidad: Number(i.cantidad) || 1, precio: Number(i.precio) || 0, articulo: i.articulo || '' }))
      const total = orderTotal(items)
      const saved = await api.createOrderAdmin({ ...orderForm, items: mappedItems, total })
      setOrderModal(false)
      // open invoice automatically
      setFacturaOrder({
        _id: saved?.order?._id || saved?._id || ('MANUAL-' + Date.now()),
        invoiceNumber: saved?.order?.invoiceNumber || null,
        nombre: orderForm.nombre,
        whatsapp: orderForm.whatsapp,
        direccionEntrega: orderForm.direccionEntrega,
        notas: orderForm.notas,
        pagado: orderForm.pagado,
        items: mappedItems,
        total,
        createdAt: new Date().toISOString(),
        source: 'manual',
      })
      setFacturaModal(true)
      setOrderForm(EMPTY_ORDER)
      loadOrders(orderEstadoFilter)
    } catch (err) { alert(err.message) }
    finally { setOrderSaving(false) }
  }

  useEffect(() => {
    loadStats()
    loadRanking()
    loadTeamMembers()
  }, [loadStats]) // eslint-disable-line

  useEffect(() => {
    if (tab === 1) loadLeads()
    if (tab === 2) loadSales()
    if (tab === 4) loadOrders()
    if (tab === 5 && user) setProfileForm({ nombre: user.nombre || '', descripcion: user.descripcion || '', whatsapp: user.whatsapp || '', metaMensual: user.metaMensual || 10000 })
  }, [tab]) // eslint-disable-line

  // ── lead actions ─────────────────────────────────────────────────────────
  const submitLead = async (e) => {
    e.preventDefault()
    setSavingLead(true)
    try {
      await api.createLead(leadForm)
      setLeadFormOpen(false)
      setLeadForm({ nombre: '', telefono: '', email: '', productoInteres: '', nota: '', origen: 'whatsapp', tipoInteres: 'cliente', relacion: 'prospecto_cliente', etapaConversion: 'contacto', consentimientoContacto: false, consentimientoOrigen: '', comunidadTipo: 'ninguna', comunidadEstado: 'no_invitado', proximoSeguimiento: '' })
      loadLeads()
    } catch (err) { alert(err.message) }
    finally { setSavingLead(false) }
  }

  const changeLeadEstado = async (id, estado) => {
    try { await api.updateLead(id, { estado }); loadLeads() } catch {}
  }

  const assignLead = async (id, vendedorId) => {
    try { await api.updateLead(id, { vendedor: vendedorId || null }); loadLeads() } catch {}
  }

  const deleteLead = async (id) => {
    if (!confirm('¿Eliminar este lead?')) return
    try { await api.deleteLead(id); loadLeads() } catch {}
  }

  const openLeadDetail = async (lead) => {
    setLeadDetail({
      ...lead,
      relacion: lead.relacion || (['vendedor', 'ambos'].includes(lead.tipoInteres) ? 'prospecto_vendedor' : 'prospecto_cliente'),
      etapaConversion: lead.etapaConversion || 'contacto',
      registroOficial: lead.registroOficial || { confirmado: false },
      actividadEquipo: lead.actividadEquipo || { estado: 'no_aplica', ultimaCompra: null },
      comunidadTipo: lead.comunidadTipo || 'ninguna',
      comunidadEstado: lead.comunidadEstado || 'no_invitado',
      consentimientoOrigen: lead.consentimientoOrigen || '',
      vendedor: lead.vendedor?._id || lead.vendedor || '',
      proximoSeguimiento: lead.proximoSeguimiento ? new Date(lead.proximoSeguimiento).toISOString().slice(0, 16) : '',
    })
    if (!lead.leido) {
      try {
        await api.updateLead(lead._id, { leido: true })
        setLeads(current => current.map(item => item._id === lead._id ? { ...item, leido: true, leidoAt: new Date().toISOString() } : item))
        loadStats()
      } catch { /* La ficha puede abrirse aunque falle el marcado remoto. */ }
    }
  }

  const saveLeadDetail = async (e) => {
    e.preventDefault()
    if (!leadDetail) return
    setSavingLeadDetail(true)
    try {
      await api.updateLead(leadDetail._id, {
        nombre: leadDetail.nombre,
        telefono: leadDetail.telefono,
        email: leadDetail.email,
        productoInteres: leadDetail.productoInteres,
        nota: leadDetail.nota,
        estado: leadDetail.estado,
        tipoInteres: leadDetail.tipoInteres,
        relacion: leadDetail.relacion,
        etapaConversion: leadDetail.etapaConversion,
        registroOficial: leadDetail.registroOficial,
        actividadEquipo: leadDetail.actividadEquipo,
        comunidadTipo: leadDetail.comunidadTipo,
        comunidadEstado: leadDetail.comunidadEstado,
        consentimientoContacto: leadDetail.consentimientoContacto,
        consentimientoOrigen: leadDetail.consentimientoOrigen,
        proximoSeguimiento: leadDetail.proximoSeguimiento || null,
        vendedor: leadDetail.vendedor || null,
        leido: true,
      })
      setLeadDetail(null)
      loadLeads()
      loadStats()
    } catch (err) { alert(err.message) }
    finally { setSavingLeadDetail(false) }
  }

  const markAllLeadsSeen = async () => {
    try {
      await api.markLeadsSeen()
      setLeads(current => current.map(lead => ({ ...lead, leido: true, leidoAt: lead.leidoAt || new Date().toISOString() })))
      loadStats()
    } catch { /* Conserva la bandeja disponible si falla el marcado masivo. */ }
  }

  const registerLeadContact = async (lead) => {
    const update = { ultimoContacto: new Date().toISOString(), leido: true }
    if (lead.estado === 'nuevo') update.estado = 'contactado'
    try {
      await api.updateLead(lead._id, update)
      setLeads(current => current.map(item => item._id === lead._id ? { ...item, ...update } : item))
      loadStats()
    } catch { /* WhatsApp debe poder abrir aunque falle el registro de contacto. */ }
  }

  // ── sale actions ─────────────────────────────────────────────────────────
  const addProductoRow = () => setSaleForm(f => ({ ...f, productos: [...f.productos, { nombre: '', cantidad: 1, precio: '' }] }))
  const removeProductoRow = (i) => setSaleForm(f => ({ ...f, productos: f.productos.filter((_, idx) => idx !== i) }))
  const updateProductoRow = (i, field, val) => setSaleForm(f => {
    const p = [...f.productos]; p[i] = { ...p[i], [field]: val }
    return { ...f, productos: p }
  })

  const calcTotal = () => saleForm.productos.reduce((sum, p) => sum + (parseFloat(p.precio) || 0) * (parseInt(p.cantidad) || 1), 0)

  const submitSale = async (e) => {
    e.preventDefault()
    setSavingSale(true)
    try {
      await api.createSale({ ...saleForm, total: calcTotal() })
      setSaleFormOpen(false)
      setSaleForm({ cliente: '', telefono: '', productos: [{ nombre: '', cantidad: 1, precio: '' }], metodoPago: 'transferencia', notas: '' })
      loadSales()
      loadStats()
    } catch (err) { alert(err.message) }
    finally { setSavingSale(false) }
  }

  // ── profile ──────────────────────────────────────────────────────────────
  const submitProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    try {
      const updated = await api.updateProfile(profileForm)
      updateUser(updated.user)
      setProfileMsg('¡Perfil actualizado correctamente!')
    } catch (err) { setProfileMsg('Error: ' + err.message) }
    finally { setSavingProfile(false) }
  }

  const handleLogout = () => { logout(); navigate('/equipo') }

  // ── template copy ────────────────────────────────────────────────────────
  const handleCopy = (msg, i) => {
    copyToClipboard(msg)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  const now = Date.now()
  const needsLeadAttention = lead => {
    if (['cerrado', 'perdido'].includes(lead.estado)) return false
    const overdue = lead.proximoSeguimiento && new Date(lead.proximoSeguimiento).getTime() < now
    const untouched = lead.estado === 'nuevo' && now - new Date(lead.createdAt).getTime() > 24 * 60 * 60 * 1000
    return !lead.leido || overdue || untouched
  }
  const filteredLeads = leads.filter(lead => {
    const query = leadQuery.trim().toLowerCase()
    const matchesQuery = !query || [lead.nombre, lead.telefono, lead.email, lead.productoInteres, lead.campana?.name, lead.ciudad].some(value => String(value || '').toLowerCase().includes(query))
    const matchesFilter = leadFilter === 'todos'
      || (leadFilter === 'atencion' && needsLeadAttention(lead))
      || (leadFilter === 'sin-asignar' && !lead.vendedor)
      || (leadFilter === 'prospectos-vendedor' && lead.relacion === 'prospecto_vendedor')
      || (leadFilter === 'miembros-equipo' && lead.registroOficial?.confirmado === true)
      || (leadFilter === 'miembros-activos' && lead.registroOficial?.confirmado === true && lead.actividadEquipo?.estado === 'activo')
      || (leadFilter === 'clientes' && lead.relacion === 'cliente')
      || (leadFilter === 'comunidad-clientes' && lead.comunidadTipo === 'clientes' && ['aceptado', 'activo'].includes(lead.comunidadEstado))
      || (leadFilter === 'comunidad-negocio' && lead.comunidadTipo === 'orientacion_negocio' && ['aceptado', 'activo'].includes(lead.comunidadEstado))
      || (leadFilter === 'comunidad-equipo' && lead.comunidadTipo === 'equipo_ibo' && ['aceptado', 'activo'].includes(lead.comunidadEstado))
      || lead.estado === leadFilter
    return matchesQuery && matchesFilter
  })
  const unreadLeads = leads.filter(lead => !lead.leido).length
  const overdueLeads = leads.filter(lead => lead.proximoSeguimiento && new Date(lead.proximoSeguimiento).getTime() < now && !['cerrado', 'perdido'].includes(lead.estado)).length

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="vg-dashboard">
      <aside className="vg-sidebar">
        <button className="vg-sidebar-brand" onClick={() => navigate('/')} aria-label="Ir a la tienda VitaGloss RD">
          <span className="vg-brand-mark">VG</span>
          <span>
            <strong>VitaGloss RD</strong>
            <small>Centro de ventas</small>
          </span>
        </button>

        <div className="vg-sidebar-section-label">Espacio de trabajo</div>
        <nav className="vg-sidebar-nav" aria-label="Navegación del panel">
          {displayTabs.map((item, i) => (
            <button key={item.label} onClick={() => setTab(i)} className={tab === i ? 'is-active' : ''} aria-current={tab === i ? 'page' : undefined}>
              <DashboardIcon name={item.icon} />
              <span>{item.label}</span>
              {i === 1 && (stats?.leads?.sinLeer || 0) > 0 && (
                <span className="vg-nav-badge">{stats.leads.sinLeer > 9 ? '9+' : stats.leads.sinLeer}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="vg-sidebar-links">
          <button onClick={() => navigate('/academia')}><DashboardIcon name="academy" /><span>Academia</span></button>
          <button onClick={() => navigate('/')}><DashboardIcon name="home" /><span>Ver tienda</span><DashboardIcon name="external" className="h-4 w-4 ml-auto" /></button>
        </div>

        <div className="vg-sidebar-user">
          <div className="vg-avatar">{user?.nombre?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || '?'}</div>
          <div className="min-w-0">
            <strong>{user?.nombre}</strong>
            <span>{user?.rol === 'admin' ? 'Administrador' : 'Vendedor'}</span>
          </div>
          <button onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><DashboardIcon name="logout" /></button>
        </div>
      </aside>

      <div className="vg-dashboard-main">
        <header className="vg-mobile-header">
          <button className="vg-sidebar-brand" onClick={() => navigate('/')} aria-label="Ir a la tienda VitaGloss RD">
            <span className="vg-brand-mark">VG</span>
            <span><strong>VitaGloss RD</strong><small>Centro de ventas</small></span>
          </button>
          <div className="vg-avatar">{user?.nombre?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || '?'}</div>
        </header>

        <div className="vg-mobile-nav" role="navigation" aria-label="Navegación móvil del panel">
          {displayTabs.map((item, i) => (
            <button key={item.label} onClick={() => setTab(i)} className={tab === i ? 'is-active' : ''}>
              <DashboardIcon name={item.icon} />
              <span>{item.label}</span>
              {i === 1 && (stats?.leads?.sinLeer || 0) > 0 && <i>{stats.leads.sinLeer > 9 ? '9+' : stats.leads.sinLeer}</i>}
            </button>
          ))}
        </div>

        <main className="vg-dashboard-content">

        {/* ── TAB 0: RESUMEN ─────────────────────────────────────────────── */}
        {tab === 0 && (
          <Section>
            {/* Saludo personalizado */}
            <div className="vg-welcome-card">
              <div className="vg-welcome-copy">
                <p className="vg-eyebrow">
                  {new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1>Buen día, {user?.nombre?.split(' ')[0]}</h1>
                <p>Estas son las señales más importantes de tu negocio hoy.</p>
              </div>
              <div className="vg-welcome-status">
                <span><i /> Sistema actualizado</span>
                <strong>{new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Nuevo lead', icon: 'users', desc: 'Agregar prospecto', action: () => { setTab(1); setTimeout(() => setLeadFormOpen(true), 100) } },
                { label: 'Nueva venta', icon: 'sales', desc: 'Registrar ingreso', action: () => { setTab(2); setTimeout(() => setSaleFormOpen(true), 100) } },
                { label: 'Plantillas', icon: 'message', desc: 'Abrir mensajes', action: () => setTab(3) },
                { label: 'Academia', icon: 'academy', desc: 'Seguir aprendiendo', action: () => navigate('/academia') },
              ].map(({ label, icon, desc, action }) => (
                <button key={label} onClick={action}
                  className="vg-quick-action">
                  <span><DashboardIcon name={icon} /></span>
                  <div><strong>{label}</strong><small>{desc}</small></div>
                  <DashboardIcon name="external" className="h-4 w-4 ml-auto" />
                </button>
              ))}
            </div>

            {loadingStats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl h-32 animate-pulse" />)}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard titulo="Ventas este mes" valor={`RD$ ${(stats.ventas?.totalMes || 0).toLocaleString()}`} icono="sales" sub={`${stats.ventas?.cantidadMes || 0} transacciones`} color="green" />
                  <StatCard titulo="Crecimiento" valor={`${stats.ventas?.crecimiento >= 0 ? '+' : ''}${stats.ventas?.crecimiento || 0}%`} icono="trend" sub="vs mes anterior" color="purple" />
                  <StatCard titulo="Leads activos" valor={stats.leads?.total || 0} icono="users" sub={`${stats.leads?.cerrados || 0} cerrados`} color="orange" />
                  <StatCard titulo="Conversión" valor={`${stats.leads?.tasaConversion || 0}%`} icono="target" sub="leads a ventas" color="primary" />
                </div>

                {/* Progress bar meta — más prominente */}
                {stats.ventas?.meta > 0 && (
                  <div className="bg-gradient-to-r from-[#0a1628] to-[#1B3A6B] rounded-3xl p-6 mb-6 text-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">Meta del mes</p>
                        <p className="font-black text-2xl">RD$ {(stats.ventas.totalMes || 0).toLocaleString()}</p>
                        <p className="text-white/40 text-xs mt-0.5">de RD$ {stats.ventas.meta.toLocaleString()} objetivo</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-4xl text-secondary">{stats.ventas.progreso}%</p>
                        {stats.ventas.progreso < 100 && (
                          <p className="text-white/40 text-xs mt-0.5">Faltan RD$ {Math.max(0, stats.ventas.meta - (stats.ventas.totalMes || 0)).toLocaleString()}</p>
                        )}
                        {stats.ventas.progreso >= 100 && <p className="text-emerald-400 text-xs font-bold mt-0.5">✅ ¡Meta cumplida!</p>}
                      </div>
                    </div>
                    <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-700 ${stats.ventas.progreso >= 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-secondary to-teal-400'}`}
                        style={{ width: `${Math.min(stats.ventas.progreso, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Últimas ventas */}
                {stats.ultimos?.ventas?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-6">
                    <h3 className="font-black text-primary mb-4">Últimas ventas</h3>
                    <div className="divide-y divide-gray-50">
                      {stats.ultimos.ventas.map(v => (
                        <div key={v._id} className="flex justify-between items-center py-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{v.cliente}</p>
                            <p className="text-gray-400 text-xs">{new Date(v.fecha).toLocaleDateString('es-DO')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-secondary text-sm">RD$ {v.total.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_VENTA[v.estado] || ''}`}>{v.estado}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Últimos leads */}
                {stats.ultimos?.leads?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-6">
                    <h3 className="font-black text-primary mb-4">Últimos leads</h3>
                    <div className="divide-y divide-gray-50">
                      {stats.ultimos.leads.map(l => (
                        <div key={l._id} className="flex justify-between items-center py-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{l.nombre}</p>
                            <p className="text-gray-400 text-xs">{l.productoInteres || 'Sin producto'}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_LEAD[l.estado] || ''}`}>{l.estado}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ranking del equipo */}
                {ranking.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100">
                    <h3 className="font-black text-primary mb-4">🏆 Ranking del equipo — este mes</h3>
                    <div className="space-y-3">
                      {ranking.map((r, i) => {
                        const medals = ['🥇', '🥈', '🥉']
                        const w = ranking[0].total > 0 ? (r.total / ranking[0].total) * 100 : 0
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-lg w-6 flex-shrink-0 text-center">{medals[i] || `${i + 1}.`}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold text-gray-800 text-sm truncate">{r.nombre}</p>
                                <p className="font-black text-secondary text-sm flex-shrink-0 ml-2">RD$ {r.total.toLocaleString()}</p>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-2 rounded-full ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-primary/40'}`}
                                  style={{ width: `${w}%` }} />
                              </div>
                              <p className="text-gray-400 text-xs mt-0.5">{r.ventas} {r.ventas === 1 ? 'venta' : 'ventas'}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-3" aria-hidden="true">📡</p>
                <p className="text-gray-500">No se pudieron cargar las estadísticas.</p>
                <button onClick={loadStats} className="mt-4 text-sm text-secondary font-semibold hover:underline">Reintentar</button>
              </div>
            )}

          </Section>
        )}

        {/* ── TAB 1: LEADS ───────────────────────────────────────────────── */}
        {tab === 1 && (
          <Section>
            <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
              <div>
                <p className="vg-eyebrow !text-secondary mb-2">Relaciones comerciales</p>
                <h2 className="text-3xl font-black text-primary tracking-tight">Prospectos, clientes y equipo</h2>
                <p className="text-gray-500 text-sm mt-1">Separa contactos de campaña, clientes reales y registros oficiales confirmados.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {leads.length > 0 && (
                  <button onClick={exportLeadsCSV} className="border border-gray-200 text-gray-600 hover:bg-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                    Exportar CSV
                  </button>
                )}
                <button onClick={() => setLeadFormOpen(true)}
                  className="bg-primary hover:bg-[#102d58] text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all">
                  <DashboardIcon name="plus" className="h-4 w-4" /> Nuevo lead
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[
                ['Por atender', leads.filter(needsLeadAttention).length, 'Requieren una acción'],
                ['Sin revisar', unreadLeads, 'Entraron recientemente'],
                ['Seguimiento vencido', overdueLeads, 'Fecha ya cumplida'],
                ['Equipo confirmado', stats?.leads?.miembrosConfirmados || leads.filter(l => l.registroOficial?.confirmado).length, `${stats?.leads?.miembrosActivos || 0} activos`],
              ].map(([label, value, hint], index) => (
                <div key={label} className={`vg-lead-metric ${index === 0 && Number(value) > 0 ? 'is-priority' : ''}`}>
                  <p>{label}</p><strong>{value}</strong><span>{hint}</span>
                </div>
              ))}
            </div>

            {unreadLeads > 0 && (
              <div className="vg-lead-alert" role="status">
                <span className="vg-lead-alert-dot" />
                <div><strong>Tienes {unreadLeads} {unreadLeads === 1 ? 'lead nuevo sin revisar' : 'leads nuevos sin revisar'}</strong><p>Abre cada ficha para atenderla o márcalos como revisados.</p></div>
                <button onClick={markAllLeadsSeen}>Marcar revisados</button>
              </div>
            )}

            <div className="vg-lead-toolbar">
              <input value={leadQuery} onChange={e => setLeadQuery(e.target.value)} placeholder="Buscar por nombre, teléfono, interés o campaña" aria-label="Buscar leads" />
              <select value={leadFilter} onChange={e => setLeadFilter(e.target.value)} aria-label="Filtrar leads">
                <option value="atencion">Requieren atención</option>
                <option value="todos">Todos los leads</option>
                <option value="prospectos-vendedor">Prospectos de negocio</option>
                <option value="miembros-equipo">Equipo confirmado</option>
                <option value="miembros-activos">Equipo activo</option>
                <option value="clientes">Clientes confirmados</option>
                <option value="comunidad-clientes">Comunidad · clientes</option>
                <option value="comunidad-negocio">Comunidad · orientación</option>
                <option value="comunidad-equipo">Comunidad · equipo IBO</option>
                <option value="nuevo">Nuevos</option>
                <option value="contactado">Contactados</option>
                <option value="interesado">Interesados</option>
                <option value="cerrado">Cerrados</option>
                <option value="perdido">Perdidos</option>
                {user?.rol === 'admin' && <option value="sin-asignar">Sin asignar</option>}
              </select>
              <div className="vg-view-toggle">
                <button onClick={() => setKanbanView(false)} className={!kanbanView ? 'is-active' : ''}>Lista</button>
                <button onClick={() => setKanbanView(true)} className={kanbanView ? 'is-active' : ''}>Pipeline</button>
              </div>
            </div>

            {/* Form modal */}
            <AnimatePresence>
              {leadFormOpen && (
                <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-6 border border-secondary/30 mb-6 shadow-lg">
                  <h3 className="font-black text-primary mb-4">Nuevo lead</h3>
                  <form onSubmit={submitLead} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required placeholder="Nombre del cliente *" value={leadForm.nombre} onChange={e => setLeadForm(f => ({ ...f, nombre: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    <input placeholder="Teléfono" value={leadForm.telefono} onChange={e => setLeadForm(f => ({ ...f, telefono: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    <input type="email" placeholder="Correo electrónico" value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    <input placeholder="Producto de interés" value={leadForm.productoInteres} onChange={e => setLeadForm(f => ({ ...f, productoInteres: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    <select value={leadForm.tipoInteres} onChange={e => setLeadForm(f => ({ ...f, tipoInteres: e.target.value, relacion: e.target.value === 'vendedor' ? 'prospecto_vendedor' : f.relacion }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary">
                      <option value="cliente">Interés en productos</option>
                      <option value="vendedor">Interés en negocio independiente</option>
                      <option value="ambos">Productos y negocio</option>
                      <option value="otro">Otro interés</option>
                    </select>
                    <select value={leadForm.relacion} onChange={e => setLeadForm(f => ({ ...f, relacion: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary">
                      {RELACIONES.slice(0, 2).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select value={leadForm.comunidadTipo} onChange={e => setLeadForm(f => ({ ...f, comunidadTipo: e.target.value, comunidadEstado: e.target.value === 'ninguna' ? 'no_invitado' : f.comunidadEstado }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary">
                      {COMUNIDADES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select value={leadForm.comunidadEstado} onChange={e => setLeadForm(f => ({ ...f, comunidadEstado: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary">
                      {ESTADOS_COMUNIDAD.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <select value={leadForm.origen} onChange={e => setLeadForm(f => ({ ...f, origen: e.target.value }))}
                      className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary">
                      {['whatsapp','referido','web','instagram','facebook','campana','otro'].map(o => <option key={o}>{o}</option>)}
                    </select>
                    <label className="text-xs font-bold text-gray-500">
                      Próximo seguimiento
                      <input type="datetime-local" value={leadForm.proximoSeguimiento} onChange={e => setLeadForm(f => ({ ...f, proximoSeguimiento: e.target.value }))}
                        className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-normal focus:outline-none focus:border-primary" />
                    </label>
                    <textarea placeholder="Nota adicional" value={leadForm.nota} onChange={e => setLeadForm(f => ({ ...f, nota: e.target.value }))}
                      rows={2} className="sm:col-span-2 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary" />
                    <label className="sm:col-span-2 flex items-start gap-3 text-xs text-gray-500 bg-gray-50 rounded-2xl p-4">
                      <input type="checkbox" checked={leadForm.consentimientoContacto} onChange={e => setLeadForm(f => ({ ...f, consentimientoContacto: e.target.checked, consentimientoOrigen: e.target.checked ? (f.consentimientoOrigen || 'verbal') : '' }))} className="mt-0.5" />
                      La persona autorizó recibir seguimiento por los datos proporcionados. Registra este consentimiento antes de enviar mensajes.
                    </label>
                    {leadForm.consentimientoContacto && (
                      <label className="sm:col-span-2 text-xs font-bold text-gray-500">
                        Fuente del consentimiento
                        <select value={leadForm.consentimientoOrigen} onChange={e => setLeadForm(f => ({ ...f, consentimientoOrigen: e.target.value }))}
                          className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-normal focus:outline-none focus:border-primary">
                          {ORIGENES_CONSENTIMIENTO.filter(([value]) => value).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </label>
                    )}
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" disabled={savingLead}
                        className="bg-primary text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all hover:scale-105 disabled:opacity-60">
                        {savingLead ? 'Guardando…' : 'Guardar lead'}
                      </button>
                      <button type="button" onClick={() => setLeadFormOpen(false)}
                        className="bg-gray-100 text-gray-600 font-semibold px-6 py-3 rounded-2xl text-sm transition-all hover:bg-gray-200">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </m.div>
              )}
            </AnimatePresence>

            {loadingLeads ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl h-20 animate-pulse border border-gray-100" />)}</div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <p className="font-black text-primary text-xl mb-2">Tu bandeja de leads está vacía</p>
                <p className="text-gray-500 mb-4">Los contactos de formularios y campañas aparecerán aquí.</p>
                <button onClick={() => setLeadFormOpen(true)} className="text-sm text-secondary font-semibold hover:underline">+ Agregar primer lead</button>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
                <p className="font-black text-primary text-lg mb-2">No hay resultados con este filtro</p>
                <p className="text-gray-500 text-sm mb-4">Prueba otra búsqueda o revisa todos los leads.</p>
                <button onClick={() => { setLeadQuery(''); setLeadFilter('todos') }} className="text-sm text-secondary font-bold">Mostrar todos</button>
              </div>
            ) : kanbanView ? (
              /* ── KANBAN BOARD ── */
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {ESTADO_LEAD.map(estado => {
                    const col = { nuevo: { label: 'Nuevos', color: 'bg-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' }, contactado: { label: 'Contactados', color: 'bg-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' }, interesado: { label: 'Interesados', color: 'bg-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' }, cerrado: { label: 'Cerrados', color: 'bg-green-500', bg: 'bg-green-50', border: 'border-green-200' }, perdido: { label: 'Perdidos', color: 'bg-red-400', bg: 'bg-red-50', border: 'border-red-200' } }[estado]
                    const colLeads = filteredLeads.filter(l => l.estado === estado)
                    return (
                      <div key={estado} className={`w-64 flex-shrink-0 rounded-2xl border ${col.border} ${col.bg} p-3`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                          <span className="font-bold text-sm text-gray-700">{col.label}</span>
                          <span className="ml-auto bg-white border border-gray-200 text-gray-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{colLeads.length}</span>
                        </div>
                        <div className="space-y-2 min-h-[60px]">
                          {colLeads.map(l => (
                            <button type="button" key={l._id} onClick={() => openLeadDetail(l)} className={`w-full text-left bg-white rounded-xl p-3 border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${!l.leido ? 'border-secondary/50' : 'border-white'}`}>
                        <div className="flex items-center gap-2"><p className="font-semibold text-gray-800 text-sm leading-tight">{l.nombre}</p>{!l.leido && <span className="w-2 h-2 bg-secondary rounded-full" title="Sin revisar" />}</div>
                              <span className="vg-relation-chip">{RELACIONES.find(([value]) => value === l.relacion)?.[1] || 'Prospecto'}</span>
                              {l.productoInteres && <p className="text-gray-400 text-xs mb-2 truncate">{l.productoInteres}</p>}
                              <div className="flex items-center justify-between gap-2 mt-3"><span className="text-[10px] text-gray-400 capitalize">{l.campana?.name || l.origen}</span><span className="text-[10px] font-bold text-primary">Abrir ficha</span></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* ── TABLA LISTA ── */
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className={`hidden sm:grid px-6 py-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 ${user?.rol === 'admin' ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  <span>Cliente</span><span>Producto</span><span>Origen</span><span>Estado</span>
                  {user?.rol === 'admin' && <span>Asignado a</span>}
                  <span></span>
                </div>
                <div className="divide-y divide-gray-50">
                  {filteredLeads.map(l => (
                    <div key={l._id} className={`relative grid grid-cols-1 gap-2 px-6 py-4 items-center hover:bg-gray-50 ${!l.leido ? 'bg-teal-50/30' : ''} ${user?.rol === 'admin' ? 'sm:grid-cols-6 sm:gap-0' : 'sm:grid-cols-5 sm:gap-0'}`}>
                      <div>
                        <div className="flex items-center gap-2"><p className="font-semibold text-gray-800 text-sm">{l.nombre}</p>{!l.leido && <span className="w-2 h-2 bg-secondary rounded-full" title="Sin revisar" />}</div>
                        {l.telefono && (
                          <a href={`https://wa.me/${l.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                            onClick={() => registerLeadContact(l)} className="text-green-700 text-xs hover:underline">{l.telefono}</a>
                        )}
                        {l.email && <p className="text-gray-400 text-xs truncate max-w-[180px]">{l.email}</p>}
                      </div>
                      <div><p className="text-gray-600 text-xs">{l.productoInteres || '—'}</p><span className="vg-relation-chip">{RELACIONES.find(([value]) => value === l.relacion)?.[1] || (l.tipoInteres === 'vendedor' ? 'Prospecto de negocio' : 'Prospecto de productos')}</span></div>
                      <div><span className="text-gray-500 text-xs capitalize">{l.campana?.name || l.origen}</span>{l.proximoSeguimiento && <p className={`text-[10px] mt-1 ${new Date(l.proximoSeguimiento).getTime() < now ? 'text-red-600 font-bold' : 'text-gray-400'}`}>{new Date(l.proximoSeguimiento).toLocaleString('es-DO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}</div>
                      <select value={l.estado} onChange={e => changeLeadEstado(l._id, e.target.value)} aria-label="Cambiar estado del lead"
                        className={`text-xs font-bold px-2 py-1.5 rounded-xl border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 ${BADGE_LEAD[l.estado] || 'bg-gray-100'}`}>
                        {ESTADO_LEAD.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {user?.rol === 'admin' && (
                        <select
                          value={l.vendedor?._id || l.vendedor || ''}
                          onChange={e => assignLead(l._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:border-primary"
                          aria-label="Asignar a vendedor"
                        >
                          <option value="">Sin asignar</option>
                          {teamMembers.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                        </select>
                      )}
                      <button onClick={() => openLeadDetail(l)} aria-label={`Abrir ficha de ${l.nombre}`}
                        className="text-primary hover:text-secondary text-xs font-bold transition-colors justify-self-end">
                        Ver ficha
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence>
              {leadDetail && (
                <LeadDetailModal
                  lead={leadDetail}
                  setLead={setLeadDetail}
                  onClose={() => setLeadDetail(null)}
                  onSave={saveLeadDetail}
                  onContact={registerLeadContact}
                  onDelete={async id => { await deleteLead(id); setLeadDetail(null) }}
                  saving={savingLeadDetail}
                  isAdmin={user?.rol === 'admin'}
                  teamMembers={teamMembers}
                />
              )}
            </AnimatePresence>
          </Section>
        )}

        {/* ── TAB 2: MY SHOP ─────────────────────────────────────────────── */}
        {tab === 2 && (
          <Section>
            <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
              <div><p className="vg-eyebrow !text-secondary mb-2">Clientes y recompra</p><h2 className="text-3xl font-black text-primary">My Shop</h2><p className="text-gray-500 text-sm mt-1">Registra ventas reales a clientes y detecta oportunidades de seguimiento.</p></div>
              <div className="flex items-center gap-2">
                {sales.length > 0 && (
                  <button onClick={exportSalesCSV} className="border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                    ⬇️ Exportar CSV
                  </button>
                )}
                <button onClick={() => setSaleFormOpen(true)}
                  className="bg-secondary hover:bg-teal-500 text-white text-sm font-bold px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105">
                  <span aria-hidden="true">+</span> Nueva venta
                </button>
              </div>
            </div>

            {(() => {
              const customerMap = new Map()
              sales.filter(sale => sale.estado !== 'cancelado').forEach(sale => {
                const key = (sale.telefono || sale.cliente || '').trim().toLowerCase()
                const current = customerMap.get(key) || { compras: 0, total: 0 }
                current.compras += 1
                current.total += sale.total || 0
                customerMap.set(key, current)
              })
              const total = sales.filter(sale => sale.estado !== 'cancelado').reduce((sum, sale) => sum + (sale.total || 0), 0)
              const recurrentes = [...customerMap.values()].filter(customer => customer.compras > 1).length
              return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{[
                ['Clientes', customerMap.size, 'Compradores identificados'],
                ['Ventas registradas', sales.length, 'Historial de My Shop'],
                ['Ingresos', `RD$ ${total.toLocaleString()}`, 'Sin ventas canceladas'],
                ['Clientes recurrentes', recurrentes, 'Más de una compra'],
              ].map(([label, value, hint]) => <div key={label} className="vg-lead-metric"><p>{label}</p><strong>{value}</strong><span>{hint}</span></div>)}</div>
            })()}

            <div className="vg-shop-note"><DashboardIcon name="orders" className="h-5 w-5" /><div><strong>Separación comercial activa</strong><p>Las ventas de esta sección corresponden a clientes. Los candidatos y miembros del equipo se administran en “Prospectos y equipo”.</p></div></div>

            {/* Sale form */}
            <AnimatePresence>
              {saleFormOpen && (
                <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl p-6 border border-secondary/30 mb-6 shadow-lg">
                  <h3 className="font-black text-primary mb-4">Registrar venta</h3>
                  <form onSubmit={submitSale}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <input required placeholder="Nombre del cliente *" value={saleForm.cliente} onChange={e => setSaleForm(f => ({ ...f, cliente: e.target.value }))}
                        className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-secondary" />
                      <input placeholder="Teléfono" value={saleForm.telefono} onChange={e => setSaleForm(f => ({ ...f, telefono: e.target.value }))}
                        className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-secondary" />
                    </div>

                    {/* Productos */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-bold text-gray-600">Productos</p>
                        <button type="button" onClick={addProductoRow} className="text-xs text-secondary font-bold hover:underline">+ Añadir producto</button>
                      </div>
                      {saleForm.productos.map((p, i) => (
                        <div key={i} className="grid grid-cols-6 gap-2 mb-2">
                          <input placeholder="Producto" value={p.nombre} onChange={e => updateProductoRow(i, 'nombre', e.target.value)}
                            className="col-span-3 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary" />
                          <input type="number" min={1} placeholder="Cant." value={p.cantidad} onChange={e => updateProductoRow(i, 'cantidad', e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary" />
                          <input type="number" min={0} placeholder="RD$" value={p.precio} onChange={e => updateProductoRow(i, 'precio', e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-secondary" />
                          <button type="button" onClick={() => removeProductoRow(i)} disabled={saleForm.productos.length === 1}
                            className="text-red-400 hover:text-red-600 text-sm disabled:opacity-30">✕</button>
                        </div>
                      ))}
                      <div className="text-right text-sm font-black text-secondary mt-1">
                        Total: RD$ {calcTotal().toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <select value={saleForm.metodoPago} onChange={e => setSaleForm(f => ({ ...f, metodoPago: e.target.value }))}
                        className="border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-secondary">
                        {METODO_PAGO.map(m => <option key={m}>{m}</option>)}
                      </select>
                      <textarea placeholder="Notas adicionales" value={saleForm.notas} onChange={e => setSaleForm(f => ({ ...f, notas: e.target.value }))}
                        rows={1} className="border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-secondary" />
                    </div>

                    <div className="flex gap-3">
                      <button type="submit" disabled={savingSale}
                        className="bg-secondary text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all hover:scale-105 disabled:opacity-60">
                        {savingSale ? 'Guardando…' : 'Registrar venta'}
                      </button>
                      <button type="button" onClick={() => setSaleFormOpen(false)}
                        className="bg-gray-100 text-gray-600 font-semibold px-6 py-3 rounded-2xl text-sm hover:bg-gray-200">Cancelar</button>
                    </div>
                  </form>
                </m.div>
              )}
            </AnimatePresence>

            {loadingSales ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl h-20 animate-pulse border border-gray-100" />)}</div>
            ) : sales.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <p className="text-4xl mb-3" aria-hidden="true">💰</p>
                <p className="text-gray-500 mb-4">No hay ventas registradas aún.</p>
                <button onClick={() => setSaleFormOpen(true)} className="text-sm text-secondary font-semibold hover:underline">+ Registrar primera venta</button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="hidden sm:grid grid-cols-5 px-6 py-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <span>Cliente</span><span>Fecha</span><span>Total</span><span>Pago</span><span>Estado</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {sales.map(v => (
                    <div key={v._id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-0 px-6 py-4 items-center hover:bg-gray-50">
                      <p className="font-semibold text-gray-800 text-sm">{v.cliente}</p>
                      <p className="text-gray-400 text-xs">{new Date(v.fecha).toLocaleDateString('es-DO')}</p>
                      <p className="font-black text-secondary text-sm">RD$ {v.total.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs capitalize">{v.metodoPago}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${BADGE_VENTA[v.estado] || ''}`}>{v.estado}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── TAB 3: PLANTILLAS ──────────────────────────────────────────── */}
        {tab === 3 && (
          <Section>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-primary mb-1">Plantillas WhatsApp</h2>
              <p className="text-gray-500 text-sm">Mensajes organizados por etapa del proceso de venta. Copia con un clic.</p>
            </div>
            <div className="space-y-8">
              {WA_TEMPLATES_BY_STAGE.map((stage, si) => {
                const baseIdx = WA_TEMPLATES_BY_STAGE.slice(0, si).reduce((s, g) => s + g.plantillas.length, 0)
                return (
                  <div key={si}>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-black text-gray-800 text-base">{stage.etapa}</h3>
                      <span className="text-gray-400 text-xs">{stage.desc}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stage.plantillas.map((t, i) => {
                        const idx = baseIdx + i
                        return (
                          <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-black text-primary text-sm">{t.producto}</h4>
                              <span className="text-xl" aria-hidden="true">💬</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4 bg-gray-50 rounded-2xl p-3 whitespace-pre-line line-clamp-4">{t.msg}</p>
                            <button
                              onClick={() => handleCopy(t.msg, idx)}
                              className={`w-full py-2.5 rounded-2xl text-sm font-bold transition-all ${
                                copied === idx ? 'bg-green-700 text-white' : 'bg-primary/5 hover:bg-primary text-primary hover:text-white'
                              }`}
                              aria-label={`Copiar plantilla: ${t.producto}`}
                            >
                              {copied === idx ? '✓ Copiado!' : '📋 Copiar mensaje'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {tab === 4 && (
          <Section>
            {/* ── TAB 5: PEDIDOS ─────────────────────────────────────────── */}
            {(() => {
              const hoy = new Date().toDateString()
              const pedidosHoy = orders.filter(o => new Date(o.createdAt).toDateString() === hoy)
              const pendientes = orders.filter(o => !['entregado','cancelado'].includes(o.estado))
              const ingresosHoy = pedidosHoy.reduce((s, o) => s + o.total, 0)
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total pedidos', val: orders.length, color: 'bg-primary/10 text-primary' },
                    { label: 'Hoy', val: pedidosHoy.length, color: 'bg-blue-50 text-blue-700' },
                    { label: 'Activos', val: pendientes.length, color: 'bg-amber-50 text-amber-700' },
                    { label: 'Ingresos hoy', val: `RD$${ingresosHoy.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
                  ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                      <p className="text-2xl font-black">{s.val}</p>
                      <p className="text-xs font-semibold opacity-70 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Header + controles */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-2xl font-black text-primary">Pedidos</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={orderEstadoFilter}
                  onChange={e => { setOrderEstadoFilter(e.target.value); loadOrders(e.target.value) }}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Todos los estados</option>
                  {ORDER_ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button onClick={() => loadOrders(orderEstadoFilter)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 transition-colors">🔄</button>
                <button
                  onClick={() => setOrderModal(true)}
                  className="bg-primary text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-blue-900 transition-colors flex items-center gap-2"
                >
                  ＋ Nuevo pedido
                </button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-3">📦</p>
                <p className="text-gray-400 font-medium">No hay pedidos aún</p>
                <p className="text-gray-300 text-sm mt-1">Crea un pedido manualmente o espera uno del carrito web</p>
                <button onClick={() => setOrderModal(true)} className="mt-4 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-blue-900 transition-colors">＋ Crear primer pedido</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map(order => {
                  const estadoInfo = ORDER_ESTADOS.find(s => s.value === order.estado) || ORDER_ESTADOS[0]
                  const pagoInfo = ORDER_PAGO.find(p => p.value === (order.pagado || 'pendiente')) || ORDER_PAGO[0]
                  return (
                    <div key={order._id} className="bg-white rounded-3xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                      {/* Header de la card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-black text-gray-800 truncate">{order.nombre}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.source === 'manual' ? 'bg-gray-100 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
                              {order.source === 'manual' ? '✏️ Manual' : '🛒 Web'}
                            </span>
                            {order.refCode && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">ref: {order.refCode}</span>}
                          </div>
                          {order.whatsapp && (
                            <a href={`https://wa.me/${order.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                              className="text-green-600 text-sm font-semibold hover:underline inline-flex items-center gap-1">
                              📲 {order.whatsapp}
                            </a>
                          )}
                          {order.direccionEntrega && <p className="text-gray-400 text-xs mt-0.5 truncate">📍 {order.direccionEntrega}</p>}
                          <p className="text-gray-300 text-xs mt-1">{new Date(order.createdAt).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-black text-primary mb-2">RD${order.total.toLocaleString()}</p>
                          {/* Estado */}
                          <select
                            value={order.estado}
                            onChange={async e => { await api.updateOrder(order._id, { estado: e.target.value }); loadOrders(orderEstadoFilter) }}
                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer mb-1 block ml-auto ${estadoInfo.badge}`}
                          >
                            {ORDER_ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                          {/* Pago */}
                          <select
                            value={order.pagado || 'pendiente'}
                            onChange={async e => { await api.updateOrder(order._id, { pagado: e.target.value }); loadOrders(orderEstadoFilter) }}
                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer block ml-auto ${pagoInfo.badge}`}
                          >
                            {ORDER_PAGO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Productos */}
                      <div className="bg-gray-50 rounded-2xl p-3 space-y-1 mb-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-600 truncate pr-2">{item.nombre} <span className="text-gray-400">×{item.cantidad}</span></span>
                            <span className="font-semibold text-gray-700 flex-shrink-0">RD${(item.precio * item.cantidad).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Notas */}
                      {order.notas && <p className="text-gray-400 text-xs italic mb-3 px-1">💬 {order.notas}</p>}

                      {/* Acciones */}
                      <div className="flex gap-2">
                        {order.whatsapp && (
                          <a
                            href={`https://wa.me/${order.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(waMessageForEstado(order))}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                          >
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Mensaje WA
                          </a>
                        )}
                        <button
                          onClick={async () => { if (confirm('¿Eliminar este pedido?')) { await api.deleteOrder(order._id); loadOrders(orderEstadoFilter) } }}
                          className="bg-red-50 hover:bg-red-100 text-red-500 text-sm font-bold px-4 rounded-2xl transition-colors"
                        >🗑</button>
                        <button
                          onClick={() => { setFacturaOrder(order); setFacturaModal(true) }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-600 text-sm font-bold px-4 rounded-2xl transition-colors"
                          title="Ver / imprimir factura"
                        >🧾</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── MODAL NUEVO PEDIDO ─────────────────────────────────────────── */}
            <AnimatePresence>
              {orderModal && (
                <m.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
                  onClick={e => e.target === e.currentTarget && setOrderModal(false)}
                >
                  <m.div
                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg my-8 overflow-hidden shadow-2xl"
                  >
                    <div className="bg-gradient-to-r from-primary to-blue-700 p-6 text-white flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black">Nuevo Pedido</h3>
                        <p className="text-white/60 text-sm">Crea un pedido manualmente desde WhatsApp</p>
                      </div>
                      <button onClick={() => setOrderModal(false)} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
                    </div>

                    <form onSubmit={submitOrderAdmin} className="p-6 space-y-5">
                      {/* Cliente */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre cliente *</label>
                          <input
                            required
                            value={orderForm.nombre}
                            onChange={e => setOrderForm(f => ({ ...f, nombre: e.target.value }))}
                            placeholder="Ej: María Rodríguez"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp</label>
                          <input
                            value={orderForm.whatsapp}
                            onChange={e => setOrderForm(f => ({ ...f, whatsapp: e.target.value }))}
                            placeholder="18091234567"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección de entrega</label>
                        <input
                          value={orderForm.direccionEntrega}
                          onChange={e => setOrderForm(f => ({ ...f, direccionEntrega: e.target.value }))}
                          placeholder="Sector, calle, número, ciudad"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Productos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Productos *</label>
                          <button type="button" onClick={addOrderItem} className="text-primary text-xs font-bold hover:underline">＋ Agregar</button>
                        </div>
                        {/* Buscador rápido */}
                        <div className="relative mb-2">
                          <input
                            value={orderSearch}
                            onChange={e => setOrderSearch(e.target.value)}
                            placeholder="🔍 Buscar producto del catálogo..."
                            className="w-full border border-dashed border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                          {orderSearch.length > 1 && (
                            <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                              {productos.filter(p => p.nombre.toLowerCase().includes(orderSearch.toLowerCase())).slice(0, 6).map(p => (
                                <button type="button" key={p.id}
                                  onClick={() => {
                                    const emptyIdx = orderForm.items.findIndex(i => !i.nombre)
                                    if (emptyIdx >= 0) {
                                      setOrderItem(emptyIdx, 'nombre', p.nombre)
                                      setOrderItem(emptyIdx, 'precio', p.precio)
                                      setOrderItem(emptyIdx, 'articulo', p.articulo)
                                    } else {
                                      setOrderForm(f => ({ ...f, items: [...f.items, { nombre: p.nombre, precio: p.precio, cantidad: 1, articulo: p.articulo }] }))
                                    }
                                    setOrderSearch('')
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                                >
                                  <span className="truncate pr-2">{p.nombre}</span>
                                  <span className="text-primary font-bold flex-shrink-0">RD${p.precio.toLocaleString()}</span>
                                </button>
                              ))}
                              {productos.filter(p => p.nombre.toLowerCase().includes(orderSearch.toLowerCase())).length === 0 && (
                                <p className="text-center text-gray-400 text-xs py-3">Sin resultados</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {orderForm.items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <input
                                value={item.nombre}
                                onChange={e => setOrderItem(idx, 'nombre', e.target.value)}
                                placeholder="Producto"
                                className="col-span-5 border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-primary"
                              />
                              <input
                                type="number" min="0"
                                value={item.precio}
                                onChange={e => setOrderItem(idx, 'precio', e.target.value)}
                                placeholder="Precio"
                                className="col-span-3 border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-primary"
                              />
                              <input
                                type="number" min="1"
                                value={item.cantidad}
                                onChange={e => setOrderItem(idx, 'cantidad', e.target.value)}
                                className="col-span-2 border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none focus:border-primary"
                              />
                              <button type="button" onClick={() => removeOrderItem(idx)} className="col-span-2 text-red-400 hover:text-red-600 text-lg font-bold text-center">×</button>
                            </div>
                          ))}
                        </div>
                        {/* Total calculado */}
                        <div className="mt-3 bg-primary/5 rounded-xl px-4 py-2.5 flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-500">Total</span>
                          <span className="text-lg font-black text-primary">RD${orderTotal(orderForm.items).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Pago + notas */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Estado del pago</label>
                          <select
                            value={orderForm.pagado}
                            onChange={e => setOrderForm(f => ({ ...f, pagado: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                          >
                            {ORDER_PAGO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas internas</label>
                          <input
                            value={orderForm.notas}
                            onChange={e => setOrderForm(f => ({ ...f, notas: e.target.value }))}
                            placeholder="Ej: cliente regular"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setOrderModal(false)} className="flex-1 border border-gray-200 rounded-2xl py-3 text-sm font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={orderSaving} className="flex-1 bg-primary text-white rounded-2xl py-3 text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-60">
                          {orderSaving ? 'Guardando...' : '✓ Crear pedido'}
                        </button>
                      </div>
                    </form>
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>

            {/* ── MODAL FACTURA ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {facturaModal && facturaOrder && (() => {
                const numFactura = facturaOrder.invoiceNumber
                  ? `VG-${String(facturaOrder.invoiceNumber).padStart(4, '0')}`
                  : String(facturaOrder._id).slice(-6).toUpperCase()
                const fechaFactura = new Date(facturaOrder.createdAt).toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: '2-digit' })
                const subtotalItems = facturaOrder.items.map(i => ({ ...i, subtotal: Number(i.precio) * Number(i.cantidad) }))
                return (
                  <m.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
                    onClick={e => e.target === e.currentTarget && setFacturaModal(false)}
                  >
                    <m.div
                      initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }}
                      className="w-full max-w-4xl my-8"
                    >
                      {/* ─ Barra de acciones (no se imprime) ─ */}
                      <div className="flex gap-2 mb-3 print:hidden">
                        <button
                          onClick={() => window.print()}
                          className="flex-1 bg-[#1B3A6B] hover:bg-[#0a1628] text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.36-5.671a42.41 42.41 0 00-10.56 0m10.56 0L17.25 19.5M9 10.5h.01M15 10.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          🖨️ Imprimir / Guardar PDF
                        </button>
                        <button
                          onClick={() => {
                            setFacturaEditData({
                              nombre: facturaOrder.nombre || '',
                              whatsapp: facturaOrder.whatsapp || '',
                              direccionEntrega: facturaOrder.direccionEntrega || '',
                              items: facturaOrder.items.map(i => ({ nombre: i.nombre, cantidad: i.cantidad, precio: i.precio })),
                              pagado: facturaOrder.pagado || 'pendiente',
                              notas: facturaOrder.notas || '',
                            })
                            setFacturaEditMode(true)
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                          ✏️ Editar factura
                        </button>
                        <button
                          onClick={() => {
                            const lineas = subtotalItems.map(i => `  • ${i.nombre}  ×${i.cantidad}  →  RD$${i.subtotal.toLocaleString()}`)
                            const txt = [
                              `╔══════════════════════════════╗`,
                              `║   🧾  RECIBO DE COMPRA       ║`,
                              `║      VitaGloss RD            ║`,
                              `╚══════════════════════════════╝`,
                              ``,
                              `N.° ${numFactura}   📅 ${fechaFactura}`,
                              ``,
                              `👤 *Cliente:* ${facturaOrder.nombre}`,
                              facturaOrder.whatsapp ? `📲 ${facturaOrder.whatsapp}` : '',
                              facturaOrder.direccionEntrega ? `📍 ${facturaOrder.direccionEntrega}` : '',
                              ``,
                              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                              `🛒 *Productos:*`,
                              ...lineas,
                              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
                              `💰 *TOTAL: RD$${facturaOrder.total.toLocaleString()}*`,
                              facturaOrder.pagado === 'pagado' ? `✅ Pagado` : facturaOrder.pagado === 'parcial' ? `⚠️ Pago parcial` : `⏳ Pendiente de pago`,
                              facturaOrder.notas ? `\n📝 ${facturaOrder.notas}` : '',
                              ``,
                              `¡Gracias por tu compra! 🌿`,
                              `Productos Amway 100% originales`,
                              `WhatsApp: 849-276-3532`,
                            ].filter(l => l !== undefined && l !== null).join('\n')
                            navigator.clipboard?.writeText(txt)
                            alert('✅ Recibo copiado. Pégalo en WhatsApp.')
                          }}
                          className="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Enviar por WA
                        </button>
                        <button onClick={() => setFacturaModal(false)} className="bg-white/90 hover:bg-white text-gray-600 font-bold px-5 rounded-2xl text-lg transition-colors shadow-lg">✕</button>
                      </div>

                      {/* ─────────── PANEL EDICIÓN ─────────── */}
                      {facturaEditMode && facturaEditData && (
                        <div className="bg-white rounded-2xl shadow-2xl mb-4 border-2 border-amber-400 overflow-hidden print:hidden">
                          {/* Header del panel */}
                          <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">✏️</span>
                              <div>
                                <h3 className="text-white font-extrabold text-base leading-tight">Editando {numFactura}</h3>
                                <p className="text-amber-100 text-xs">Los cambios se guardan en la base de datos al presionar Guardar</p>
                              </div>
                            </div>
                            <button onClick={() => setFacturaEditMode(false)} className="text-white/80 hover:text-white text-2xl font-bold leading-none">✕</button>
                          </div>

                          <div className="p-6 space-y-6">

                            {/* ── Datos del cliente ── */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">1</span>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Datos del cliente</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre completo</label>
                                  <input
                                    value={facturaEditData.nombre}
                                    onChange={e => setFacturaEditData(d => ({ ...d, nombre: e.target.value }))}
                                    className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                                    placeholder="Nombre del cliente"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp</label>
                                  <input
                                    value={facturaEditData.whatsapp}
                                    onChange={e => setFacturaEditData(d => ({ ...d, whatsapp: e.target.value }))}
                                    className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                                    placeholder="(849) 000-0000"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Dirección de entrega</label>
                                  <input
                                    value={facturaEditData.direccionEntrega}
                                    onChange={e => setFacturaEditData(d => ({ ...d, direccionEntrega: e.target.value }))}
                                    className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                                    placeholder="Dirección completa..."
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ── Productos ── */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">2</span>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Productos</p>
                              </div>

                              {/* Cabecera tabla */}
                              <div className="grid grid-cols-[1fr_64px_96px_32px] gap-2 px-2 mb-1">
                                <span className="text-xs text-gray-400 font-semibold">Producto</span>
                                <span className="text-xs text-gray-400 font-semibold text-center">Cant.</span>
                                <span className="text-xs text-gray-400 font-semibold text-right">Precio</span>
                                <span />
                              </div>

                              <div className="space-y-2">
                                {facturaEditData.items.map((item, idx) => {
                                  const sugerencias = item.nombre.trim().length > 0
                                    ? productos.filter(p => p.nombre.toLowerCase().includes(item.nombre.toLowerCase())).slice(0, 7)
                                    : productos.slice(0, 7)
                                  return (
                                    <div key={idx} className="grid grid-cols-[1fr_64px_96px_32px] gap-2 items-start">
                                      {/* Autocomplete nombre */}
                                      <div className="relative">
                                        <input
                                          value={item.nombre}
                                          onChange={e => {
                                            setFacturaEditData(d => {
                                              const items = [...d.items]; items[idx] = { ...items[idx], nombre: e.target.value }; return { ...d, items }
                                            })
                                            setFacturaDropdownIdx(idx)
                                          }}
                                          onFocus={() => setFacturaDropdownIdx(idx)}
                                          onBlur={() => setTimeout(() => setFacturaDropdownIdx(null), 150)}
                                          placeholder="Buscar producto..."
                                          className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none transition-colors"
                                        />
                                        {facturaDropdownIdx === idx && sugerencias.length > 0 && (
                                          <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border-2 border-amber-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                            {sugerencias.map(p => (
                                              <li
                                                key={p.id}
                                                onMouseDown={() => {
                                                  setFacturaEditData(d => {
                                                    const items = [...d.items]
                                                    items[idx] = { ...items[idx], nombre: p.nombre, precio: p.precio }
                                                    return { ...d, items }
                                                  })
                                                  setFacturaDropdownIdx(null)
                                                }}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-0 group"
                                              >
                                                <span className="text-sm font-medium text-gray-800 truncate pr-2 group-hover:text-amber-700">{p.nombre}</span>
                                                <span className="text-xs font-bold text-amber-600 whitespace-nowrap bg-amber-50 px-2 py-0.5 rounded-full">RD${Number(p.precio).toLocaleString()}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                      <input
                                        type="number" min="1"
                                        value={item.cantidad}
                                        onChange={e => setFacturaEditData(d => {
                                          const items = [...d.items]; items[idx] = { ...items[idx], cantidad: Number(e.target.value) }; return { ...d, items }
                                        })}
                                        className="border-2 border-gray-200 focus:border-amber-400 rounded-xl px-2 py-2 text-sm text-center font-medium focus:outline-none transition-colors"
                                      />
                                      <input
                                        type="number" min="0"
                                        value={item.precio}
                                        onChange={e => setFacturaEditData(d => {
                                          const items = [...d.items]; items[idx] = { ...items[idx], precio: e.target.value }; return { ...d, items }
                                        })}
                                        className="border-2 border-gray-200 focus:border-amber-400 rounded-xl px-2 py-2 text-sm text-right font-medium focus:outline-none transition-colors"
                                      />
                                      <button
                                        onClick={() => setFacturaEditData(d => ({ ...d, items: d.items.filter((_, i) => i !== idx) }))}
                                        className="w-8 h-8 mt-0.5 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 text-lg font-bold transition-colors"
                                        title="Eliminar línea"
                                      >×</button>
                                    </div>
                                  )
                                })}
                              </div>

                              <button
                                onClick={() => setFacturaEditData(d => ({ ...d, items: [...d.items, { nombre: '', cantidad: 1, precio: '' }] }))}
                                className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-bold border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-xl px-4 py-2 transition-colors w-full justify-center"
                              >
                                + Agregar producto
                              </button>

                              {/* Subtotal en vivo */}
                              <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-semibold">Total calculado</span>
                                <span className="text-base font-extrabold text-[#1B3A6B]">
                                  RD${facturaEditData.items.reduce((s, i) => s + Number(i.precio || 0) * Number(i.cantidad || 1), 0).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* ── Estado + notas ── */}
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-5 rounded-full bg-[#1B3A6B] text-white text-xs flex items-center justify-center font-bold">3</span>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Estado y notas</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Estado de pago</label>
                                  <select
                                    value={facturaEditData.pagado}
                                    onChange={e => setFacturaEditData(d => ({ ...d, pagado: e.target.value }))}
                                    className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                                  >
                                    <option value="pendiente">⏳ Pendiente</option>
                                    <option value="parcial">⚠️ Pago parcial</option>
                                    <option value="pagado">✅ Pagado</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Observaciones</label>
                                  <input
                                    value={facturaEditData.notas}
                                    onChange={e => setFacturaEditData(d => ({ ...d, notas: e.target.value }))}
                                    placeholder="Notas del pedido..."
                                    className="w-full border-2 border-gray-200 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ── Botones ── */}
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={async () => {
                                  setSavingFactura(true)
                                  try {
                                    const newTotal = facturaEditData.items.reduce((s, i) => s + Number(i.precio) * Number(i.cantidad), 0)
                                    const body = { ...facturaEditData, total: newTotal }
                                    const res = await api.updateOrder(facturaOrder._id, body)
                                    const updated = res.order || { ...facturaOrder, ...body }
                                    setFacturaOrder(updated)
                                    setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
                                    setFacturaEditMode(false)
                                  } catch (err) {
                                    alert('Error al guardar: ' + (err.message || err))
                                  } finally {
                                    setSavingFactura(false)
                                  }
                                }}
                                disabled={savingFactura}
                                className="flex-1 bg-[#1B3A6B] hover:bg-[#0a1628] text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                              >
                                {savingFactura
                                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando...</>
                                  : '💾 Guardar cambios'}
                              </button>
                              <button
                                onClick={() => setFacturaEditMode(false)}
                                className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-sm transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─────────── DOCUMENTO DE FACTURA ─────────── */}
                      <div id="factura-print" className="bg-white shadow-2xl overflow-hidden" style={{ borderRadius: '12px', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>

                        {/* HEADER bicolor: panel blanco logo | panel oscuro número + "Páginas del recibo" */}
                        <div style={{ display: 'flex', alignItems: 'stretch', minHeight: '80px' }}>
                          {/* Logo */}
                          <div style={{ background: '#ffffff', padding: '18px 32px', display: 'flex', alignItems: 'center', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
                            <img src="/logo_final.webp" alt="VitaGloss RD" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
                          </div>
                          {/* Datos recibo */}
                          <div style={{ flex: 1, background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <p style={{ color: '#2EC4B6', fontSize: '10px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '3px' }}>Recibo de Compra</p>
                              <p style={{ color: '#ffffff', fontSize: '26px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: 1 }}>{numFactura}</p>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', textAlign: 'right' }}>Páginas del recibo&nbsp;<strong style={{ color: 'rgba(255,255,255,0.85)' }}>1/1</strong></p>
                          </div>
                        </div>

                        {/* Banda teal */}
                        <div style={{ height: '4px', background: 'linear-gradient(90deg, #2EC4B6, #1B3A6B)' }} />

                        {/* DOS COLUMNAS: Cliente | Información del vendedor */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px 40px 20px' }}>
                          <div>
                            <p style={{ fontWeight: '700', color: '#1B3A6B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px' }}>Cliente</p>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '3px' }}>{facturaOrder.nombre}</p>
                            {facturaOrder.whatsapp && (
                              <p style={{ fontSize: '13px', color: '#444', marginBottom: '2px' }}>
                                {facturaOrder.whatsapp.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')}
                              </p>
                            )}
                            {facturaOrder.direccionEntrega && (
                              <p style={{ fontSize: '13px', color: '#666', marginBottom: '2px' }}>{facturaOrder.direccionEntrega}</p>
                            )}
                            <p style={{ fontSize: '13px', color: '#444', marginTop: '6px' }}>
                              Período de bonificación:&nbsp;
                              {new Date(facturaOrder.createdAt).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '11px', color: '#1B3A6B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Información del vendedor</p>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '3px' }}>{user?.nombre || 'VitaGloss RD'}</p>
                            <p style={{ fontSize: '13px', color: '#444', marginBottom: '2px' }}>(849) 276-3532</p>
                            <p style={{ fontSize: '13px', color: '#444', marginBottom: '8px' }}>vitaglossrd@hotmail.com</p>
                            <p style={{ fontSize: '13px', color: '#444', marginBottom: '2px' }}>
                              Fecha de la venta:&nbsp;
                              {new Date(facturaOrder.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </p>
                            <p style={{ fontSize: '13px', color: '#444' }}>Número del recibo:&nbsp;<strong style={{ color: '#111' }}>{numFactura}</strong></p>
                          </div>
                        </div>

                        {/* Línea */}
                        <div style={{ height: '1px', background: '#e5e7eb', margin: '0 40px' }} />

                        {/* TABLA PRODUCTOS */}
                        <div style={{ padding: '20px 40px 0' }}>
                          {/* Cabecera */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 140px 140px', background: 'linear-gradient(135deg, #0a1628, #1B3A6B)', borderRadius: '8px', padding: '10px 16px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Cant.</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Precio</span>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Total</span>
                          </div>
                          {subtotalItems.map((item, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 140px 140px', padding: '13px 16px', borderBottom: '1px solid #f0f0f0', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                              <p style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{item.nombre}</p>
                              <span style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>{item.cantidad}</span>
                              <span style={{ fontSize: '13px', color: '#555', textAlign: 'right' }}>RD${Number(item.precio).toLocaleString()}.00</span>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111', textAlign: 'right' }}>RD${item.subtotal.toLocaleString()}.00</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ height: '20px' }} />
                        <div style={{ height: '1px', background: '#e5e7eb', margin: '0 40px' }} />

                        {/* TOTALES — dos columnas: subtotales izq | caja total derecha */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start', padding: '20px 40px 24px' }}>
                          {/* Lista subtotales */}
                          <div style={{ paddingTop: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#555' }}>Subtotal de artículo(s)</span>
                              <span style={{ fontSize: '13px', color: '#555' }}>RD${facturaOrder.total.toLocaleString()}.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '13px', color: '#555' }}>Envíos</span>
                              <span style={{ fontSize: '13px', color: '#555' }}>RD$0.00</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13px', color: '#555' }}>Impuestos</span>
                              <span style={{ fontSize: '13px', color: '#555' }}>RD$0.00</span>
                            </div>
                            {facturaOrder.notas && (
                              <div style={{ marginTop: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px' }}>
                                <p style={{ fontSize: '10px', fontWeight: '700', color: '#b45309', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Observaciones</p>
                                <p style={{ fontSize: '12px', color: '#92400e' }}>{facturaOrder.notas}</p>
                              </div>
                            )}
                          </div>
                          {/* Caja total */}
                          <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1B3A6B 100%)', borderRadius: '12px', padding: '18px 28px', minWidth: '240px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total del recibo</span>
                              <span style={{ color: '#2EC4B6', fontSize: '22px', fontWeight: '900' }}>RD${facturaOrder.total.toLocaleString()}</span>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '10px' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Estado de pago</span>
                              {facturaOrder.pagado === 'pagado'
                                ? <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>✅ PAGADO</span>
                                : facturaOrder.pagado === 'parcial'
                                ? <span style={{ background: '#fef9c3', color: '#a16207', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>⚠️ PARCIAL</span>
                                : <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>⏳ PENDIENTE</span>
                              }
                            </div>
                          </div>
                        </div>

                        {/* FOOTER — banda teal */}
                        <div style={{ background: '#2EC4B6', padding: '10px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>VITAGLOSS RD — DISTRIBUIDORA AMWAY</span>
                          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>N.° {numFactura} · {fechaFactura}</span>
                        </div>
                      </div>
                    </m.div>
                  </m.div>
                )
              })()}
            </AnimatePresence>

          </Section>
        )}

        {/* ── TAB 6: PERFIL ────────────────────────────────────────────────────────── */}
        {tab === 5 && (
          <Section>
            <div className="max-w-lg mx-auto">
              <h2 className="text-2xl font-black text-primary mb-6">Mi perfil</h2>
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-[#0a1628] to-[#1B3A6B] p-6 text-white flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-2xl font-black">
                    {user?.nombre?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-xl">{user?.nombre}</p>
                    <p className="text-white/50 text-sm capitalize">{user?.rol} · {user?.email}</p>
                  </div>
                </div>
                <div className="p-6">
                  <form onSubmit={submitProfile} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre completo</label>
                      <input value={profileForm.nombre} onChange={e => setProfileForm(f => ({ ...f, nombre: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">WhatsApp</label>
                      <input placeholder="18091234567" value={profileForm.whatsapp} onChange={e => setProfileForm(f => ({ ...f, whatsapp: e.target.value }))}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</label>
                      <textarea value={profileForm.descripcion} onChange={e => setProfileForm(f => ({ ...f, descripcion: e.target.value }))}
                        rows={3} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta mensual (RD$)</label>
                      <input type="number" min={0} value={profileForm.metaMensual} onChange={e => setProfileForm(f => ({ ...f, metaMensual: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
                    </div>

                    <AnimatePresence>
                      {profileMsg && (
                        <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className={`text-sm font-semibold rounded-2xl px-4 py-3 ${profileMsg.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {profileMsg}
                        </m.p>
                      )}
                    </AnimatePresence>

                    <button type="submit" disabled={savingProfile}
                      className="w-full bg-primary hover:bg-blue-800 text-white font-black py-3.5 rounded-2xl transition-all hover:scale-[1.02] disabled:opacity-60">
                      {savingProfile ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                  </form>
                </div>
              </div>

              {/* ─ Enlace de referido ─ */}
              {user?.refCode && (
                <div className="mt-6 bg-gradient-to-br from-[#0a1628] to-[#1B3A6B] rounded-3xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <p className="font-black text-base">Tu enlace de referido</p>
                      <p className="text-white/50 text-xs">Comparte este link y rastrea cada visita</p>
                    </div>
                    <span className="ml-auto bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold px-3 py-1 rounded-full">
                      {user.refClicks ?? 0} clicks
                    </span>
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 mb-4">
                    <p className="flex-1 text-white/80 text-xs truncate font-mono">
                      {window.location.origin}/?ref={user.refCode}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(`${window.location.origin}/?ref=${user.refCode}`)
                        setCopied('ref')
                        setTimeout(() => setCopied(null), 2000)
                      }}
                      className="flex-shrink-0 bg-secondary hover:bg-teal-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      {copied === 'ref' ? '✓ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs">
                    Cuando alguien entra por tu enlace y deja sus datos en el popup de descuento, el lead queda registrado a tu nombre.
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── TAB 7: PRECIOS (solo admin) ──────────────────────────────────────────── */}
        {tab === 6 && user?.rol === 'admin' && (
          <Section>
            <PreciosTab />
          </Section>
        )}
        {tab === 6 && user?.rol !== 'admin' && (
          <Section>
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🔒</div>
              <p className="font-semibold text-lg">Acceso solo para administradores</p>
            </div>
          </Section>
        )}
        </main>
      </div>
    </div>
  )
}
