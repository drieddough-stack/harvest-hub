/**
 * Database wrapper for Harvest Hub.
 * Uses team-db CLI to execute SQL against Turso-synced SQLite.
 *
 * IMPORTANT: Every call does pull -> execute -> push.
 * Do NOT use sqlite3 directly -- only this module talks to the database.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TMP_DIR = '/tmp';

/**
 * Execute a single SQL statement via team-db CLI.
 * Uses a temp file to avoid shell quoting issues.
 * @param {string} sql - A single SQL statement
 * @returns {Array|null} Parsed JSON result array, or null on error
 */
function query(sql) {
  const tmpFile = path.join(TMP_DIR, 'db-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.sql');
  try {
    fs.writeFileSync(tmpFile, sql, 'utf-8');
    const out = execSync('team-db "$(cat ' + tmpFile + ')"', {
      encoding: 'utf-8',
      timeout: 15000,
      maxBuffer: 1024 * 1024,
    });
    const trimmed = out.trim();
    if (!trimmed) return null;
    return JSON.parse(trimmed);
  } catch (err) {
    console.error('DB query error:', err.message);
    throw new Error('Database error: ' + err.message);
  } finally {
    try { fs.unlinkSync(tmpFile); } catch (_) { /* ignore */ }
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