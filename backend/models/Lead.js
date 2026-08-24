const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema({
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,  // Opcional para leads capturados desde la web pública
    default: null,
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del lead es requerido'],
    trim: true,
  },
  telefono: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [120, 'Email muy largo'],
    default: '',
  },
  productoInteres: {
    type: String,
    default: 'Sin especificar',
  },
  estado: {
    type: String,
    enum: ['nuevo', 'contactado', 'interesado', 'cerrado', 'perdido'],
    default: 'nuevo',
  },
  nota: {
    type: String,
    maxlength: [500, 'Nota muy larga'],
    default: '',
  },
  origen: {
    type: String,
    enum: ['whatsapp', 'referido', 'web', 'instagram', 'facebook', 'amway-landing', 'webinar', 'campana', 'otro'],
    default: 'whatsapp',
  },
  tipoInteres: {
    type: String,
    enum: ['cliente', 'vendedor', 'ambos', 'otro'],
    default: 'cliente',
  },
  fechaContacto: {
    type: Date,
    default: Date.now,
  },
  // Ciudad de residencia del lead (segmentación geográfica)
  ciudad: {
    type: String,
    default: '',
    trim: true,
  },
  // Atribución de referido (código del vendedor que redirigó al cliente)
  refCode: {
    type: String,
    default: '',
    trim: true,
  },
  consentimientoContacto: {
    type: Boolean,
    default: false,
  },
  consentimientoFecha: {
    type: Date,
    default: null,
  },
  consentimientoTexto: {
    type: String,
    maxlength: [300, 'Texto de consentimiento muy largo'],
    default: '',
  },
  leido: {
    type: Boolean,
    default: false,
  },
  leidoAt: {
    type: Date,
    default: null,
  },
  ultimoContacto: {
    type: Date,
    default: null,
  },
  proximoSeguimiento: {
    type: Date,
    default: null,
  },
  campana: {
    source: { type: String, default: '', maxlength: 80 },
    medium: { type: String, default: '', maxlength: 80 },
    name: { type: String, default: '', maxlength: 120 },
    content: { type: String, default: '', maxlength: 120 },
    landingPath: { type: String, default: '', maxlength: 160 },
  },
}, {
  timestamps: true,
})

leadSchema.index({ createdAt: -1 })
leadSchema.index({ vendedor: 1, estado: 1, createdAt: -1 })
leadSchema.index({ vendedor: 1, leido: 1 })
leadSchema.index({ proximoSeguimiento: 1, estado: 1 })
leadSchema.index({ telefono: 1, createdAt: -1 })
leadSchema.index({ email: 1, createdAt: -1 })

module.exports = mongoose.model('Lead', leadSchema)
