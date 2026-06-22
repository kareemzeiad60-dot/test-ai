#!/usr/bin/env bash
set -e

echo "[build] Installing Python dependencies for predict server..."
pip install -r artifacts/cattle-predict/requirements.txt --quiet

echo "[build] Building API server..."
pnpm --filter @workspace/api-server run build
