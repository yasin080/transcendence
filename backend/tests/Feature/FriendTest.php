<?php

namespace Tests\Feature;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// PHPUnit sends requests one after another on SQLite, so real concurrency
// can't be reproduced here. These tests cover what store() does once the
// first request is already saved, which is what the pair lock guarantees.
class FriendTest extends TestCase
{
    use RefreshDatabase;

    // Friendship rows between two users, in either direction
    private function rowsBetween(User $a, User $b): int
    {
        return Friendship::whereIn('requester_id', [$a->id, $b->id])
            ->whereIn('addressee_id', [$a->id, $b->id])
            ->count();
    }

    public function test_a_user_can_send_a_friend_request(): void
    {
        [$alice, $bob] = User::factory()->count(2)->create();

        $this->actingAs($alice)->postJson("/api/friends/{$bob->id}")
            ->assertOk()
            ->assertJsonPath('friend_state', 'sent');

        $this->assertDatabaseHas('friendships', [
            'requester_id' => $alice->id,
            'addressee_id' => $bob->id,
            'status' => 'pending',
        ]);
    }

    public function test_repeating_a_request_does_not_duplicate_it(): void
    {
        [$alice, $bob] = User::factory()->count(2)->create();
        $this->actingAs($alice);

        $this->postJson("/api/friends/{$bob->id}")->assertOk();
        $this->postJson("/api/friends/{$bob->id}")
            ->assertOk()
            ->assertJsonPath('friend_state', 'sent');

        $this->assertSame(1, $this->rowsBetween($alice, $bob));
    }

    public function test_a_crossed_request_accepts_the_existing_one(): void
    {
        [$alice, $bob] = User::factory()->count(2)->create();

        $this->actingAs($alice)->postJson("/api/friends/{$bob->id}")->assertOk();
        $this->actingAs($bob)->postJson("/api/friends/{$alice->id}")
            ->assertOk()
            ->assertJsonPath('friend_state', 'friends');

        $this->assertSame(1, $this->rowsBetween($alice, $bob));
        $this->assertDatabaseHas('friendships', [
            'requester_id' => $alice->id,
            'addressee_id' => $bob->id,
            'status' => 'accepted',
        ]);
    }

    public function test_a_user_cannot_add_themselves(): void
    {
        $alice = User::factory()->create();

        $this->actingAs($alice)->postJson("/api/friends/{$alice->id}")->assertFails(422);

        $this->assertDatabaseCount('friendships', 0);
    }

    public function test_a_user_can_accept_a_request(): void
    {
        [$alice, $bob] = User::factory()->count(2)->create();

        $this->actingAs($alice)->postJson("/api/friends/{$bob->id}")->assertOk();
        $this->actingAs($bob)->postJson("/api/friends/{$alice->id}/accept")
            ->assertOk()
            ->assertJsonPath('friend_state', 'friends');

        $this->assertDatabaseHas('friendships', [
            'requester_id' => $alice->id,
            'addressee_id' => $bob->id,
            'status' => 'accepted',
        ]);
    }

    public function test_removing_a_friendship_deletes_it(): void
    {
        [$alice, $bob] = User::factory()->count(2)->create();
        Friendship::create(['requester_id' => $alice->id, 'addressee_id' => $bob->id, 'status' => 'accepted']);

        $this->actingAs($bob)->deleteJson("/api/friends/{$alice->id}")
            ->assertOk()
            ->assertJsonPath('friend_state', 'none');

        $this->assertSame(0, $this->rowsBetween($alice, $bob));
    }
}