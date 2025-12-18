const jwt = require('jsonwebtoken');

module.exports = function authAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: 'Sem token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ ok: false, error: 'Proibido' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Token inválido' });
  }
};