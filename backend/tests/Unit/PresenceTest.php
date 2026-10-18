<?php

namespace Tests\Unit;

use App\Game\Game;
use App\Game\Presence;
use PHPUnit\Framework\TestCase;

class PresenceTest extends TestCase
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
        'wallHit' => 'die',
        'bodyHit' => 'die',
        'controls' => 'turn',
        'camera' => 'board',
    ];

    private function game(): array
    {
        return Game::create(self::SNAKE) + ['startsAt' => 0];
    }

    public function test_a_player_heard_from_recently_is_not_away(): void
    {
        $game = $this->game();

        Presence::apply($game, [0 => 9_000, 1 => 9_000], 10_000);

        $this->assertFalse($game['worms'][0]['away']);
        $this->assertTrue($game['worms'][0]['alive']);
    }

    public function test_a_silent_player_goes_away_and_comes_back_when_heard_again(): void
    {
        $game = $this->game();

        Presence::apply($game, [0 => 10_000, 1 => 7_000], 10_000);
        $this->assertTrue($game['worms'][1]['away']);
        $this->assertTrue($game['worms'][1]['alive']);

        Presence::apply($game, [0 => 11_000, 1 => 11_000], 11_000);
        $this->assertFalse($game['worms'][1]['away']);
    }

    public function test_a_player_away_longer_than_the_grace_period_is_out(): void
    {
        $game = $this->game();

        Presence::apply($game, [0 => 20_000, 1 => 20_000 - Presence::AWAY_MS - Presence::GRACE_MS - 1], 20_000);

        $this->assertFalse($game['worms'][1]['alive']);
        $this->assertTrue(Game::isOver($game));
    }

    public function test_silence_counts_from_the_start_until_the_first_ping(): void
    {
        $game = $this->game();
        $game['startsAt'] = 10_000;

        Presence::apply($game, [], 12_000);
        $this->assertFalse($game['worms'][0]['away']);

        Presence::apply($game, [], 13_000);
        $this->assertTrue($game['worms'][0]['away']);
    }

    public function test_bots_never_go_away(): void
    {
        $game = $this->game();
        $game['worms'][1]['bot'] = true;

        Presence::apply($game, [0 => 60_000], 60_000);

        $this->assertArrayNotHasKey('away', $game['worms'][1]);
        $this->assertTrue($game['worms'][1]['alive']);
    }
}
