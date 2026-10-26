const { query } = require('../db/init-db');
const { toNoteId } = require('./ids');

async function updateNote(id, title, content) {
  const noteId = toNoteId(id);
  if (noteId === null) return null;

  const { rows } = await query(
    `UPDATE notes
     SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, title, content, created_at, updated_at`,
    [title, content, noteId]
  );
  return rows[0] || null;
}

async function deleteNote(id) {
  const noteId = toNoteId(id);
  if (noteId === null) return false;

  const result = await query('DELETE FROM notes WHERE id = $1', [noteId]);
  return result.rowCount > 0;
}

module.exports = { updateNote, deleteNote };
