<?php

/*
 * The php container receives the root .env through compose's `env_file`, so
 * APP_ENV=local, DB_CONNECTION=mysql and friends are already in $_SERVER by the
 * time PHPUnit starts. phpunit.xml's <env force="true"> only reaches putenv(),
 * which Laravel ignores — it reads $_ENV and $_SERVER. Without the overrides
 * below the suite runs as `local` against the development MariaDB, and
 * RefreshDatabase drops the real database.
 *
 * This file is the single source of truth for the test environment; keep the
 * <php> block out of phpunit.xml so the two cannot drift apart.
 */

$overrides = [
    'APP_ENV' => 'testing',
    'APP_MAINTENANCE_DRIVER' => 'file',
    'BCRYPT_ROUNDS' => '4',
    'BROADCAST_CONNECTION' => 'null',
    'CACHE_STORE' => 'array',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
    'MAIL_MAILER' => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'SESSION_DRIVER' => 'array',
    'SESSION_DOMAIN' => 'null',
    'TELESCOPE_ENABLED' => 'false',
    'PULSE_ENABLED' => 'false',
    'NIGHTWATCH_ENABLED' => 'false',
];

foreach ($overrides as $key => $value) {
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
    putenv("{$key}={$value}");
}

// A DB_URL inherited from the environment would win over DB_CONNECTION.
unset($_ENV['DB_URL'], $_SERVER['DB_URL']);
putenv('DB_URL');

require __DIR__.'/../vendor/autoload.php';
