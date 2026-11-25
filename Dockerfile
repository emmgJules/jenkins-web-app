# Small production image for the Node.js web app
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies (uses package-lock.json for repeatable builds)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the application code
COPY index.js ./
COPY src ./src

ARG APP_VERSION=""
ENV NODE_ENV=production PORT=3000 APP_VERSION=${APP_VERSION}
EXPOSE 3000

# Do not run as root inside the container
USER node

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "index.js"]
