const { getDb, writeDb } = require('../db/init-db');

function updateNote(id, title, content) {
  const db = getDb();
  const note = db.notes.find(n => n.id === parseInt(id, 10));
  if (!note) return null;
  note.title = title;
  note.content = content;
  note.updated_at = new Date().toISOString();
  writeDb(db);
  return note;
}

function deleteNote(id) {
  const db = getDb();
  const remaining = db.notes.filter(n => n.id !== parseInt(id, 10));
  if (remaining.length === db.notes.length) return false;
  db.notes = remaining;
  writeDb(db);
  return true;
}

module.exports = { updateNote, deleteNote };
