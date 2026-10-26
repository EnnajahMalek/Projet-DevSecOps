const { query } = require('../db/init-db');

async function createNote(title, content) {
  const { rows } = await query(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at',
    [title, content]
  );
  return rows[0];
}

module.exports = { createNote };
