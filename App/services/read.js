const { getDb } = require('../db/init-db');

function getNotes() {
  const db = getDb();
  return [...db.notes].sort((a, b) => b.id - a.id);
}

function getNote(id) {
  const db = getDb();
  return db.notes.find(n => n.id === parseInt(id, 10));
}

module.exports = { getNotes, getNote };
