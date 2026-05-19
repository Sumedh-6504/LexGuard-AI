# ============================================================================
# LexGuard – Single-container Dockerfile (Frontend + Backend)
# Runs Next.js on $PORT and FastAPI on :8000 via a simple shell script.
# ============================================================================

# ── Stage 1: Install Node dependencies ──────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build the Next.js production bundle ────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV BACKEND_URL=http://localhost:8000
RUN npm run build

# ── Stage 3: Final production image ─────────────────────────────────────────
FROM python:3.11-slim AS runner
WORKDIR /app

# Install Node.js 22 (no supervisor needed)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
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

# ── Startup script ──────────────────────────────────────────────────────────
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Cloud Run injects $PORT; defaults to 3000
ENV PORT=3000
EXPOSE 3000

CMD ["/app/start.sh"]
