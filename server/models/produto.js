const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  precoOriginal: { type: Number }, // opcional
  categoria: { type: String, enum: ['homem', 'mulher'], required: true },
  subcategoria: { type: String, required: true },
  imagem: { type: String }, // pode ser URL ou caminho local
  ativo: { type: Boolean, default: true }, // só aparece na loja se ativo=true
  promocao: { type: Boolean, default: false },
  novidade: { type: Boolean, default: false },
  criadoEm: { type: Date, default: Date.now }
});

// Exporta o model
module.exports = mongoose.model('Produto', ProductSchema);