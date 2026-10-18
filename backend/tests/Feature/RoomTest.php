<?php

namespace Tests\Feature;

use App\Game\LiveGames;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'settings.players', 'settings.wallHit']);

        $this->postJson('/api/rooms', ['name' => 'Extra', 'settings' => self::SNAKE + ['cheat' => true]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['settings']);
    }

    public function test_a_guest_cannot_create_a_room(): void
    {
        $this->postJson('/api/rooms', ['name' => 'Snake night', 'settings' => self::SNAKE])->assertUnauthorized();
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

        $this->postJson("/api/rooms/{$room->code}/games")->assertForbidden();
        $this->assertDatabaseCount('games', 0);
    }

    public function test_a_match_cannot_be_started_twice(): void
    {
        $room = $this->createRoom(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/games")->assertCreated();
        $this->postJson("/api/rooms/{$room->code}/games")->assertConflict();
        $this->assertDatabaseCount('games', 1);
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

        $this->getJson("/api/games/{$gameId}")->assertForbidden();
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
            ->assertConflict()
            ->assertJsonPath('message', 'You are already in another room');
        $this->assertFalse($second->players()->where('user_id', $guest->id)->exists());
    }

    public function test_a_player_in_a_room_cannot_create_another(): void
    {
        $this->createRoom(User::factory()->create());

        $this->postJson('/api/rooms', ['name' => 'Second', 'settings' => self::SNAKE])
            ->assertConflict()
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

        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'up'])->assertUnprocessable();
        $this->postJson("/api/games/{$gameId}/turn", ['dir' => ['x' => 5, 'y' => 0]])->assertUnprocessable();

        $this->actingAs(User::factory()->create());
        $this->postJson("/api/games/{$gameId}/turn", ['side' => 'left'])->assertForbidden();
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
        $this->postJson("/api/rooms/{$code}/join")->assertConflict();
    }

    public function test_nobody_can_join_a_started_match(): void
    {
        $room = $this->createRoom(User::factory()->create());
        $this->postJson("/api/rooms/{$room->code}/games")->assertCreated();
        $this->actingAs(User::factory()->create());

        $this->postJson("/api/rooms/{$room->code}/join")->assertConflict();
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

        $this->postJson("/api/rooms/{$room->code}/kick/{$hostSeat->id}")->assertForbidden();
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

        $this->postJson("/api/rooms/{$room->code}/kick/{$hostSeat->id}")->assertUnprocessable();
        $this->postJson("/api/rooms/{$room->code}/kick/{$otherSeat->id}")->assertNotFound();
        $this->assertDatabaseCount('room_players', 2);
    }
}
