const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cidadeviva-dev';

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Autenticação obrigatória. Envie o cabeçalho Authorization: Bearer <token>.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = { autenticar, JWT_SECRET };
