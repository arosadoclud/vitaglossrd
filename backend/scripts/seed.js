require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const User = require('../models/User')

function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`)
  return value
}

function validateAdmin(email, password) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('ADMIN_EMAIL no tiene un formato válido.')
  }

  if (
    password.length < 14 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 14 caracteres e incluir mayúscula, minúscula, número y símbolo.')
  }
}

async function seedAdmin() {
  try {
    const mongoUri = requireEnv('MONGODB_URI')
    const email = requireEnv('ADMIN_EMAIL').toLowerCase()
    const password = requireEnv('ADMIN_PASSWORD')
    const nombre = process.env.ADMIN_NAME?.trim() || 'Administrador VitaGloss RD'
    const whatsapp = process.env.ADMIN_WHATSAPP?.trim() || ''

    validateAdmin(email, password)
    await mongoose.connect(mongoUri)

    let admin = await User.findOne({ email }).select('+password')
    const existed = Boolean(admin)

    if (!admin) {
      admin = new User({
        nombre,
        email,
        password,
        rol: 'admin',
        activo: true,
        whatsapp,
        descripcion: 'Administrador de VitaGloss RD.',
      })
    } else {
      admin.nombre = nombre
      admin.rol = 'admin'
      admin.activo = true
      if (whatsapp) admin.whatsapp = whatsapp

      const passwordMatches = await admin.compararPassword(password)
      if (!passwordMatches) admin.password = password
    }

    await admin.save()

    console.log(existed ? 'Administrador actualizado correctamente.' : 'Administrador creado correctamente.')
    console.log(`Email: ${admin.email}`)
    console.log('La contraseña no se muestra ni se almacena en texto plano.')
  } catch (err) {
    console.error(`No se pudo preparar el administrador: ${err.message}`)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect().catch(() => {})
  }
}

seedAdmin()
