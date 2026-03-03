const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'whowins.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS battles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal1 TEXT NOT NULL,
        animal2 TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        html_content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeSlug(animal1, animal2) {
  return `${slugify(animal1)}-vs-${slugify(animal2)}`;
}

function insertBattle(animal1, animal2, htmlContent) {
  const d = getDb();
  const slug = makeSlug(animal1, animal2);
  const existing = d.prepare('SELECT id FROM battles WHERE slug = ?').get(slug);
  if (existing) {
    return { skipped: true, slug };
  }
  d.prepare('INSERT INTO battles (animal1, animal2, slug, html_content) VALUES (?, ?, ?, ?)')
    .run(animal1, animal2, slug, htmlContent);
  return { skipped: false, slug };
}

function getAllBattles() {
  return getDb().prepare('SELECT id, animal1, animal2, slug, created_at FROM battles ORDER BY created_at DESC').all();
}

function getBattleBySlug(slug) {
  return getDb().prepare('SELECT * FROM battles WHERE slug = ?').get(slug);
}

module.exports = { getDb, insertBattle, getAllBattles, getBattleBySlug, makeSlug };
