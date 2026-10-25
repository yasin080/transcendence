<?php

namespace Tests\Unit;

use App\Game\Board;
use App\Game\Game;
use PHPUnit\Framework\TestCase;

class GameTest extends TestCase
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
        'bombs' => 0,
        'wallHit' => 'die',
        'bodyHit' => 'die',
        'controls' => 'turn',
        'camera' => 'board',
        'botMistakes' => 50,
    ];

    public function test_a_new_game_has_a_walled_board_a_worm_and_food(): void
    {
        $game = Game::create(self::SNAKE);

        $this->assertCount(30 * 30, $game['board']['cells']);
        $this->assertSame(Board::HARD, Board::cellAt($game['board'], 0, 0));
        $this->assertSame(Board::EMPTY, Board::cellAt($game['board'], 5, 5));
        $this->assertCount(1, $game['worms']);
        $this->assertSame([['x' => 3, 'y' => 1], ['x' => 2, 'y' => 1], ['x' => 1, 'y' => 1]], $game['worms'][0]['body']);
        $this->assertCount(1, $game['food']);
    }

    public function test_the_worm_moves_forward_each_tick(): void
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];

        Game::tick($game);

        $this->assertSame(['x' => 4, 'y' => 1], $game['worms'][0]['body'][0]);
        $this->assertCount(3, $game['worms'][0]['body']);
    }

    public function test_eating_grows_the_worm_and_moves_the_food(): void
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 4, 'y' => 1]];

        Game::tick($game);

        $this->assertCount(4, $game['worms'][0]['body']);
        $this->assertNotSame(['x' => 4, 'y' => 1], $game['food'][0]);
    }

    public function test_steering_turns_relative_to_the_current_direction(): void
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];

        Game::steer($game, 0, 'left');
        Game::tick($game);
        $this->assertSame(['x' => 0, 'y' => 1], $game['worms'][0]['dir']);

        Game::steer($game, 0, 'right');
        Game::tick($game);
        $this->assertSame(['x' => 1, 'y' => 0], $game['worms'][0]['dir']);
    }

    public function test_two_quick_turns_in_one_tick_cannot_reverse_the_worm(): void
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];

        Game::turn($game, 0, ['x' => 0, 'y' => 1]);
        Game::turn($game, 0, ['x' => -1, 'y' => 0]);
        Game::tick($game);

        $this->assertTrue($game['worms'][0]['alive']);
        $this->assertSame(['x' => 1, 'y' => 0], $game['worms'][0]['dir']);
    }

    public function test_hitting_the_wall_kills_the_worm_and_ends_the_game(): void
    {
        $game = Game::create(self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];

        for ($i = 0; $i < 30 && ! Game::isOver($game); $i++) {
            Game::tick($game);
        }

        $this->assertFalse($game['worms'][0]['alive']);
        $this->assertTrue(Game::isOver($game));
        $this->assertSame(['x' => 28, 'y' => 1], $game['worms'][0]['body'][0]);
    }

    public function test_hitting_a_wall_only_blocks_when_the_setting_says_so(): void
    {
        $game = Game::create(['wallHit' => 'block'] + self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];

        for ($i = 0; $i < 40; $i++) {
            Game::tick($game);
        }

        $this->assertTrue($game['worms'][0]['alive']);
        $this->assertSame(['x' => 28, 'y' => 1], $game['worms'][0]['body'][0]);
    }

    public function test_a_worm_blocked_for_too_long_dies(): void
    {
        $game = Game::create(['wallHit' => 'block'] + self::SNAKE);
        $game['food'] = [['x' => 20, 'y' => 20]];
        while ($game['worms'][0]['body'][0]['x'] < 28) {
            Game::tick($game);
        }

        for ($i = 1; $i < Game::STUCK; $i++) {
            Game::tick($game);
        }
        $this->assertTrue($game['worms'][0]['alive']);

        Game::tick($game);
        $this->assertFalse($game['worms'][0]['alive']);
    }

    public function test_the_state_serialises_to_the_shape_the_browser_draws(): void
    {
        $json = json_decode(json_encode(Game::create(self::SNAKE)), true);

        $this->assertSame(['settings', 'board', 'worms', 'food', 'pickups', 'bombs', 'blasts'], array_keys($json));
        $this->assertSame(['width', 'height', 'cells'], array_keys($json['board']));
        $this->assertSame(['name', 'colour', 'body', 'dir', 'wanted', 'alive', 'stuck'], array_keys($json['worms'][0]));
    }

    public function test_four_worms_start_in_their_corners_without_touching(): void
    {
        $game = Game::create(['players' => 4, 'softWalls' => 0.5] + self::SNAKE);

        $cells = [];
        foreach ($game['worms'] as $worm) {
            foreach ($worm['body'] as $p) {
                $cells[] = $p['x'].','.$p['y'];
                $this->assertSame(Board::EMPTY, Board::cellAt($game['board'], $p['x'], $p['y']));
            }
        }
        $this->assertCount(12, array_unique($cells));
        $this->assertSame(['x' => 28, 'y' => 3], $game['worms'][1]['body'][0]);
        $this->assertSame(['x' => 26, 'y' => 28], $game['worms'][2]['body'][0]);
        $this->assertSame(['x' => 1, 'y' => 26], $game['worms'][3]['body'][0]);
    }

    public function test_a_full_board_simply_runs_out_of_food(): void
    {
        $game = Game::create(['width' => 10, 'height' => 10, 'players' => 4, 'startLength' => 6, 'food' => 50] + self::SNAKE);

        $this->assertCount(64 - 4 * 6, $game['food']);
    }

    public function test_two_heads_into_the_same_cell_both_die(): void
    {
        $game = Game::create(['players' => 2, 'wallHit' => 'block', 'bodyHit' => 'block'] + self::SNAKE);
        $game['food'] = [];
        $game['worms'][0]['body'] = [['x' => 10, 'y' => 10], ['x' => 9, 'y' => 10]];
        $game['worms'][0]['dir'] = $game['worms'][0]['wanted'] = ['x' => 1, 'y' => 0];
        $game['worms'][1]['body'] = [['x' => 12, 'y' => 10], ['x' => 13, 'y' => 10]];
        $game['worms'][1]['dir'] = $game['worms'][1]['wanted'] = ['x' => -1, 'y' => 0];

        Game::tick($game);

        $this->assertFalse($game['worms'][0]['alive']);
        $this->assertFalse($game['worms'][1]['alive']);
    }

    public function test_two_heads_swapping_places_both_die(): void
    {
        $game = Game::create(['players' => 2, 'wallHit' => 'block', 'bodyHit' => 'block'] + self::SNAKE);
        $game['food'] = [];
        $game['worms'][0]['body'] = [['x' => 10, 'y' => 10], ['x' => 9, 'y' => 10]];
        $game['worms'][0]['dir'] = $game['worms'][0]['wanted'] = ['x' => 1, 'y' => 0];
        $game['worms'][1]['body'] = [['x' => 11, 'y' => 10], ['x' => 12, 'y' => 10]];
        $game['worms'][1]['dir'] = $game['worms'][1]['wanted'] = ['x' => -1, 'y' => 0];

        Game::tick($game);

        $this->assertFalse($game['worms'][0]['alive']);
        $this->assertFalse($game['worms'][1]['alive']);
    }

    public function test_an_away_worm_stays_still(): void
    {
        $game = Game::create(self::SNAKE);
        $game['worms'][0]['away'] = true;
        $body = $game['worms'][0]['body'];

        Game::turn($game, 0, ['x' => 0, 'y' => 1]);
        Game::tick($game);

        $this->assertSame($body, $game['worms'][0]['body']);
        $this->assertTrue($game['worms'][0]['alive']);
    }

    public function test_reaching_an_away_head_is_a_body_hit_not_a_head_on(): void
    {
        $game = Game::create(['players' => 2] + self::SNAKE);
        $game['worms'][0]['body'] = [['x' => 5, 'y' => 5], ['x' => 4, 'y' => 5], ['x' => 3, 'y' => 5]];
        $game['worms'][0]['dir'] = $game['worms'][0]['wanted'] = ['x' => 1, 'y' => 0];
        $game['worms'][1]['body'] = [['x' => 6, 'y' => 5], ['x' => 7, 'y' => 5], ['x' => 8, 'y' => 5]];
        $game['worms'][1]['dir'] = $game['worms'][1]['wanted'] = ['x' => -1, 'y' => 0];
        $game['worms'][1]['away'] = true;

        Game::tick($game);

        $this->assertFalse($game['worms'][0]['alive']);
        $this->assertTrue($game['worms'][1]['alive']);
    }
}
