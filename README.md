# jenkins-web-app

Sample Node.js (Express) web app for DevOps Practical Work 5. It runs through these pipelines:

- **Jenkins** (`Jenkinsfile`): Clone → Install → Test → Build → Docker image → push to Docker Hub → deploy to staging (port 8081) → verify
- **GitHub Actions** (`.github/workflows/release.yml`): on a `v*.*.*` tag it tests the app, pushes a Docker image to `ghcr.io`, and creates a GitHub Release

## Run locally

```bash
npm install
npm test        # 4 unit tests with node:test
npm start       # http://localhost:3000
```

## Endpoints

| Path | Response |
|---|---|
| `/` | HTML page with version, environment and container name |
| `/health` | `{"status":"ok", ...}` |
| `/api/sum?a=2&b=3` | `{"a":2,"b":3,"sum":5}` |

## Docker

```bash
docker run -d -p 8081:3000 emmgjules/jenkins-web-app:latest
```
