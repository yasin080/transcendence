FROM php:8.4-fpm-alpine

ARG UID=1000
ARG GID=1000

# pcntl and sockets are required by Reverb and by long-running artisan workers.
RUN apk add --no-cache \
        bash git curl openssl \
        icu-dev libzip-dev libpng-dev libjpeg-turbo-dev freetype-dev oniguruma-dev \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS linux-headers \
    && docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_mysql bcmath zip gd intl opcache pcntl sockets \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps \
    && rm -rf /tmp/pear

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Align www-data with the host user so files written by artisan/composer are
# not left owned by root on the host. Harmless if the ids already exist.
RUN apk add --no-cache shadow \
    && (groupmod -o -g "${GID}" www-data 2>/dev/null || true) \
    && (usermod  -o -u "${UID}" -g "${GID}" www-data 2>/dev/null || true) \
    && apk del shadow

COPY docker/php/conf/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm", "-F", "-R"]
