// Unit tests with Node's built-in test runner (node:test) - no extra test framework needed
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

let server;
let base;

before(async () => {
  server = createApp().listen(0); // port 0 = any free port
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test('GET / returns the home page', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /Hello from the Jenkins CI\/CD pipeline!/);
});

test('GET /health reports status ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.status, 'ok');
});

test('GET /api/sum adds two numbers', async () => {
  const res = await fetch(`${base}/api/sum?a=2&b=3`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual((await res.json()).sum, 5);
});

test('GET /api/sum rejects bad input with 400', async () => {
  const res = await fetch(`${base}/api/sum?a=x&b=3`);
  assert.strictEqual(res.status, 400);
});
