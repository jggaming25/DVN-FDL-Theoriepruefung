const express = require('express');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const { initDatabase, getDb } = require('./database');
const config = require('./config/app.json');
const { requireAuth } = require('./middleware/auth');

const app = express();

// Database initialization is async, start server after it completes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.siteName = config.siteName;
  next();
});

function generateCaptcha() {
  const num1 = crypto.randomInt(10, 99);
  const num2 = crypto.randomInt(1, 50);
  const ops = ['+', '-'];
  const op = ops[crypto.randomInt(0, 2)];
  let answer;
  if (op === '+' ) { answer = num1 + num2; }
  else { answer = num1 - num2; }
  return { question: `${num1} ${op} ${num2} = ?`, answer: answer.toString() };
}

app.use('/captcha/generate', (req, res) => {
  const captcha = generateCaptcha();
  req.session.captcha = captcha;
  const svg = generateCaptchaSVG(captcha.question);
  res.json({ svg, question: captcha.question, id: Date.now() });
});

function generateCaptchaSVG(text) {
  const lines = text.split('');
  let x = 10;
  let elements = `<text x="10" y="28" font-family="monospace" font-size="20" fill="#333" font-weight="bold">${text}</text>`;
  for (let i = 0; i < 3; i++) {
    elements += `<line x1="${crypto.randomInt(0, 160)}" y1="${crypto.randomInt(0, 40)}" x2="${crypto.randomInt(0, 160)}" y2="${crypto.randomInt(0, 40)}" stroke="#ccc" stroke-width="1"/>`;
  }
  for (let i = 0; i < 20; i++) {
    elements += `<circle cx="${crypto.randomInt(0, 160)}" cy="${crypto.randomInt(0, 40)}" r="${crypto.randomInt(1, 3)}" fill="#ddd"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40" style="background:#f9f9f9;border-radius:4px;border:1px solid #ddd;">${elements}</svg>`;
}

app.post('/captcha/verify', (req, res) => {
  if (!req.session.captcha) {
    req.session.captchaError = 'Captcha ungültig. Bitte neu laden.';
    return res.json({ valid: false });
  }
  const isValid = req.body.answer === req.session.captcha.answer;
  if (isValid) {
    req.session.captcha_verified = true;
    delete req.session.captcha;
    res.json({ valid: true });
  } else {
    req.session.captchaError = 'Falsche Captcha-Antwort.';
    delete req.session.captcha;
    res.json({ valid: false });
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE roblox_id = ?').get(req.session.user.roblox_id);
  if (!user) return res.redirect('/login');

  if (user.is_blocked && !user.has_pending_appeal) {
    return res.redirect('/blocked');
  }
  if (user.is_blocked && user.has_pending_appeal) {
    return res.redirect('/blocked');
  }

  const attempts = db.prepare('SELECT * FROM test_attempts WHERE roblox_id = ? ORDER BY attempt_number DESC').all(user.roblox_id);
  const openAttempt = attempts.find(a => a.status === 'in_progress');

  res.render('dashboard', { user, attempts, openAttempt });
});

app.get('/blocked', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE roblox_id = ?').get(req.session.user.roblox_id);
  if (!user) return res.redirect('/login');
  res.render('blocked', { user });
});

app.post('/appeal/request', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE roblox_id = ?').get(req.session.user.roblox_id);
  if (!user) return res.status(403).json({ success: false, error: 'Nicht autorisiert.' });

  if (user.has_pending_appeal) {
    return res.json({ success: false, error: 'Du hast bereits eine Anfrage gestellt. Warte auf die HR-Bearbeitung.' });
  }
  if (user.appeal_was_granted) {
    return res.json({ success: false, error: 'Deine letzte Chance wurde bereits genutzt. Keine weiteren Versuche möglich.' });
  }
  if (!user.is_blocked) {
    return res.json({ success: false, error: 'Du bist nicht gesperrt.' });
  }

  db.prepare('UPDATE users SET has_pending_appeal = 1, appeal_requested_at = datetime("now") WHERE roblox_id = ?').run(user.roblox_id);
  db.prepare('INSERT INTO appeals (roblox_id, status) VALUES (?, "pending")').run(user.roblox_id);
  req.session.user.has_pending_appeal = 1;
  res.json({ success: true });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.use('/', require('./routes/auth'));
app.use('/', require('./routes/exam'));
app.use('/', require('./routes/hr'));

app.use((err, req, res, next) => {
  console.error('Server-Fehler:', err.stack);
  res.status(500).send('Ein interner Fehler ist aufgetreten. Bitte kontaktiere einen HR-Mitarbeiter.');
});

const PORT = config.port || 3000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`${config.siteName} läuft auf http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Datenbank-Fehler:', err);
  process.exit(1);
});

module.exports = app;
