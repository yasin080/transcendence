<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SoftFailuresTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_expected_failure_is_a_200_with_ok_false_and_its_status(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertOk()
            ->assertExactJsonStructure(['ok', 'status', 'message', 'errors' => ['email']])
            ->assertJsonPath('ok', false)
            ->assertJsonPath('status', 422);
    }

    public function test_misuse_of_the_api_keeps_its_4xx(): void
    {
        $this->postJson('/api/rooms', [])->assertUnauthorized();
    }
}
