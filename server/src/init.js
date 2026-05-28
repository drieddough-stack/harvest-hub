/**
 * Database initialization and seeding for Harvest Hub.
 * Run on first startup to ensure schema and seed data exist.
 */
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'harvest-hub.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const exists = fs.existsSync(DB_PATH);
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Apply schema
  if (fs.existsSync(SCHEMA_PATH)) {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    // Execute each statement separately
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        db.prepare(stmt).run();
      } catch (e) {
        // Ignore "already exists" errors
        if (!e.message.includes('already exists')) {
          console.error('Schema error:', e.message);
        }
      }
    }
  }

  // Seed if db is new (producers table should be empty)
  const count = db.prepare("SELECT COUNT(*) as c FROM producers").get();
  if (count.c === 0 && fs.existsSync(SEED_PATH)) {
    console.log('Seeding database with initial data...');
    const seed = fs.readFileSync(SEED_PATH, 'utf-8');
    const statements = seed.split(';').filter(s => s.trim().length > 0);
    for (const stmt of statements) {
      try {
        db.prepare(stmt).run();
      } catch (e) {
        console.error('Seed error:', e.message);
      }
    }
    console.log('Database seeded successfully.');
  }

  db.close();
}

module.exports = { initDb };