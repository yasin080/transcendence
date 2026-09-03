#!/bin/sh
set -e

cd /app

if [ ! -f package.json ]; then
    echo "[entrypoint] no frontend app found in /app — nothing to start"
    # Keep the container alive so `make shell-front` still works while the
    # frontend is being scaffolded.
    exec tail -f /dev/null
fi

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "[entrypoint] installing npm dependencies..."
    npm install --no-audit --no-fund
fi

exec "$@"
