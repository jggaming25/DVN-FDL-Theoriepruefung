const { initDatabase, getDb } = require('./database');
const config = require('./config/app.json');

async function setup() {
  console.log('Initialisiere Datenbank...');
  await initDatabase();
  console.log('Datenbank erfolgreich initialisiert.');

  const db = getDb();

  console.log('Füge HR-Benutzer hinzu...');
  const insertUser = db.prepare(`INSERT OR IGNORE INTO users (roblox_id, username, display_name, is_hr) VALUES (?, ?, ?, ?)`);
  const hrIds = config.hrRoles;

  hrIds.forEach(function(id) {
    insertUser.run(id, 'hr_user_' + id, 'HR-Mitarbeiter', 1);
  });

  if (hrIds.length > 0) {
    console.log('HR-Benutzer mit IDs ' + hrIds.join(', ') + ' wurden angelegt.');
    console.log('ACHTUNG: Ersetze die IDs in config/app.json mit echten Roblox-User-IDs!');
  }

  console.log('');
  console.log('Setup abgeschlossen!');
  console.log('Starte die App mit: npm start');
}

setup().catch(err => {
  console.error('Setup-Fehler:', err);
  process.exit(1);
});
