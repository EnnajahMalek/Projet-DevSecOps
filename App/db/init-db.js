const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'notes.json');

function normalize(db) {
  const notes = Array.isArray(db.notes) ? db.notes.filter(n => n && typeof n === 'object') : [];
  const maxId = notes.reduce((max, n) => Math.max(max, Number(n.id) || 0), 0);
  return { notes, lastId: Math.max(Number(db.lastId) || 0, maxId) };
}

function ensureDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ notes: [], lastId: 0 }, null, 2));
  }
}

function getDb() {
  ensureDb();
  try {
    return normalize(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
  } catch (err) {
    try {
      fs.copyFileSync(dbPath, `${dbPath}.corrupt`);
    } catch (copyErr) {}
    return { notes: [], lastId: 0 };
  }
}

function writeDb(db) {
  ensureDb();
  const tmpPath = `${dbPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(normalize(db), null, 2));
  fs.renameSync(tmpPath, dbPath);
}

module.exports = { getDb, writeDb };
