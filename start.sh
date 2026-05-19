#!/bin/sh
# Start the FastAPI backend in the background on port 8000
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start the Next.js frontend in the foreground on $PORT (Cloud Run injects this)
cd /app/frontend
export NODE_ENV=production
export HOSTNAME=0.0.0.0
export BACKEND_URL=http://localhost:8000
exec node server.js
