const DEFAULT_PORT = 3000;
const DEFAULT_DB_PORT = 5432;

function parseAppPort(raw) {
  const port = raw === undefined ? DEFAULT_PORT : Number(raw);
  if (!Number.isInteger(port) || port <= 1024 || port > 65535) {
    throw new Error(`PORT must be an integer between 1025 and 65535 (received: ${raw})`);
  }
  return port;
}

function parseDbPort(raw) {
  const port = raw === undefined ? DEFAULT_DB_PORT : Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PGPORT must be an integer between 1 and 65535 (received: ${raw})`);
  }
  return port;
}

function buildDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  const db = {
    host: process.env.PGHOST || '127.0.0.1',
    port: parseDbPort(process.env.PGPORT),
    user: process.env.PGUSER || 'notes',
    database: process.env.PGDATABASE || 'notes',
  };

  if (process.env.PGPASSWORD) {
    db.password = process.env.PGPASSWORD;
  }

  return db;
}

module.exports = {
  port: parseAppPort(process.env.PORT),
  db: buildDbConfig(),
};
