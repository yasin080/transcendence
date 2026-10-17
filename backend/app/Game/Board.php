<?php

namespace App\Game;

class Board
{
    public const EMPTY = 0;

    public const HARD = 1;

    public const SOFT = 2;

    public static function generate(array $settings): array
    {
        ['width' => $width, 'height' => $height] = $settings;
        $cells = [];
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rim = ! $settings['wrap'] && ($x === 0 || $y === 0 || $x === $width - 1 || $y === $height - 1);
                $pillar = $settings['pillars'] && $x % 2 === 0 && $y % 2 === 0;
                if ($rim || $pillar) {
                    $cells[] = self::HARD;
                } else {
                    $cells[] = mt_rand() / mt_getrandmax() < $settings['softWalls'] ? self::SOFT : self::EMPTY;
                }
            }
        }

        return ['width' => $width, 'height' => $height, 'cells' => $cells];
    }

    public static function cellAt(array $board, int $x, int $y): int
    {
        return $board['cells'][$y * $board['width'] + $x];
    }
}
