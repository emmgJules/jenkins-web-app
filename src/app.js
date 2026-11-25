// Express application (kept separate from the server so the tests can start it on a random port)
const express = require('express');
const os = require('os');
const pkg = require('../package.json');

const VERSION = process.env.APP_VERSION || pkg.version;
const ENVIRONMENT = process.env.APP_ENV || 'development';

function createApp() {
  const app = express();

  app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Jenkins Web App</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;background:#f4f7fb;color:#1f2d3d;margin:0}
  main{max-width:640px;margin:60px auto;background:#fff;border-radius:10px;padding:32px;box-shadow:0 2px 12px #0001}
  h1{color:#1f4e79;margin-top:0} td{padding:4px 12px 4px 0} code{background:#eef2f7;padding:2px 6px;border-radius:4px}
</style></head>
<body><main>
  <h1>Hello from the Jenkins CI/CD pipeline!</h1>
  <p>This Node.js web app was built, tested and deployed automatically by Jenkins after a push to GitHub.</p>
  <table>
    <tr><td>Version</td><td><code>${VERSION}</code></td></tr>
    <tr><td>Environment</td><td><code>${ENVIRONMENT}</code></td></tr>
    <tr><td>Container</td><td><code>${os.hostname()}</code></td></tr>
  </table>
</main></body></html>`);
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: VERSION, environment: ENVIRONMENT });
  });

  app.get('/api/sum', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return res.status(400).json({ error: 'a and b must be numbers' });
    }
    res.json({ a, b, sum: a + b });
  });

  return app;
}

module.exports = { createApp, VERSION };
