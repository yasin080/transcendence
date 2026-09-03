#!/bin/sh
set -e

CERT_DIR=/etc/nginx/certs
MODE="${NGINX_MODE:-dev}"

# Self-signed certificate. The subject requires HTTPS; for a local/eval
# deployment a self-signed cert is the accepted approach. It lives on a named
# volume so it survives restarts and the browser only warns once.
if [ ! -f "${CERT_DIR}/localhost.crt" ] || [ ! -f "${CERT_DIR}/localhost.key" ]; then
    echo "[entrypoint] generating self-signed certificate..."
    mkdir -p "${CERT_DIR}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/localhost.key" \
        -out    "${CERT_DIR}/localhost.crt" \
        -subj   "/C=ES/ST=Madrid/L=Madrid/O=42/OU=ft_transcendence/CN=localhost" \
        -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1" \
        2>/dev/null
    chmod 600 "${CERT_DIR}/localhost.key"
fi

case "${MODE}" in
    dev|prod) ;;
    *) echo "[entrypoint] unknown NGINX_MODE '${MODE}', falling back to dev"; MODE=dev ;;
esac

echo "[entrypoint] serving in ${MODE} mode"
mkdir -p /etc/nginx/conf.d
cp "/etc/nginx/available/${MODE}.conf" /etc/nginx/conf.d/default.conf

nginx -t

exec "$@"
