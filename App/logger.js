function serializeError(error) {
  if (!error) return undefined;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error.code ? { code: error.code } : {}),
  };
}

function write(level, message, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  process.stdout.write(`${JSON.stringify(entry)}\n`);
}

module.exports = {
  info(message, fields) {
    write('info', message, fields);
  },
  warn(message, fields) {
    write('warn', message, fields);
  },
  error(message, error, fields = {}) {
    write('error', message, { ...fields, error: serializeError(error) });
  },
};
