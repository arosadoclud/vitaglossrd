const mongoose = require('mongoose')

// Un único documento que guarda todos los precios y precios de combos.
// Se upsert en PUT /api/precios.
const precioSchema = new mongoose.Schema(
  {
    tipo: { type: String, default: 'precios', unique: true },
    // Array de { id: Number, precio: Number, precioOriginal: Number }
    productos: [
      {
        id:             { type: Number, required: true },
        precio:         { type: Number, required: true },
        precioOriginal: { type: Number, required: true },
      },
    ],
    // Array de { id: String, precioCombo: Number }
    combos: [
      {
        id:          { type: String, required: true },
        precioCombo: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Precio', precioSchema)
