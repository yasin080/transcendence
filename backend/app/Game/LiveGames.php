<?php

namespace App\Game;

use Illuminate\Support\Facades\Redis;

class LiveGames
{
    private const ACTIVE = 'games:active';

    public static function start(int $id, array $state): void
    {
        self::save($id, $state);
        Redis::sadd(self::ACTIVE, $id);
    }

    public static function active(): array
    {
        return array_map('intval', Redis::smembers(self::ACTIVE));
    }

    public static function load(int $id): ?array
    {
        $json = Redis::get("game:$id");

        return $json ? json_decode($json, true) : null;
    }

    public static function save(int $id, array $state): void
    {
        Redis::set("game:$id", json_encode($state));
    }

    public static function push(int $id, int $seat, array $input): void
    {
        Redis::hset("game:$id:inputs", $seat, json_encode($input));
    }

    public static function takeInputs(int $id): array
    {
        [$inputs] = Redis::transaction(function ($redis) use ($id) {
            $redis->hgetall("game:$id:inputs");
            $redis->del("game:$id:inputs");
        });

        return array_map(fn ($json) => json_decode($json, true), $inputs ?: []);
    }

    public static function finish(int $id): void
    {
        Redis::srem(self::ACTIVE, $id);
        Redis::expire("game:$id", 3600);
    }
}
