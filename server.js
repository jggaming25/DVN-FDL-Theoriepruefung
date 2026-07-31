const express = require('express');
const axios = require('axios');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
const FRONTEND_ORIGIN = new URL(FRONTEND_URL).origin;
const ROBLOX_CLIENT_ID = process.env.ROBLOX_CLIENT_ID || 'DEINE_ID';
const ROBLOX_CLIENT_SECRET = process.env.ROBLOX_CLIENT_SECRET || 'DEIN_SECRET';
const ROBLOX_NOTIFY_KEY = process.env.ROBLOX_NOTIFY_KEY || '';
const HR_ROLES = (process.env.HR_ROLES || '12345678,87654321').split(',').map(Number);

const FRAGEN = require('./fragen');
const DB_FILE = path.join(__dirname, 'daten.json');

// JSON-Datenbank
let DB = { users: [], versuche: [], antworten: [], anfragen: [] };
function laden() {
  try { DB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) { DB = { users:[], versuche:[], antworten:[], anfragen:[] }; }
}
function speichern() { fs.writeFileSync(DB_FILE, JSON.stringify(DB)); }
laden();

function findUser(rid) { return DB.users.find(u => u.roblox_id === rid); }
function findVersuch(id) { return DB.versuche.find(v => v.id === id); }
function findVersuchAktiv(rid) { return DB.versuche.find(v => v.roblox_id === rid && v.status === 'aktiv'); }
function userVersuche(rid) { return DB.versuche.filter(v => v.roblox_id === rid).sort((a,b) => b.nummer - a.nummer); }
function versuchAntworten(vid) { return DB.antworten.filter(a => a.versuch_id === vid); }
function nextId(arr) { return arr.reduce((m,x) => Math.max(m, x.id||0), 0) + 1; }
function getMax(u) { return 2 + (u.bonus||0); }

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/bilder', express.static(path.join(__dirname, 'bilder')));
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10*1024*1024 } });

app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

function tokenGen() { return crypto.randomBytes(32).toString('hex'); }
const tokens = {};

function sendeBenachrichtigung(id, text) {
  if (!ROBLOX_NOTIFY_KEY) return console.log(`[Notify] ${id}: ${text}`);
  axios.post(`https://apis.roblox.com/notification/v2/user/${id}`, { text }, {
    headers: { 'x-api-key': ROBLOX_NOTIFY_KEY, 'Content-Type': 'application/json' }, timeout: 5000
  }).catch(e => console.log(`[Notify Fehler] ${id}: ${e.message}`));
}

// CAPTCHA
app.get('/api/captcha', (req, res) => {
  const n1 = crypto.randomInt(10, 99), n2 = crypto.randomInt(1, 50);
  const op = Math.random() > 0.5 ? '+' : '-';
  const ant = op === '+' ? n1+n2 : n1-n2;
  const id = Date.now().toString();
  tokens['captcha_'+id] = ant.toString();
  setTimeout(() => delete tokens['captcha_'+id], 120000);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40" style="background:#f9f9f9;border-radius:4px;border:1px solid #ddd;display:block"><text x="10" y="28" font-family="monospace" font-size="20" fill="#333" font-weight="bold">${n1} ${op} ${n2} = ?</text></svg>`;
  res.json({ id, svg });
});

app.post('/api/captcha/verify', (req, res) => {
  const { id, answer } = req.body;
  if (tokens['captcha_'+id] && tokens['captcha_'+id] === answer) {
    delete tokens['captcha_'+id];
    const tok = tokenGen();
    tokens['cap_ok_'+tok] = true;
    setTimeout(() => delete tokens['cap_ok_'+tok], 60000);
    res.json({ ok: true, token: tok });
  } else res.json({ ok: false });
});

// AUTH
app.get('/api/auth/login', (req, res) => {
  const { captcha } = req.query;
  if (!tokens['cap_ok_'+captcha]) return res.redirect(FRONTEND_URL + '/#login?e=captcha');
  delete tokens['cap_ok_'+captcha];
  const state = tokenGen();
  tokens['oauth_'+state] = true;
  setTimeout(() => delete tokens['oauth_'+state], 300000);
  res.redirect(`https://apis.roblox.com/oauth/v1/authorize?client_id=${ROBLOX_CLIENT_ID}&redirect_uri=${encodeURIComponent(BASE_URL+'/api/auth/callback')}&response_type=code&scope=openid+profile&state=${state}`);
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const tok = await axios.post('https://apis.roblox.com/oauth/v1/token', {
      client_id: ROBLOX_CLIENT_ID, client_secret: ROBLOX_CLIENT_SECRET,
      code: req.query.code, grant_type: 'authorization_code',
      redirect_uri: BASE_URL+'/api/auth/callback'
    }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
    const u = (await axios.get('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: { Authorization: 'Bearer '+tok.data.access_token }, timeout: 10000
    })).data;
    const rid = u.sub;
    let usr = findUser(rid);
    const isHR = HR_ROLES.includes(parseInt(rid));
    if (!usr) {
      DB.users.push({ roblox_id:rid, name:u.name||u.preferred_username||rid, bild:u.picture||'', is_hr:isHR?1:0, versuche:0, bonus:0, gesperrt:0, anfrage_offen:0, anfrage_genutzt:0 });
      speichern();
      usr = findUser(rid);
    } else {
      usr.name = u.name||u.preferred_username||usr.name;
      usr.bild = u.picture||usr.bild;
      usr.is_hr = Math.max(usr.is_hr, isHR?1:0);
      speichern();
    }
    const sessionToken = tokenGen();
    tokens['session_'+sessionToken] = { roblox_id: rid };
    res.redirect(FRONTEND_URL + '/#login?token=' + sessionToken);
  } catch(e) {
    console.error(e.message);
    res.redirect(FRONTEND_URL + '/#login?e=auth_failed');
  }
});

app.post('/api/me', (req, res) => {
  const s = tokens['session_'+req.body.token];
  if (!s) return res.json({ user: null });
  const usr = findUser(s.roblox_id);
  if (!usr) return res.json({ user: null });
  res.json({ user: { roblox_id: usr.roblox_id, name: usr.name, bild: usr.bild, is_hr: usr.is_hr, gesperrt: usr.gesperrt, versuche: usr.versuche, bonus: usr.bonus, anfrage_offen: usr.anfrage_offen, anfrage_genutzt: usr.anfrage_genutzt } });
});

// EXAM
app.get('/api/exam', (req, res) => {
  if (!tokens['session_'+req.query.token]) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.json({ fragen: FRAGEN });
});

app.post('/api/exam/save', upload.any(), (req, res) => {
  const s = tokens['session_'+req.body.token];
  if (!s) return res.status(401).json({ error: 'Nicht eingeloggt' });
  const usr = findUser(s.roblox_id);
  if (!usr || (usr.gesperrt && !usr.is_hr)) return res.status(403).json({ error: 'Gesperrt' });
  let v = findVersuchAktiv(s.roblox_id);
  if (!v) {
    const nr = (DB.versuche.filter(x => x.roblox_id === s.roblox_id).reduce((m,x) => Math.max(m, x.nummer||0), 0)) + 1;
    v = { id: nextId(DB.versuche), roblox_id: s.roblox_id, nummer: nr, status: 'aktiv', punkte: 0, max_punkte: FRAGEN.reduce((a,q)=>a+(q.maxPunkte||0),0), bestanden: 0, feedback: '', geprueft_von: '', erstellt: new Date().toISOString(), abgeschlossen: '' };
    DB.versuche.push(v);
    speichern();
  }
  FRAGEN.forEach(q => {
    let ant = req.body['q_'+q.id], datei = null;
    const f = req.files.find(f => f.fieldname === 'q_'+q.id);
    if (f) datei = f.filename;
    if (ant !== undefined || datei) {
      let e = DB.antworten.find(a => a.versuch_id === v.id && a.frage_id === q.id);
      if (e) { e.antwort = (ant||'').substring(0,10000); e.datei = datei; e.max_punkte = q.maxPunkte||0; }
      else { DB.antworten.push({ id: nextId(DB.antworten), versuch_id: v.id, frage_id: q.id, antwort: (ant||'').substring(0,10000), datei, punkte: 0, max_punkte: q.maxPunkte||0, feedback: '', geprüft: 0 }); }
      speichern();
    }
  });
  res.json({ success: true });
});

app.post('/api/exam/submit', upload.any(), (req, res) => {
  const s = tokens['session_'+req.body.token];
  if (!s) return res.status(401).json({ error: 'Nicht eingeloggt' });
  const usr = findUser(s.roblox_id);
  if (!usr || usr.gesperrt) return res.status(403).json({ error: 'Gesperrt' });
  let v = findVersuchAktiv(s.roblox_id);
  if (!v) return res.status(400).json({ error: 'Kein aktiver Versuch' });
  const LOESUNGEN = {1:1,6:0,10:1,11:1,19:0,20:2,2:[0,2],17:[0,1,2]};
  let fehler = [];
  FRAGEN.forEach(q => {
    let ant = req.body['q_'+q.id], datei = null, punkte = 0;
    const f = req.files.find(f => f.fieldname === 'q_'+q.id);
    if (f) datei = f.filename;
    if (q.typ==='singleChoice'||q.typ==='dropdown') {
      if (ant === undefined) { fehler.push(`Frage ${q.id}: Bitte wählen`); return; }
      const loes = LOESUNGEN[q.id];
      if (loes !== undefined && parseInt(ant) === loes) punkte = q.maxPunkte;
    } else if (q.typ==='multipleChoice') {
      if (!ant) { fehler.push(`Frage ${q.id}: Bitte wählen`); return; }
      const gew = Array.isArray(ant) ? ant.map(Number) : [Number(ant)];
      const loes = LOESUNGEN[q.id];
      if (loes && JSON.stringify([...gew].sort()) === JSON.stringify([...loes].sort())) punkte = q.maxPunkte;
    } else if (q.typ==='freetext') {
      if (!ant||!ant.trim()) { fehler.push(`Frage ${q.id}: Text eingeben`); return; }
      if (q.maxZeichen && ant.replace(/\s/g,'').length > q.maxZeichen) { fehler.push(`Frage ${q.id}: Max ${q.maxZeichen} Zeichen`); return; }
    } else if (q.typ==='stars') { if (!ant) { fehler.push(`Frage ${q.id}: Bewertung`); return; } }
    else if (q.typ==='numberScale') {
      if (ant===''||ant===undefined) { fehler.push(`Frage ${q.id}: Wert eingeben`); return; }
      const n = parseFloat(ant);
      if (isNaN(n)||n<q.min||n>q.max) { fehler.push(`Frage ${q.id}: ${q.min}-${q.max}`); return; }
    } else if (q.typ==='date'&&!ant) { fehler.push(`Frage ${q.id}: Datum`); return; }
    else if (q.typ==='time'&&!ant) { fehler.push(`Frage ${q.id}: Uhrzeit`); return; }
    else if (q.typ==='file'&&!datei) { fehler.push(`Frage ${q.id}: Datei`); return; }
    if (ant !== undefined || datei) {
      let e = DB.antworten.find(a => a.versuch_id === v.id && a.frage_id === q.id);
      if (e) { e.antwort = (ant||'').substring(0,10000); e.datei = datei; e.punkte = punkte; e.geprüft = punkte>0?1:0; }
      else { DB.antworten.push({ id: nextId(DB.antworten), versuch_id: v.id, frage_id: q.id, antwort: (ant||'').substring(0,10000), datei, punkte, max_punkte: q.maxPunkte||0, feedback: '', geprüft: punkte>0?1:0 }); }
      speichern();
    }
  });
  if (fehler.length) return res.json({ success: false, fehler });
  v.status = 'wartet';
  v.abgeschlossen = new Date().toISOString();
  usr.versuche++;
  if (usr.versuche >= getMax(usr)) usr.gesperrt = 1;
  speichern();
  res.json({ success: true });
});

app.get('/api/versuche', (req, res) => {
  const s = tokens['session_'+req.query.token];
  if (!s) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.json({ versuche: userVersuche(s.roblox_id) });
});

app.get('/api/ergebnis/:id', (req, res) => {
  const s = tokens['session_'+req.query.token];
  if (!s) return res.status(401).json({ error: 'Nicht eingeloggt' });
  const v = findVersuch(parseInt(req.params.id));
  if (!v || (v.roblox_id !== s.roblox_id && !(tokens['session_'+req.query.token]?.is_hr))) return res.status(403).json({ error: 'Kein Zugriff' });
  res.json({ versuch: v, antworten: versuchAntworten(v.id), fragen: FRAGEN });
});

// APPEAL
app.post('/api/appeal', (req, res) => {
  const s = tokens['session_'+req.body.token];
  if (!s) return res.status(401).json({ error: 'Nicht eingeloggt' });
  const usr = findUser(s.roblox_id);
  if (!usr.gesperrt) return res.json({ success: false, error: 'Nicht gesperrt' });
  if (usr.anfrage_offen) return res.json({ success: false, error: 'Anfrage läuft bereits' });
  if (usr.anfrage_genutzt) return res.json({ success: false, error: 'Bereits genutzt' });
  usr.anfrage_offen = 1;
  DB.anfragen.push({ id: nextId(DB.anfragen), roblox_id: s.roblox_id, status: 'offen', erstellt: new Date().toISOString() });
  speichern();
  res.json({ success: true });
});

// HR
app.get('/api/hr/pending', (req, res) => {
  const s = tokens['session_'+req.query.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const vs = DB.versuche.filter(v => v.status === 'wartet').map(v => { const u=findUser(v.roblox_id); return {...v, name:u?.name, bild:u?.bild}; }).sort((a,b) => (b.abgeschlossen||'').localeCompare(a.abgeschlossen||''));
  res.json({ versuche: vs });
});

app.get('/api/hr/completed', (req, res) => {
  const s = tokens['session_'+req.query.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const vs = DB.versuche.filter(v => v.status==='bestanden'||v.status==='durchgefallen').map(v => { const u=findUser(v.roblox_id); return {...v, name:u?.name, bild:u?.bild}; }).sort((a,b) => (b.abgeschlossen||'').localeCompare(a.abgeschlossen||''));
  res.json({ versuche: vs });
});

app.get('/api/hr/evaluate/:id', (req, res) => {
  const s = tokens['session_'+req.query.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const v = findVersuch(parseInt(req.params.id));
  if (!v) return res.status(404).json({ error: 'Nicht gefunden' });
  const u = findUser(v.roblox_id);
  res.json({ versuch: {...v, name:u?.name, bild:u?.bild}, antworten: versuchAntworten(v.id), fragen: FRAGEN });
});

app.post('/api/hr/evaluate/:id', (req, res) => {
  const s = tokens['session_'+req.body.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const v = findVersuch(parseInt(req.params.id));
  if (!v||v.status!=='wartet') return res.status(400).json({ error: 'Ungültig' });
  let sum = 0;
  FRAGEN.forEach(q => {
    const p = parseFloat(req.body['p_'+q.id])||0;
    const fb = (req.body['f_'+q.id]||'').trim();
    const a = DB.antworten.find(x => x.versuch_id === v.id && x.frage_id === q.id);
    if (a) { a.punkte = Math.min(p, q.maxPunkte||0); a.feedback = fb; a.geprüft = 1; }
    sum += Math.min(p, q.maxPunkte||0);
  });
  v.bestanden = req.body.bestanden === '1' ? 1 : 0;
  v.status = v.bestanden ? 'bestanden' : 'durchgefallen';
  v.punkte = sum;
  v.feedback = (req.body.feedback||'').trim();
  v.geprueft_von = s.roblox_id;
  const targetUser = findUser(v.roblox_id);
  if (targetUser && targetUser.versuche >= getMax(targetUser)) targetUser.gesperrt = 1;
  speichern();
  const totalM = FRAGEN.reduce((a,q)=>a+(q.maxPunkte||0),0);
  sendeBenachrichtigung(v.roblox_id, v.bestanden ? `Bestanden! ${sum}/${totalM} Punkte. ${v.feedback}` : `Durchgefallen. ${sum}/${totalM} Punkte. ${v.feedback}`);
  res.json({ success: true });
});

app.get('/api/hr/appeals', (req, res) => {
  const s = tokens['session_'+req.query.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const an = DB.anfragen.filter(a => a.status === 'offen').map(a => { const u=findUser(a.roblox_id); return {...a, name:u?.name, uid:u?.roblox_id}; }).sort((a,b) => (b.erstellt||'').localeCompare(a.erstellt||''));
  res.json({ anfragen: an });
});

app.post('/api/hr/appeal/:id/:action', (req, res) => {
  const s = tokens['session_'+req.body.token];
  const usr = s ? findUser(s.roblox_id) : null;
  if (!usr||!usr.is_hr) return res.status(403).json({ error: 'Nur HR' });
  const an = DB.anfragen.find(a => a.id === parseInt(req.params.id) && a.status === 'offen');
  if (!an) return res.status(404).json({ error: 'Nicht gefunden' });
  const targetUser = findUser(an.roblox_id);
  if (!targetUser) return res.status(404).json({ error: 'User nicht gefunden' });
  if (req.params.action === 'approve') {
    an.status = 'genehmigt';
    targetUser.bonus = 1; targetUser.gesperrt = 0; targetUser.versuche = 0; targetUser.anfrage_offen = 0; targetUser.anfrage_genutzt = 1;
    sendeBenachrichtigung(an.roblox_id, 'Dein Antrag auf einen weiteren Versuch wurde GENEHMIGT.');
  } else {
    an.status = 'abgelehnt';
    targetUser.anfrage_offen = 0; targetUser.gesperrt = 1;
    sendeBenachrichtigung(an.roblox_id, 'Dein Antrag auf einen weiteren Versuch wurde ABGELEHNT.');
  }
  speichern();
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server auf Port ${PORT}`));
