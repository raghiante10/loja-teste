// server/middleware/authAdmin.js
const jwt = require('jsonwebtoken');

function authAdmin(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Aqui você pode validar se o usuário é admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado: não é admin' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = authAdmin;