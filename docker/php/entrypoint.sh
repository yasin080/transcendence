#!/bin/sh
set -e

cd /var/www/html

# Nothing to bootstrap until Laravel has been scaffolded into ./backend.
if [ ! -f artisan ]; then
    echo "[entrypoint] no Laravel app found in /var/www/html — starting anyway"
    exec "$@"
fi

echo "[entrypoint] waiting for ${DB_HOST}:${DB_PORT}..."
until php -r '
    try {
        new PDO(
            "mysql:host=" . getenv("DB_HOST") . ";port=" . getenv("DB_PORT"),
            getenv("DB_USERNAME"),
            getenv("DB_PASSWORD")
        );
    } catch (Throwable $e) {
        fwrite(STDERR, "[entrypoint] " . $e->getMessage() . "\n");
        exit(1);
    }
'; do
    sleep 2
done
echo "[entrypoint] database is up"

if [ ! -d vendor ] || ! cmp -s composer.lock vendor/.composer.lock.installed 2>/dev/null; then
    echo "[entrypoint] installing composer dependencies..."
    composer install --no-interaction --prefer-dist --no-progress
    cp composer.lock vendor/.composer.lock.installed
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    echo "[entrypoint] generating APP_KEY..."
    php artisan key:generate --force
fi

# Only the php-fpm service migrates; the workers must not race against it.
if [ "${RUN_MIGRATIONS}" = "true" ]; then
    echo "[entrypoint] running migrations..."
    php artisan migrate --force
    echo "[entrypoint] seeding..."
    php artisan db:seed --force
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R ug+rw storage bootstrap/cache 2>/dev/null || true

exec "$@"
