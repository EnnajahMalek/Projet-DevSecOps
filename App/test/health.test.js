const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');

describe('health endpoint', () => {
  test('GET /healthz returns 200 with an ok status', async (t) => {
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise((resolve) => server.close(resolve)));

    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();

    const response = await fetch(`http://127.0.0.1:${port}/healthz`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });
});
