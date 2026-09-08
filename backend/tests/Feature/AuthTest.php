<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Sanctum only makes a request stateful when it comes from a configured
        // frontend domain, which it reads off Origin. The browser sends it; the
        // test client does not, so without this there is no session to assert on.
        $this->withHeader('Origin', 'http://localhost');
    }

    public function test_a_visitor_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ]);

        $response->assertCreated()
            ->assertJsonPath('name', 'Gusano')
            ->assertJsonPath('email', 'gusano@example.com')
            ->assertJsonMissingPath('password');

        $this->assertDatabaseHas('users', ['email' => 'gusano@example.com']);
        $this->assertAuthenticated();
    }

    public function test_registration_rejects_a_taken_email(): void
    {
        User::factory()->create(['email' => 'gusano@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Otro',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_registration_rejects_an_unconfirmed_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'otra-cosa',
        ])->assertStatus(422)->assertJsonValidationErrors('password');

        $this->assertGuest();
    }

    public function test_registration_rejects_a_short_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'corta',
            'password_confirmation' => 'corta',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }

    public function test_a_user_can_log_in(): void
    {
        $user = User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ])->assertOk()->assertJsonPath('id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_rejects_wrong_credentials(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'no-es-esta',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_login_rejects_an_unknown_email(): void
    {
        $this->postJson('/api/login', [
            'email' => 'nadie@example.com',
            'password' => 'secret-worm',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_a_caller_without_frontend_headers_gets_a_clean_error(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        // No Origin and no Referer means Sanctum never starts a session. The
        // credentials are valid, so this gets past validation and reaches the
        // point where the session would be rotated: it must not be a 500.
        $this->withoutHeader('Origin')
            ->postJson('/api/login', [
                'email' => 'gusano@example.com',
                'password' => 'secret-worm',
            ])
            ->assertStatus(419);
    }

    public function test_the_user_endpoint_returns_null_for_a_visitor(): void
    {
        $this->getJson('/api/user')->assertOk()->assertExactJson(['user' => null]);
    }

    public function test_the_user_endpoint_returns_the_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonMissingPath('user.password');
    }

    public function test_a_user_can_log_out(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson('/api/logout')->assertNoContent();

        // Named explicitly: `auth:sanctum` makes sanctum the default guard for
        // the rest of the test, and its request guard caches the user it
        // resolved. The session guard is the one logout actually clears.
        $this->assertGuest('web');
    }

    public function test_logout_needs_a_session(): void
    {
        $this->postJson('/api/logout')->assertUnauthorized();
    }
}
