const express = require('express');
const Product = require('../models/produto');
const authAdmin = require('./authMiddlerware'); // mantém como está se o nome do arquivo for esse
const router = express.Router();

// Listagem pública com filtros
router.get('/', async (req, res) => {
  try {
    const { categoria, subcategoria, ativo, novidade, promocao } = req.query;
    const query = {};

    if (categoria) query.categoria = categoria;
    if (subcategoria) query.subcategoria = subcategoria;

    // só filtra ativo se vier na query
    if (ativo !== undefined) {
      query.ativo = ativo === 'true';
    }

    if (novidade !== undefined) query.novidade = novidade === 'true';
    if (promocao !== undefined) query.promocao = promocao === 'true';

    const produtos = await Product.find(query).sort({ criadoEm: -1 });
    res.json(produtos);
  } catch (err) {
    console.error('Erro ao listar produtos:', err);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
});

// CRUD admin
router.post('/', authAdmin, async (req, res) => {
  try {
    const produto = await Product.create(req.body);
    res.status(201).json(produto);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});
// Salvar vários produtos de uma vez
router.post('/lote', authAdmin, async (req, res) => {
  try {
    // req.body deve ser um array de produtos
    const produtos = await Product.insertMany(req.body);
    res.status(201).json(produtos);
  } catch (err) {
    console.error('Erro ao criar produtos em lote:', err);
    res.status(500).json({ error: 'Erro ao criar produtos em lote' });
  }
});

router.put('/:id', authAdmin, async (req, res) => {
  try {
    const produto = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(produto);
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

router.delete('/:id', authAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Erro ao excluir produto:', err);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

module.exports = router;