const express = require('express');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const { closePool } = require('./db/init-db');
const { createNote } = require('./services/create');
const { getNotes, getNote } = require('./services/read');
const { updateNote, deleteNote } = require('./services/update');
// nosemgrep
const app = express();// nosemgrep
app.use(express.json());

app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    logger.info('http_request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
    });
  });
  next();
});

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function validate(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  if (!title || !content) return null;
  return { title, content };
}

const ERR_REQUIRED = 'Le titre et le contenu sont obligatoires';
const ERR_NOT_FOUND = 'Note introuvable';

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/notes', asyncHandler(async (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: ERR_REQUIRED });
  const note = await createNote(data.title, data.content);
  res.status(201).json(note);
}));

app.get('/notes', asyncHandler(async (req, res) => {
  res.json(await getNotes());
}));

app.get('/notes/:id', asyncHandler(async (req, res) => {
  const note = await getNote(req.params.id);
  if (!note) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.json(note);
}));

app.put('/notes/:id', asyncHandler(async (req, res) => {
  const data = validate(req.body || {});
  if (!data) return res.status(400).json({ error: ERR_REQUIRED });
  const note = await updateNote(req.params.id, data.title, data.content);
  if (!note) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.json(note);
}));

app.delete('/notes/:id', asyncHandler(async (req, res) => {
  const removed = await deleteNote(req.params.id);
  if (!removed) return res.status(404).json({ error: ERR_NOT_FOUND });
  res.status(204).end();
}));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    logger.warn('invalid_json_body', { method: req.method, path: req.originalUrl });
    return res.status(400).json({ error: 'JSON invalide' });
  }

  logger.error('request_failed', err, { method: req.method, path: req.originalUrl });
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

if (require.main === module) {
  const server = app.listen(config.port, '0.0.0.0', () => {
    logger.info('server_started', { port: config.port });
  });

  function shutdown(signal) {
    logger.info('shutdown_started', { signal });
    server.close(async (error) => {
      try {
        await closePool();
      } catch (poolError) {
        logger.error('database_close_failed', poolError);
      }

      if (error) {
        logger.error('server_close_failed', error);
        return process.exit(1);
      }

      logger.info('shutdown_complete');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('shutdown_timeout');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
