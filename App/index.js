const express = require('express');
const path = require('path');
const { createNote } = require('./services/create');
const { getNotes, getNote } = require('./services/read');
const { updateNote, deleteNote } = require('./services/update');

const app = express();
app.use(express.json());

function validate(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!title || !content) return null;
  return { title, content };
}

const ERR_REQUIRED = 'Le titre et le contenu sont obligatoires';
const ERR_NOT_FOUND = 'Note introuvable';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/notes', (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: ERR_REQUIRED });
  res.status(201).json(createNote(data.title, data.content));
});

app.get('/notes', (req, res) => {
  res.json(getNotes());
});

app.get('/notes/:id', (req, res) => {
  const note = getNote(req.params.id);
  if (!note) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.json(note);
});

app.put('/notes/:id', (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: ERR_REQUIRED });
  const note = updateNote(req.params.id, data.title, data.content);
  if (!note) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.json(note);
});

app.delete('/notes/:id', (req, res) => {
  const removed = deleteNote(req.params.id);
  if (!removed) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.status(204).end();
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON invalide' });
  }
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
