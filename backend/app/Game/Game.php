<?php

namespace App\Game;

class Game
{
    public static function create(array $settings): array
    {
        $board = Board::generate($settings);
        $worms = Worms::spawn($board, $settings);
        foreach ($worms as $worm) {
            foreach ($worm['body'] as $p) {
                $board['cells'][$p['y'] * $board['width'] + $p['x']] = Board::EMPTY;
            }
        }
        $game = ['settings' => $settings, 'board' => $board, 'worms' => $worms, 'food' => []];
        for ($i = 0; $i < $settings['food'] && $cell = self::freeCell($game); $i++) {
            $game['food'][] = $cell;
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
            if ($hit === 'die') {
                $worm['alive'] = false;
            }

            return;
        }

        $eaten = self::foodAt($game, $next);
        $body = $eaten === null ? array_slice($worm['body'], 0, -1) : $worm['body'];
        $worm['body'] = [$next, ...$body];
        if ($eaten !== null) {
            array_splice($game['food'], $eaten, 1);
            if ($cell = self::freeCell($game)) {
                $game['food'][] = $cell;
            }
        }
    }

    private static function foodAt(array $game, array $cell): ?int
    {
        foreach ($game['food'] as $i => $food) {
            if ($food['x'] === $cell['x'] && $food['y'] === $cell['y']) {
                return $i;
            }
        }

        return null;
    }

    private static function freeCell(array $game): ?array
    {
        $width = $game['board']['width'];
        $free = [];
        foreach ($game['board']['cells'] as $i => $type) {
            $cell = ['x' => $i % $width, 'y' => intdiv($i, $width)];
            if ($type === Board::EMPTY && self::foodAt($game, $cell) === null && ! Worms::isOnWorm($game['worms'], $cell)) {
                $free[] = $cell;
            }
        }

        return $free ? $free[array_rand($free)] : null;
    }
}
