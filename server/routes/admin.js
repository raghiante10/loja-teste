// routes/admin.js
const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin'); // ajuste o caminho se necessário

// Rota para verificar se o token do admin é válido
router.get('/verificar-token', authAdmin, (req, res) => {
  res.status(200).json({ ok: true });
});

// Exemplo de rota protegida de administração
router.get('/dashboard', authAdmin, (req, res) => {
  res.json({ message: 'Bem-vindo ao painel de administração!' });
});

// Exemplo de rota pública (sem precisar de token)
router.get('/status', (req, res) => {
  res.json({ status: 'Admin API funcionando corretamente' });
});

module.exports = router;