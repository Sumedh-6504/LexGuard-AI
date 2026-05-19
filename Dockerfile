# ============================================================================
# LexGuard – Single-container Dockerfile (Frontend + Backend)
# Runs Next.js on :3000 and FastAPI on :8000 behind supervisord.
# Cloud Run sends traffic to $PORT (default 3000 = the Next.js server).
# Next.js API routes proxy /api/* → http://localhost:8000 (internal).
# ============================================================================

# ── Stage 1: Install Node dependencies ──────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build the Next.js production bundle ────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The frontend proxies to the backend at localhost:8000 inside the container
ENV BACKEND_URL=http://localhost:8000
RUN npm run build

# ── Stage 3: Final production image ─────────────────────────────────────────
FROM python:3.11-slim AS runner
WORKDIR /app

# Install Node.js 20 into the Python image
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ── Python backend ──────────────────────────────────────────────────────────
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend/ /app/backend/

# ── Next.js frontend (standalone output) ────────────────────────────────────
COPY --from=builder /app/public /app/frontend/public
COPY --from=builder /app/.next/standalone /app/frontend/
COPY --from=builder /app/.next/static /app/frontend/.next/static

# ── Supervisord config (runs both processes) ────────────────────────────────
RUN mkdir -p /var/log/supervisor
COPY <<'EOF' /etc/supervisor/conf.d/lexguard.conf
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0
loglevel=info

[program:backend]
command=uvicorn main:app --host 0.0.0.0 --port 8000
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=USE_VERTEX_AI="%(ENV_USE_VERTEX_AI)s",GOOGLE_CLOUD_PROJECT="%(ENV_GOOGLE_CLOUD_PROJECT)s",GOOGLE_CLOUD_LOCATION="%(ENV_GOOGLE_CLOUD_LOCATION)s"

[program:frontend]
command=node server.js
directory=/app/frontend
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=NODE_ENV="production",PORT="%(ENV_PORT)s",HOSTNAME="0.0.0.0",BACKEND_URL="http://localhost:8000"
EOF

# Cloud Run injects $PORT; Next.js listens on it, backend always on 8000
ENV PORT=3000
EXPOSE 3000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/lexguard.conf"]
