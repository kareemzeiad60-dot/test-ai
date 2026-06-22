#!/usr/bin/env bash
set -e

echo "[startup] Starting Flask predict server..."
PREDICT_PORT=5000 python3 artifacts/cattle-predict/server.py &
FLASK_PID=$!

echo "[startup] Waiting for Flask to be ready..."
for i in $(seq 1 60); do
  if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo "[startup] Flask is ready."
    break
  fi
  if [ $i -eq 60 ]; then
    echo "[startup] ERROR: Flask did not start in time."
    exit 1
  fi
  sleep 2
done

echo "[startup] Starting Node.js API server..."
exec node --enable-source-maps artifacts/api-server/dist/index.mjs
