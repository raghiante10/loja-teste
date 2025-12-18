const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user'); // U maiúsculo para bater com o arquivo
const router = express.Router();

// Registrar novo usuário admin
router.post('/register', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const user = await User.create({ email, senhaHash, role: 'admin' });
    res.status(201).json({ ok: true, id: user._id });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(senha, user.senhaHash);
    if (!valid) return res.status(401).json({ ok: false, error: 'Credenciais inválidas' });

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ ok: true, token });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;