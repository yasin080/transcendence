#!/bin/sh
set -e

cd /app

if [ ! -f package.json ]; then
    echo "[entrypoint] no frontend app found in /app — nothing to start"
    # Keep the container alive so `make shell-front` still works while the
    # frontend is being scaffolded.
    exec tail -f /dev/null
fi

# npm writes node_modules/.package-lock.json after every install, so if it is
# missing (fresh volume) or older than the manifests, someone added or changed
# dependencies since the last install and the volume needs updating.
installed=node_modules/.package-lock.json
if [ ! -f "$installed" ] || [ package.json -nt "$installed" ] \
    || { [ -f package-lock.json ] && [ package-lock.json -nt "$installed" ]; }; then
    echo "[entrypoint] installing npm dependencies..."
    npm install --no-audit --no-fund
fi

exec "$@"
