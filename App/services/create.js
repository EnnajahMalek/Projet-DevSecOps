const { getDb, writeDb } = require('../db/init-db');

function createNote(title, content) {
  const db = getDb();
  const id = db.lastId + 1;
  const note = { id, title, content, created_at: new Date().toISOString() };
  db.notes.push(note);
  db.lastId = id;
  writeDb(db);
  return note;
}

module.exports = { createNote };
