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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/notes', (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: 'Title and content are required' });
  res.status(201).json(createNote(data.title, data.content));
});

app.get('/notes', (req, res) => {
  res.json(getNotes());
});

app.get('/notes/:id', (req, res) => {
  const note = getNote(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.put('/notes/:id', (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: 'Title and content are required' });
  const note = updateNote(req.params.id, data.title, data.content);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.delete('/notes/:id', (req, res) => {
  const removed = deleteNote(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Note not found' });
  res.status(204).end();
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
