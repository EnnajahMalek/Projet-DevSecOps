const { query } = require('../db/init-db');
const { toNoteId } = require('./ids');

async function getNotes() {
  const { rows } = await query(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY id DESC'
  );
  return rows;
}

async function getNote(id) {
  const noteId = toNoteId(id);
  if (noteId === null) return null;

  const { rows } = await query(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = $1',
    [noteId]
  );
  return rows[0] || null;
}

module.exports = { getNotes, getNote };
