<?php

namespace Tests\Feature;

use App\Events\MatchStarted;
use App\Game\LiveGames;
use App\Game\Presence;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Redis::flushdb();
    }

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
    ];

    // El nombre tiene que ser único entre las salas activas
    private function createRoom(User $host, int $players = 1, string $name = 'Snake night'): Room
    {
        $this->actingAs($host);
        $settings = ['players' => $players] + self::SNAKE;
        $code = $this->postJson('/api/rooms', ['name' => $name, 'settings' => $settings])->json('code');

        return Room::where('code', $code)->firstOrFail();
    }

    public function test_a_player_can_create_a_room(): void
    {
        $host = User::factory()->create();
        $this->actingAs($host);

        $response = $this->postJson('/api/rooms', ['name' => 'Snake night', 'settings' => self::SNAKE]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Snake night')
            ->assertJsonPath('status', 'open')
            ->assertJsonPath('host_id', $host->id)
            ->assertJsonPath('settings.wallHit', 'die')
            ->assertJsonPath('players.0.user_id', $host->id)
            ->assertJsonPath('players.0.seat', 0);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{6}$/', $response->json('code'));
    }

    public function test_room_settings_are_validated(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/rooms', ['name' => '', 'settings' => ['players' => 9, 'wallHit' => 'explode'] + self::SNAKE])
            ->assertFails(422)
            ->assertJsonValidationErrors(['name', 'settings.players', 'settings.wallHit']);

        $this->postJson('/api/rooms', ['name' => 'Extra', 'settings' => self::SNAKE + ['cheat' => true]])
            ->assertFails(422)
            ->assertJsonValidationErrors(['settings']);
    }

    public function test_a_guest_cannot_create_a_room(): void
    {
        $this->postJson('/api/rooms', ['name' => 'Snake night', 'settings' => self::SNAKE])->assertFails(401);
    }

    public function test_the_host_can_start_the_match(): void
    {
        $room = $this->createRoom(User::factory()->create());

        $response = $this->postJson("/api/rooms/{$room->code}/games");

        $response->assertCreated()->assertJsonPath('room_id', $room->id);
        $this->assertSame('playing', $room->fresh()->status);
        $this->assertDatabaseCount('games', 1);
    }

    public function test_only_the_host_can_start_the_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $this->actingAs(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/games")->assertFails(403);
        $this->assertDatabaseCount('games', 0);
    }

    public function test_a_match_cannot_be_started_twice(): void
    {
        $room = $this->createRoom(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/games")->assertCreated();
        $this->postJson("/api/rooms/{$room->code}/games")->assertFails(409);
        $this->assertDatabaseCount('games', 1);
    }

    public function test_a_match_starts_with_whoever_is_seated(): void
    {
        $room = $this->createRoom(User::factory()->create(), players: 4);
        $this->postJson("/api/rooms/{$room->code}/bots");

        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->assertCreated()->json('id');

        $this->assertCount(2, LiveGames::load($gameId)['worms']);
    }

    public function test_starting_closes_the_gaps_left_in_the_seats(): void
    {
        $room = $this->createRoom(User::factory()->create(), players: 4);
        $guest = User::factory()->create();
        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/join");
        $this->actingAs($room->host)->postJson("/api/rooms/{$room->code}/bots");
        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/leave");

        $gameId = $this->actingAs($room->host)->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->assertSame([0, 1], $room->players()->orderBy('seat')->pluck('seat')->all());
        $this->assertTrue(LiveGames::load($gameId)['worms'][1]['bot']);
    }

    public function test_starting_a_match_notifies_the_room(): void
    {
        Event::fake([MatchStarted::class]);
        $room = $this->createRoom(User::factory()->create());

        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        Event::assertDispatched(MatchStarted::class, fn (MatchStarted $e) => $e->gameId === $gameId && $e->room->is($room));
    }

    public function test_a_player_can_load_their_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->getJson("/api/games/{$gameId}")
            ->assertOk()
            ->assertJsonPath('id', $gameId)
            ->assertJsonPath('room.code', $room->code)
            ->assertJsonPath('room.settings.tickMs', 150);
    }

    public function test_a_stranger_cannot_load_a_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');
        $this->actingAs(User::factory()->create());

        $this->getJson("/api/games/{$gameId}")->assertFails(403);
    }

    public function test_a_player_can_rejoin_their_room_even_if_it_is_full(): void
    {
        $room = $this->createRoom(User::factory()->create(), players: 2);
        $guest = User::factory()->create();
        $this->actingAs($guest);
        $this->postJson("/api/rooms/{$room->code}/join")->assertOk();

        $this->postJson("/api/rooms/{$room->code}/join")->assertOk();
        $this->assertSame(2, $room->players()->count());
    }

    public function test_a_player_cannot_join_a_second_room(): void
    {
        $first = $this->createRoom(User::factory()->create(), players: 2);
        $second = $this->createRoom(User::factory()->create(), players: 2, name: 'Second room');
        $guest = User::factory()->create();
        $this->actingAs($guest);
        $this->postJson("/api/rooms/{$first->code}/join")->assertOk();

        $this->postJson("/api/rooms/{$second->code}/join")
            ->assertFails(409)
            ->assertJsonPath('message', 'You are already in another room');
        $this->assertFalse($second->players()->where('user_id', $guest->id)->exists());
    }

    public function test_a_player_in_a_room_cannot_create_another(): void
    {
        $this->createRoom(User::factory()->create());

        $this->postJson('/api/rooms', ['name' => 'Second', 'settings' => self::SNAKE])
            ->assertFails(409)
            ->assertJsonPath('message', 'You are already in another room');
        $this->assertDatabaseCount('rooms', 1);
    }

    public function test_a_player_can_join_another_room_after_leaving(): void
    {
        $first = $this->createRoom(User::factory()->create(), players: 2);
        $second = $this->createRoom(User::factory()->create(), players: 2, name: 'Second room');
        $this->actingAs(User::factory()->create());
        $this->postJson("/api/rooms/{$first->code}/join")->assertOk();
        $this->postJson("/api/rooms/{$first->code}/leave")->assertNoContent();

        $this->postJson("/api/rooms/{$second->code}/join")->assertOk();
    }

    public function test_current_returns_the_players_room(): void
    {
        $host = User::factory()->create();
        $this->actingAs($host);
        $this->getJson('/api/rooms/current')->assertOk()->assertExactJson(['code' => null]);

        $room = $this->createRoom($host);
        $this->getJson('/api/rooms/current')->assertExactJson(['code' => $room->code]);

        // El host sale: la sala se cierra y deja de contar
        $this->postJson("/api/rooms/{$room->code}/leave")->assertNoContent();
        $this->getJson('/api/rooms/current')->assertExactJson(['code' => null]);
    }

    public function test_starting_a_match_puts_its_live_state_in_redis(): void
    {
        $host = User::factory()->create(['name' => 'Gusano']);
        $room = $this->createRoom($host);

        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->assertSame([$gameId], LiveGames::active());
        $state = LiveGames::load($gameId);
        $this->assertSame('Gusano', $state['worms'][0]['name']);
        $this->assertSame(30, $state['board']['width']);
    }

    public function test_a_player_can_send_a_turn(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'left'])->assertNoContent();
        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'right'])->assertNoContent();

        $this->assertSame([0 => ['side' => 'right']], LiveGames::takeInputs($gameId));
        $this->assertSame([], LiveGames::takeInputs($gameId));
    }

    public function test_a_turn_is_validated_and_needs_a_player(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'up'])->assertFails(422);
        $this->postJson("/api/games/{$gameId}/turn", ['dir' => ['x' => 5, 'y' => 0]])->assertFails(422);

        $this->actingAs(User::factory()->create());
        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'left'])->assertFails(403);
    }

    public function test_a_player_can_join_an_open_room(): void
    {
        $this->actingAs(User::factory()->create());
        $code = $this->postJson('/api/rooms', ['name' => 'Duel', 'settings' => ['players' => 2] + self::SNAKE])->json('code');
        $guest = User::factory()->create();
        $this->actingAs($guest);

        $this->postJson("/api/rooms/{$code}/join")->assertOk()->assertJsonPath('players.1.user_id', $guest->id)->assertJsonPath('players.1.seat', 1);
        $this->postJson("/api/rooms/{$code}/join")->assertOk();
        $this->assertDatabaseCount('room_players', 2);

        $this->actingAs(User::factory()->create());
        $this->postJson("/api/rooms/{$code}/join")->assertFails(409);
    }

    public function test_nobody_can_join_a_started_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $this->postJson("/api/rooms/{$room->code}/games")->assertCreated();
        $this->actingAs(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/join")->assertFails(409);
    }

    public function test_each_player_gets_their_own_worm(): void
    {
        $host = User::factory()->create(['name' => 'Host']);
        $this->actingAs($host);
        $code = $this->postJson('/api/rooms', ['name' => 'Duel', 'settings' => ['players' => 2] + self::SNAKE])->json('code');
        $guest = User::factory()->create(['name' => 'Guest']);
        $this->actingAs($guest)->postJson("/api/rooms/{$code}/join");
        $gameId = $this->actingAs($host)->postJson("/api/rooms/{$code}/games")->json('id');

        $this->actingAs($guest)->getJson("/api/games/{$gameId}")->assertJsonPath('seat', 1)->assertJsonPath('state.worms.1.name', 'Guest');
        $this->actingAs($guest)->postJson("/api/games/{$gameId}/turn", ['side' => 'left']);
        $this->assertSame([1 => ['side' => 'left']], LiveGames::takeInputs($gameId));
    }

    public function test_the_host_can_add_a_bot_to_a_free_seat(): void
    {
        $this->actingAs(User::factory()->create());
        $code = $this->postJson('/api/rooms', ['name' => 'Duel', 'settings' => ['players' => 2] + self::SNAKE])->json('code');

        $this->postJson("/api/rooms/{$code}/bots")->assertOk()->assertJsonPath('players.1.user_id', null)->assertJsonPath('players.1.seat', 1);
        $this->postJson("/api/rooms/{$code}/bots")->assertFails(409);
        $this->assertDatabaseCount('room_players', 2);
    }

    public function test_only_the_host_can_add_a_bot(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $this->actingAs(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/bots")->assertFails(403);
    }

    public function test_no_bot_can_be_added_to_a_started_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $this->postJson("/api/rooms/{$room->code}/games")->assertCreated();

        $this->postJson("/api/rooms/{$room->code}/bots")->assertFails(409);
    }

    public function test_bot_worms_are_marked_in_the_live_state(): void
    {
        $this->actingAs(User::factory()->create(['name' => 'Host']));
        $code = $this->postJson('/api/rooms', ['name' => 'Duel', 'settings' => ['players' => 2] + self::SNAKE])->json('code');
        $this->postJson("/api/rooms/{$code}/bots");
        $gameId = $this->postJson("/api/rooms/{$code}/games")->json('id');

        $this->getJson("/api/games/{$gameId}")
            ->assertJsonPath('state.worms.0.bot', false)
            ->assertJsonPath('state.worms.1.bot', true)
            ->assertJsonPath('state.worms.1.name', 'Bot');
    }

    public function test_a_player_reports_presence_and_leaving(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->postJson("/api/games/{$gameId}/ping")->assertNoContent();
        $this->assertEqualsWithDelta(now()->getTimestampMs(), LiveGames::lastSeen($gameId)[0], 1000);

        $this->postJson("/api/games/{$gameId}/leave")->assertNoContent();
        $this->assertEqualsWithDelta(now()->getTimestampMs() - Presence::AWAY_MS, LiveGames::lastSeen($gameId)[0], 1000);

        $this->actingAs(User::factory()->create());
        $this->postJson("/api/games/{$gameId}/ping")->assertFails(403);
    }

    public function test_show_returns_the_players_and_games(): void
    {
        $host = User::factory()->create(['name' => 'Host']);
        $room = $this->createRoom($host);
        $gameId = $this->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->getJson("/api/rooms/{$room->code}")
            ->assertOk()
            ->assertJsonPath('players.0.user.name', 'Host')
            ->assertJsonPath('games.0.id', $gameId);
    }

    public function test_the_host_can_kick_a_player(): void
    {
        $host = User::factory()->create();
        $room = $this->createRoom($host, players: 2);
        $guest = User::factory()->create();
        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/join")->assertOk();
        $player = $room->players()->where('user_id', $guest->id)->firstOrFail();

        $this->actingAs($host)->postJson("/api/rooms/{$room->code}/kick/{$player->id}")->assertNoContent();

        $this->assertFalse($room->players()->where('user_id', $guest->id)->exists());
        // El asiento queda libre para otro jugador
        $this->actingAs(User::factory()->create())->postJson("/api/rooms/{$room->code}/join")->assertOk();
    }

    public function test_only_the_host_can_kick(): void
    {
        $room = $this->createRoom(User::factory()->create(), players: 2);
        $guest = User::factory()->create();
        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/join")->assertOk();
        $hostSeat = $room->players()->where('user_id', $room->host_id)->firstOrFail();

        $this->postJson("/api/rooms/{$room->code}/kick/{$hostSeat->id}")->assertFails(403);
        $this->assertSame(2, $room->players()->count());
    }

    public function test_the_host_cannot_kick_themselves_or_players_of_another_room(): void
    {
        $host = User::factory()->create();
        $room = $this->createRoom($host, players: 2);
        $other = $this->createRoom(User::factory()->create(), players: 2, name: 'Other room');
        $hostSeat = $room->players()->where('user_id', $host->id)->firstOrFail();
        $otherSeat = $other->players()->firstOrFail();
        $this->actingAs($host);

        $this->postJson("/api/rooms/{$room->code}/kick/{$hostSeat->id}")->assertFails(422);
        $this->postJson("/api/rooms/{$room->code}/kick/{$otherSeat->id}")->assertFails(404);
        $this->assertDatabaseCount('room_players', 2);
    }

    public function test_leaving_mid_match_keeps_the_seat(): void
    {
        $room = $this->createRoom(User::factory()->create(), players: 2);
        $guest = User::factory()->create();
        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/join");
        $gameId = $this->actingAs($room->host)->postJson("/api/rooms/{$room->code}/games")->json('id');

        $this->actingAs($guest)->postJson("/api/rooms/{$room->code}/leave")->assertNoContent();

        $this->actingAs($guest)->getJson("/api/games/{$gameId}")->assertOk()->assertJsonPath('seat', 1);
    }
}
