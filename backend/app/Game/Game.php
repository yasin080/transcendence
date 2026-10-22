<?php

namespace App\Game;

class Game
{
    /** Ticks a dropped bomb waits before going off. */
    public const FUSE = 8;

    /** Ticks in a row a worm can stay blocked before it dies: 5 s at the medium speed (200 ms). */
    public const STUCK = 15;

    public static function create(array $settings): array
    {
        $board = Board::generate($settings);
        $worms = Worms::spawn($board, $settings);
        foreach ($worms as $worm) {
            foreach ($worm['body'] as $p) {
                $board['cells'][$p['y'] * $board['width'] + $p['x']] = Board::EMPTY;
            }
        }
        $game = ['settings' => $settings, 'board' => $board, 'worms' => $worms, 'food' => [], 'pickups' => [], 'bombs' => [], 'blasts' => []];
        for ($i = 0; $i < $settings['food'] && $cell = self::freeCell($game); $i++) {
            $game['food'][] = $cell;
        }
        for ($i = 0; $i < $settings['bombs'] && $cell = self::freeCell($game); $i++) {
            $game['pickups'][] = $cell;
        }

        return $game;
    }

    public static function turn(array &$game, int $player, array $dir): void
    {
        $game['worms'][$player]['wanted'] = $dir;
    }

    public static function steer(array &$game, int $player, string $side): void
    {
        ['x' => $x, 'y' => $y] = $game['worms'][$player]['dir'];
        $game['worms'][$player]['wanted'] = $side === 'left' ? ['x' => -$y, 'y' => $x] : ['x' => $y, 'y' => -$x];
    }

    public static function tick(array &$game): void
    {
        foreach ($game['worms'] as &$worm) {
            if (self::moves($worm)) {
                Worms::applyTurn($worm);
            }
        }
        unset($worm);

        $next = array_map(fn ($worm) => Worms::nextCell($worm, $game['board']), $game['worms']);
        $crashed = array_map(fn ($i) => self::moves($game['worms'][$i]) && self::headOn($game, $next, $i), array_keys($game['worms']));

        foreach (array_keys($game['worms']) as $i) {
            if ($crashed[$i]) {
                $game['worms'][$i]['alive'] = false;
            } elseif (self::moves($game['worms'][$i])) {
                self::moveWorm($game, $i, $next[$i]);
            }
        }

        self::explode($game);
    }

    public static function blastCells(array $board, array $cell): array
    {
        $cells = [];
        for ($dy = -1; $dy <= 1; $dy++) {
            for ($dx = -1; $dx <= 1; $dx++) {
                $x = ($cell['x'] + $dx + $board['width']) % $board['width'];
                $y = ($cell['y'] + $dy + $board['height']) % $board['height'];
                if (Board::cellAt($board, $x, $y) === Board::EMPTY) {
                    $cells[] = ['x' => $x, 'y' => $y];
                }
            }
        }

        return $cells;
    }

    public static function isOver(array $game): bool
    {
        $alive = count(array_filter($game['worms'], fn ($worm) => $worm['alive']));

        return count($game['worms']) === 1 ? $alive === 0 : $alive <= 1;
    }

    private static function moves(array $worm): bool
    {
        return $worm['alive'] && empty($worm['away']);
    }

    private static function headOn(array $game, array $next, int $i): bool
    {
        foreach ($game['worms'] as $j => $other) {
            $sameCell = $next[$j] == $next[$i];
            $swap = $next[$i] == $other['body'][0] && $next[$j] == $game['worms'][$i]['body'][0];
            if ($j !== $i && self::moves($other) && ($sameCell || $swap)) {
                return true;
            }
        }

        return false;
    }

    private static function moveWorm(array &$game, int $i, array $next): void
    {
        $worm = &$game['worms'][$i];

        $wall = Board::cellAt($game['board'], $next['x'], $next['y']) !== Board::EMPTY;
        if ($wall || Worms::isOnWorm($game['worms'], $next)) {
            $hit = $wall ? $game['settings']['wallHit'] : $game['settings']['bodyHit'];
            $worm['stuck']++;
            if ($hit === 'die' || $worm['stuck'] >= self::STUCK) {
                $worm['alive'] = false;
            }

            return;
        }

        $worm['stuck'] = 0;

        $tail = end($worm['body']);
        $eaten = self::indexAt($game['food'], $next);
        $body = $eaten === null ? array_slice($worm['body'], 0, -1) : $worm['body'];
        $worm['body'] = [$next, ...$body];
        if ($eaten !== null) {
            self::respawn($game, 'food', $eaten);
        }

        // A bomb goes in through the mouth and drops at once where the tail was.
        $swallowed = self::indexAt($game['pickups'], $next);
        if ($swallowed !== null) {
            $game['bombs'][] = ['x' => $tail['x'], 'y' => $tail['y'], 'fuse' => self::FUSE];
            self::respawn($game, 'pickups', $swallowed);
        }
    }

    /** Takes item $index off the $list and lays out another on a free cell. */
    private static function respawn(array &$game, string $list, int $index): void
    {
        array_splice($game[$list], $index, 1);
        if ($cell = self::freeCell($game)) {
            $game[$list][] = $cell;
        }
    }

    /**
     * Bombs whose fuse runs out blow up: on the head it kills, on the body it
     * cuts the tail off. `blasts` keeps where they went off, for the browser.
     */
    private static function explode(array &$game): void
    {
        $game['blasts'] = [];
        $ticking = [];
        foreach ($game['bombs'] as $bomb) {
            if (--$bomb['fuse'] > 0) {
                $ticking[] = $bomb;
            } else {
                $game['blasts'][] = ['x' => $bomb['x'], 'y' => $bomb['y']];
            }
        }
        $game['bombs'] = $ticking;

        $hit = array_merge(...array_map(fn ($blast) => self::blastCells($game['board'], $blast), $game['blasts']));
        foreach ($game['worms'] as &$worm) {
            if (! $worm['alive']) {
                continue;
            }
            foreach ($worm['body'] as $k => $segment) {
                if (self::indexAt($hit, $segment) !== null) {
                    if ($k === 0) {
                        $worm['alive'] = false;
                    } else {
                        $worm['body'] = array_slice($worm['body'], 0, $k);
                    }
                    break;
                }
            }
        }
    }

    /** Index of the item (food, bomb...) lying on $cell, if any. */
    private static function indexAt(array $items, array $cell): ?int
    {
        foreach ($items as $i => $item) {
            if ($item['x'] === $cell['x'] && $item['y'] === $cell['y']) {
                return $i;
            }
        }

        return null;
    }

    private static function freeCell(array $game): ?array
    {
        $width = $game['board']['width'];
        $taken = [...$game['food'], ...$game['pickups'], ...$game['bombs']];
        $free = [];
        foreach ($game['board']['cells'] as $i => $type) {
            $cell = ['x' => $i % $width, 'y' => intdiv($i, $width)];
            if ($type === Board::EMPTY && self::indexAt($taken, $cell) === null && ! Worms::isOnWorm($game['worms'], $cell)) {
                $free[] = $cell;
            }
        }

        return $free ? $free[array_rand($free)] : null;
    }
}
