const { getDb } = require('../database');

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireHR(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (!req.session.user.is_hr) {
    return res.status(403).send('Zugriff verweigert. Nur HR-Mitglieder.');
  }
  next();
}

function checkBlocked(req, res, next) {
  if (!req.session.user) return next();
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE roblox_id = ?').get(req.session.user.roblox_id);
  if (user && user.is_blocked) {
    req.session.user.is_blocked = 1;
  }
  next();
}

module.exports = { requireAuth, requireHR, checkBlocked };
