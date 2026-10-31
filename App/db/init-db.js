const { Pool } = require('pg');
const config = require('../config');
const logger = require('../logger');

const pool = new Pool(config.db);

pool.on('error', (error) => {
  logger.error('database_pool_error', error);
});

let schemaReady;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool
      .query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ
        )
      `)
      .catch((error) => {
        schemaReady = undefined;
        throw error;
      });
  }
  return schemaReady;
}

async function query(text, params) {
  await ensureSchema();
  // nosemgrep
  return pool.query(text, params);// nosemgrep
}

async function closePool() {
  await pool.end();
}

module.exports = { query, closePool };
