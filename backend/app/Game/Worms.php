<?php

namespace App\Game;

class Worms
{
    public static function spawn(array $board, array $settings): array
    {
        $length = $settings['startLength'];
        $right = $board['width'] - 2;
        $top = $board['height'] - 2;

        $spawns = [
            ['colour' => '#33d1ff', 'head' => ['x' => $length, 'y' => 1], 'dir' => ['x' => 1, 'y' => 0]],
            ['colour' => '#ff6b52', 'head' => ['x' => $right, 'y' => $length], 'dir' => ['x' => 0, 'y' => 1]],
            ['colour' => '#8fff57', 'head' => ['x' => $right + 1 - $length, 'y' => $top], 'dir' => ['x' => -1, 'y' => 0]],
            ['colour' => '#eb99ff', 'head' => ['x' => 1, 'y' => $top + 1 - $length], 'dir' => ['x' => 0, 'y' => -1]],
        ];

        $worms = [];
        foreach (array_slice($spawns, 0, $settings['players']) as $i => $spawn) {
            ['head' => $head, 'dir' => $dir] = $spawn;
            $body = [];
            for ($k = 0; $k < $length; $k++) {
                $body[] = ['x' => $head['x'] - $dir['x'] * $k, 'y' => $head['y'] - $dir['y'] * $k];
            }
            $worms[] = [
                'name' => 'Player '.($i + 1),
                'colour' => $spawn['colour'],
                'body' => $body,
                'dir' => $dir,
                'wanted' => $dir,
                'alive' => true,
                'stuck' => 0,
            ];
        }

        return $worms;
    }

    public static function applyTurn(array &$worm): void
    {
        $backwards = $worm['wanted']['x'] === -$worm['dir']['x'] && $worm['wanted']['y'] === -$worm['dir']['y'];
        if (! $backwards) {
            $worm['dir'] = $worm['wanted'];
        }
    }

    public static function nextCell(array $worm, array $board): array
    {
        $head = $worm['body'][0];

        return [
            'x' => ($head['x'] + $worm['dir']['x'] + $board['width']) % $board['width'],
            'y' => ($head['y'] + $worm['dir']['y'] + $board['height']) % $board['height'],
        ];
    }

    public static function isOnWorm(array $worms, array $cell): bool
    {
        foreach ($worms as $worm) {
            foreach ($worm['body'] as $p) {
                if ($p['x'] === $cell['x'] && $p['y'] === $cell['y']) {
                    return true;
                }
            }
        }

        return false;
    }
}
