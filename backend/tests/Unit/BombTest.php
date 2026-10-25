<?php

namespace Tests\Unit;

use App\Game\Board;
use App\Game\Bot;
use App\Game\Game;
use PHPUnit\Framework\TestCase;

class BombTest extends TestCase
{
    private const SNAKE = [
        'width' => 30,
        'height' => 30,
        'pillars' => false,
        'softWalls' => 0,
        'wrap' => false,
        'tickMs' => 150,
        'players' => 1,
        'startLength' => 3,
        'food' => 1,
        'bombs' => 1,
        'wallHit' => 'die',
        'bodyHit' => 'die',
        'controls' => 'turn',
        'camera' => 'board',
        'botMistakes' => 50,
    ];

    /** Worm 0 heads right along row 5, head at x = $head. */
    private function game(int $length = 3, int $head = 10): array
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 25, 'y' => 25]];
        $game['pickups'] = [['x' => 25, 'y' => 20]];
        $game['worms'][0]['body'] = array_map(fn ($k) => ['x' => $head - $k, 'y' => 5], range(0, $length - 1));

        return $game;
    }

    public function test_a_new_game_lays_out_the_bombs_to_eat(): void
    {
        $game = Game::create(self::SNAKE);

        $this->assertCount(1, $game['pickups']);
        $this->assertSame([], $game['bombs']);
    }

    public function test_a_bomb_eaten_by_the_mouth_drops_at_once_where_the_tail_was(): void
    {
        $game = $this->game();
        $game['pickups'] = [['x' => 11, 'y' => 5]];

        Game::tick($game);

        $this->assertSame([['x' => 8, 'y' => 5, 'fuse' => Game::FUSE - 1]], $game['bombs']);
        $this->assertCount(1, $game['pickups']);
        $this->assertNotSame(['x' => 11, 'y' => 5], $game['pickups'][0]);
    }

    public function test_a_bomb_goes_off_when_its_fuse_runs_out(): void
    {
        $game = $this->game();
        $game['bombs'] = [['x' => 20, 'y' => 20, 'fuse' => 1]];

        Game::tick($game);

        $this->assertSame([], $game['bombs']);
        $this->assertSame([['x' => 20, 'y' => 20]], $game['blasts']);
    }

    public function test_a_blast_covers_the_3x3_square_around_the_bomb(): void
    {
        $cells = Game::blastCells($this->game()['board'], ['x' => 20, 'y' => 20]);

        $this->assertCount(9, $cells);
        $this->assertContains(['x' => 19, 'y' => 19], $cells);
        $this->assertContains(['x' => 21, 'y' => 21], $cells);
        $this->assertNotContains(['x' => 22, 'y' => 20], $cells);
    }

    public function test_a_blast_leaves_the_walls_out(): void
    {
        $cells = Game::blastCells($this->game()['board'], ['x' => 20, 'y' => 1]);

        $this->assertSame(Board::HARD, Board::cellAt($this->game()['board'], 20, 0));
        $this->assertCount(6, $cells);
        $this->assertNotContains(['x' => 20, 'y' => 0], $cells);
    }

    public function test_a_blast_on_the_head_kills(): void
    {
        $game = $this->game();
        $game['bombs'] = [['x' => 12, 'y' => 5, 'fuse' => 1]];

        Game::tick($game);

        $this->assertFalse($game['worms'][0]['alive']);
    }

    public function test_a_blast_on_the_body_cuts_the_tail_off(): void
    {
        $game = $this->game(length: 7);
        $game['bombs'] = [['x' => 7, 'y' => 6, 'fuse' => 1]];

        Game::tick($game);

        $this->assertTrue($game['worms'][0]['alive']);
        $this->assertSame([['x' => 11, 'y' => 5], ['x' => 10, 'y' => 5], ['x' => 9, 'y' => 5]], $game['worms'][0]['body']);
    }

    public function test_the_bot_goes_for_the_bombs(): void
    {
        $game = $this->game();
        $game['pickups'] = [['x' => 10, 'y' => 12]];

        $this->assertSame(['x' => 0, 'y' => 1], Bot::choose($game, 0));
    }

    public function test_the_bot_keeps_out_of_a_blast_about_to_go_off(): void
    {
        $game = $this->game();
        $game['bombs'] = [['x' => 12, 'y' => 5, 'fuse' => 2]];

        $this->assertNotSame(['x' => 1, 'y' => 0], Bot::choose($game, 0));
    }
}
