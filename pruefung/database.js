const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      roblox_id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      display_name TEXT,
      avatar_url TEXT,
      is_hr INTEGER DEFAULT 0,
      attempts_used INTEGER DEFAULT 0,
      is_blocked INTEGER DEFAULT 0,
      has_pending_appeal INTEGER DEFAULT 0,
      appeal_requested_at TEXT,
      bonus_attempts INTEGER DEFAULT 0,
      appeal_was_granted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS test_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_id INTEGER NOT NULL,
      attempt_number INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress',
      score REAL DEFAULT 0,
      max_score REAL DEFAULT 0,
      passed INTEGER DEFAULT 0,
      reviewed_by INTEGER,
      hr_feedback TEXT,
      evaluated_at TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (roblox_id) REFERENCES users(roblox_id),
      FOREIGN KEY (reviewed_by) REFERENCES users(roblox_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer_text TEXT,
      file_path TEXT,
      points_achieved REAL DEFAULT 0,
      points_max REAL DEFAULT 0,
      feedback TEXT,
      is_reviewed INTEGER DEFAULT 0,
      FOREIGN KEY (attempt_id) REFERENCES test_attempts(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appeals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roblox_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      reviewed_by INTEGER,
      reviewed_at TEXT,
      FOREIGN KEY (roblox_id) REFERENCES users(roblox_id),
      FOREIGN KEY (reviewed_by) REFERENCES users(roblox_id)
    )
  `);

  // Migrations for missing columns
  try { db.run('ALTER TABLE users ADD COLUMN bonus_attempts INTEGER DEFAULT 0'); } catch (e) { /* exists */ }
  try { db.run('ALTER TABLE users ADD COLUMN appeal_was_granted INTEGER DEFAULT 0'); } catch (e) { /* exists */ }
  try { db.run('ALTER TABLE test_attempts ADD COLUMN evaluated_at TEXT'); } catch (e) { /* exists */ }
  try { db.run('ALTER TABLE test_attempts ADD COLUMN hr_feedback TEXT'); } catch (e) { /* exists */ }

  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Datenbank nicht initialisiert. Rufe initDatabase() auf.');
  }
  return {
    prepare(sql) {
      return {
        run(...params) {
          try {
            db.run(sql, params);
            saveDb();
            const result = db.exec("SELECT last_insert_rowid() as id");
            const lastId = result[0]?.values[0][0];
            return { lastInsertRowid: lastId };
          } catch (err) {
            console.error('SQL run error:', sql.slice(0, 80), err.message);
            throw err;
          }
        },
        get(...params) {
          try {
            const stmt = db.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            if (stmt.step()) {
              const cols = stmt.getColumnNames();
              const vals = stmt.get();
              stmt.free();
              const row = {};
              cols.forEach((c, i) => { row[c] = vals[i]; });
              return row;
            }
            stmt.free();
            return undefined;
          } catch (err) {
            console.error('SQL get error:', sql.slice(0, 80), err.message);
            throw err;
          }
        },
        all(...params) {
          try {
            const results = [];
            const stmt = db.prepare(sql);
            if (params.length > 0) stmt.bind(params);
            while (stmt.step()) {
              const cols = stmt.getColumnNames();
              const vals = stmt.get();
              const row = {};
              cols.forEach((c, i) => { row[c] = vals[i]; });
              results.push(row);
            }
            stmt.free();
            return results;
          } catch (err) {
            console.error('SQL all error:', sql.slice(0, 80), err.message);
            throw err;
          }
        }
      };
    },
    run(sql, params) {
      try {
        db.run(sql, params);
        saveDb();
      } catch (err) {
        console.error('SQL run error:', sql.slice(0, 80), err.message);
        throw err;
      }
    },
    exec(sql) {
      return db.exec(sql);
    }
  };
}

function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

module.exports = { initDatabase, getDb, closeDb };
