<?php

namespace App\Game;

/**
 * Bots are just another source of inputs, like a keyboard: they only look
 * one cell ahead and head for the nearest food or bomb, keeping out of a
 * blast about to go off, so they trap themselves the way people do.
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
        $danger = self::danger($game);
        $safe = array_values(array_filter($options, fn ($dir) => self::isSafe($game, $worm, $dir, $danger)));
        if ($safe === []) {
            return $worm['dir'];
        }
        usort($safe, fn ($a, $b) => self::foodDistance($game, $worm, $a) <=> self::foodDistance($game, $worm, $b));

        return $safe[0];
    }

    private static function isSafe(array $game, array $worm, array $dir, array $danger): bool
    {
        $cell = Worms::nextCell(['body' => $worm['body'], 'dir' => $dir], $game['board']);

        return Board::cellAt($game['board'], $cell['x'], $cell['y']) === Board::EMPTY
            && ! Worms::isOnWorm($game['worms'], $cell)
            && ! in_array($cell, $danger);
    }

    private static function danger(array $game): array
    {
        $cells = [];
        foreach ($game['bombs'] as $bomb) {
            if ($bomb['fuse'] <= 2) {
                array_push($cells, ...Game::blastCells($game['board'], $bomb));
            }
        }

        return $cells;
    }

    private static function foodDistance(array $game, array $worm, array $dir): int
    {
        $cell = Worms::nextCell(['body' => $worm['body'], 'dir' => $dir], $game['board']);
        $targets = [...$game['food'], ...$game['pickups']];
        $distances = array_map(fn ($target) => abs($target['x'] - $cell['x']) + abs($target['y'] - $cell['y']), $targets);

        return $distances ? min($distances) : 0;
    }
}
