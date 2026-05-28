/**
 * Database wrapper for Harvest Hub.
 * Uses better-sqlite3 for standalone SQLite.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'harvest-hub.db');

let db;

function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Execute a single SQL statement.
 * @param {string} sql - A single SQL statement
 * @returns {Array|null} Parsed JSON result array, or null on error
 */
function query(sql) {
  try {
    const d = getDb();
    const trimmed = sql.trim();
    
    if (trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('WITH') || trimmed.toUpperCase().startsWith('PRAGMA')) {
      const rows = d.prepare(trimmed).all();
      return rows && rows.length > 0 ? rows : null;
    } else {
      d.prepare(trimmed).run();
      return null;
    }
  } catch (err) {
    console.error('DB query error:', err.message);
    throw new Error('Database error: ' + err.message);
  }
}

/**
 * Get a single row by ID from a table.
 */
function getById(table, id) {
  const rows = query("SELECT * FROM " + table + " WHERE id = '" + id + "'");
  return rows && rows.length > 0 ? rows[0] : null;
}

/**
 * List all rows from a table with optional WHERE clause.
 */
function list(table, where) {
  if (!where) where = '1=1';
  return query("SELECT * FROM " + table + " WHERE " + where + " ORDER BY created_at DESC") || [];
}

/**
 * Insert a row.
 * @param {string} table - Table name
 * @param {object} data - Column-value pairs
 * @returns {object|null} The inserted row
 */
function insert(table, data) {
  const keys = Object.keys(data);
  const vals = keys.map(function(k) {
    var v = data[k];
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    return "'" + String(v).replace(/'/g, "''") + "'";
  });
  const sql = "INSERT INTO " + table + " (" + keys.join(', ') + ") VALUES (" + vals.join(', ') + ")";
  query(sql);
  if (data.id) {
    return getById(table, data.id);
  }
  return null;
}

/**
 * Update a row by ID.
 */
function update(table, id, data) {
  var sets = [];
  Object.keys(data).forEach(function(k) {
    if (k === 'id') return;
    var v = data[k];
    if (v === null || v === undefined) {
      sets.push(k + ' = NULL');
    } else if (typeof v === 'number') {
      sets.push(k + ' = ' + v);
    } else {
      sets.push(k + " = '" + String(v).replace(/'/g, "''") + "'");
    }
  });
  sets.push("updated_at = datetime('now')");
  const sql = "UPDATE " + table + " SET " + sets.join(', ') + " WHERE id = '" + id + "'";
  query(sql);
  return getById(table, id);
}

/**
 * Soft-delete by setting active=0.
 */
function softDelete(table, id) {
  return update(table, id, { active: 0 });
}

/**
 * Delete a row permanently.
 */
function hardDelete(table, id) {
  query("DELETE FROM " + table + " WHERE id = '" + id + "'");
  return true;
}

module.exports = { query, getById, list, insert, update, softDelete, hardDelete };
