<?php

namespace Tests\Feature;

use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoomTest extends TestCase
{
    use RefreshDatabase;

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

    private function createRoom(User $host): Room
    {
        $this->actingAs($host);
        $code = $this->postJson('/api/rooms', ['name' => 'Snake night', 'settings' => self::SNAKE])->json('code');

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
}
