<?php

namespace App\Game;

/**
 * Bots are just another source of inputs, like a keyboard: they only look
 * one cell ahead and head for the nearest food, so they trap themselves the
 * way people do. Nothing here needs mirroring in the TypeScript logic.
 */
class Bot
{
    public static function play(array &$game): void
    {
        foreach ($game['worms'] as $seat => $worm) {
            if (! empty($worm['bot']) && $worm['alive']) {
                Game::turn($game, $seat, self::choose($game, $seat));
            }
        }
    }

    public static function choose(array $game, int $seat): array
    {
        $worm = $game['worms'][$seat];
        ['x' => $x, 'y' => $y] = $worm['dir'];
        $options = [$worm['dir'], ['x' => -$y, 'y' => $x], ['x' => $y, 'y' => -$x]];
        $safe = array_values(array_filter($options, fn ($dir) => self::isSafe($game, $worm, $dir)));
        if ($safe === []) {
            return $worm['dir'];
        }
        usort($safe, fn ($a, $b) => self::foodDistance($game, $worm, $a) <=> self::foodDistance($game, $worm, $b));

        return $safe[0];
    }

    private static function isSafe(array $game, array $worm, array $dir): bool
    {
        $cell = Worms::nextCell(['body' => $worm['body'], 'dir' => $dir], $game['board']);

        return Board::cellAt($game['board'], $cell['x'], $cell['y']) === Board::EMPTY && ! Worms::isOnWorm($game['worms'], $cell);
    }

    private static function foodDistance(array $game, array $worm, array $dir): int
    {
        $cell = Worms::nextCell(['body' => $worm['body'], 'dir' => $dir], $game['board']);
        $distances = array_map(fn ($food) => abs($food['x'] - $cell['x']) + abs($food['y'] - $cell['y']), $game['food']);

        return $distances ? min($distances) : 0;
    }
}
