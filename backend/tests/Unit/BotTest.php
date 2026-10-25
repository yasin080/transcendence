<?php

namespace Tests\Unit;

use App\Game\Board;
use App\Game\Bot;
use App\Game\Game;
use PHPUnit\Framework\TestCase;

class BotTest extends TestCase
{
    private const SNAKE = [
        'width' => 30,
        'height' => 30,
        'pillars' => false,
        'softWalls' => 0,
        'wrap' => false,
        'tickMs' => 150,
        'players' => 2,
        'startLength' => 3,
        'food' => 1,
        'bombs' => 0,
        'wallHit' => 'die',
        'bodyHit' => 'die',
        'controls' => 'turn',
        'camera' => 'board',
        'botMistakes' => 50,
    ];

    private const RIGHT = ['x' => 1, 'y' => 0];

    private const DOWN = ['x' => 0, 'y' => 1];

    private const UP = ['x' => 0, 'y' => -1];

    /** Worm 0 starts at (3,1) heading right along the top wall. */
    private function game(array $food): array
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = $food;

        return $game;
    }

    public function test_it_keeps_going_when_the_way_ahead_is_clear_and_no_food_is_closer(): void
    {
        $game = $this->game([['x' => 20, 'y' => 1]]);

        $this->assertSame(self::RIGHT, Bot::choose($game, 0));
    }

    public function test_it_turns_towards_the_nearest_food(): void
    {
        $game = $this->game([['x' => 3, 'y' => 10]]);

        $this->assertSame(self::DOWN, Bot::choose($game, 0));
    }

    public function test_it_never_turns_back_into_its_own_body_even_for_food(): void
    {
        $game = $this->game([['x' => 1, 'y' => 1]]);

        $this->assertNotSame(['x' => -1, 'y' => 0], Bot::choose($game, 0));
    }

    public function test_it_avoids_a_wall_ahead(): void
    {
        $game = $this->game([['x' => 20, 'y' => 1]]);
        $game['board']['cells'][1 * 30 + 4] = Board::HARD;

        $this->assertSame(self::DOWN, Bot::choose($game, 0));
    }

    public function test_it_avoids_another_worm(): void
    {
        $game = $this->game([['x' => 20, 'y' => 1]]);
        $game['worms'][1]['body'] = [['x' => 4, 'y' => 1], ['x' => 5, 'y' => 1], ['x' => 6, 'y' => 1]];

        $this->assertSame(self::DOWN, Bot::choose($game, 0));
    }

    public function test_it_keeps_its_direction_when_every_way_is_blocked(): void
    {
        $game = $this->game([['x' => 20, 'y' => 20]]);
        $game['board']['cells'][1 * 30 + 4] = Board::HARD;
        $game['board']['cells'][2 * 30 + 3] = Board::HARD;

        $this->assertSame(self::RIGHT, Bot::choose($game, 0));
    }

    public function test_play_steers_only_the_bot_worms(): void
    {
        $game = $this->game([['x' => 3, 'y' => 10]]);
        $game['worms'][0]['bot'] = true;
        $game['worms'][1]['body'] = [['x' => 10, 'y' => 10], ['x' => 10, 'y' => 11], ['x' => 10, 'y' => 12]];
        $game['worms'][1]['dir'] = $game['worms'][1]['wanted'] = self::UP;

        $game['settings']['botMistakes'] = 0;
        Bot::play($game);
        Game::tick($game);

        $this->assertSame(['x' => 3, 'y' => 2], $game['worms'][0]['body'][0]);
        $this->assertSame(['x' => 10, 'y' => 9], $game['worms'][1]['body'][0]);
    }

    public function test_a_careless_bot_keeps_going_straight(): void
    {
        $game = $this->game([['x' => 3, 'y' => 10]]);
        $game['worms'][0]['bot'] = true;

        $game['settings']['botMistakes'] = 100;
        Bot::play($game);
        Game::tick($game);

        $this->assertSame(['x' => 4, 'y' => 1], $game['worms'][0]['body'][0]);
    }
}
