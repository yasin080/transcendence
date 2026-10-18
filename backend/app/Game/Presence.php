<?php

namespace App\Game;

/**
 * Who is still connected. Every page pings once a second; a player silent
 * for AWAY_MS stands still, drawn grey, until heard again, and is out after
 * GRACE_MS more. Like Bot, it lives only on the server.
 */
class Presence
{
    public const AWAY_MS = 2500;

    public const GRACE_MS = 10000;

    public static function apply(array &$game, array $lastSeen, int $now): void
    {
        foreach ($game['worms'] as $seat => &$worm) {
            if (! empty($worm['bot']) || ! $worm['alive']) {
                continue;
            }
            $silent = $now - ($lastSeen[$seat] ?? $game['startsAt']);
            $worm['away'] = $silent > self::AWAY_MS;
            if ($silent > self::AWAY_MS + self::GRACE_MS) {
                $worm['alive'] = false;
            }
        }
    }
}
