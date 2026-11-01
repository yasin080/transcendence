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
            'username' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ]);

        $response->assertCreated()
            ->assertJsonPath('username', 'Gusano')
            ->assertJsonPath('name', null)
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
        ])->assertFails(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_registration_rejects_a_taken_username(): void
    {
        User::factory()->create(['username' => 'Gusano']);

        $this->postJson('/api/register', [
            'username' => 'Gusano',
            'email' => 'otro@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ])->assertFails(422)->assertJsonValidationErrors('username');

        $this->assertGuest();
    }

    public function test_registration_rejects_an_unconfirmed_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'otra-cosa',
        ])->assertFails(422)->assertJsonValidationErrors('password');

        $this->assertGuest();
    }

    public function test_registration_rejects_a_short_password(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'corta',
            'password_confirmation' => 'corta',
        ])->assertFails(422)->assertJsonValidationErrors('password');
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
        ])->assertFails(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_login_rejects_an_unknown_email(): void
    {
        $this->postJson('/api/login', [
            'email' => 'nadie@example.com',
            'password' => 'secret-worm',
        ])->assertFails(422)->assertJsonValidationErrors('email');

        $this->assertGuest();
    }

    public function test_a_google_user_without_a_password_cannot_log_in_with_one(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => null,
        ]);

        $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ])->assertFails(422)->assertJsonValidationErrors('email');

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
            ->assertFails(419);
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
        $this->postJson('/api/logout')->assertFails(401);
    }

    public function test_login_without_remember_does_not_set_a_persistent_cookie(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ])->assertOk();

        $remember = collect($response->headers->getCookies())
            ->first(fn ($cookie) => str_starts_with($cookie->getName(), 'remember_web_'));

        $this->assertNull($remember, 'No remember-me cookie should be issued without the "remember" flag.');
    }

    public function test_login_with_remember_sets_a_persistent_cookie(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'remember' => true,
        ])->assertOk();

        $remember = collect($response->headers->getCookies())
            ->first(fn ($cookie) => str_starts_with($cookie->getName(), 'remember_web_'));

        $this->assertNotNull($remember, 'A remember-me cookie should be issued when "remember" is true.');
        $this->assertGreaterThan(time() + 3600, $remember->getExpiresTime());
    }

    public function test_login_rotates_the_session_id(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        // Establish a guest session first, the way a browser would after
        // loading the SPA and fetching the CSRF cookie.
        $this->getJson('/api/user')->assertOk();
        $guestSessionId = $this->app['session']->getId();

        $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ])->assertOk();
        $authedSessionId = $this->app['session']->getId();

        // The whole point of rotateSession(): a session an attacker seeded
        // before login must not still be valid after login (fixation).
        $this->assertNotSame($guestSessionId, $authedSessionId);
    }

    public function test_registration_rotates_the_session_id(): void
    {
        $this->getJson('/api/user')->assertOk();
        $guestSessionId = $this->app['session']->getId();

        $this->postJson('/api/register', [
            'username' => 'Gusano',
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ])->assertCreated();
        $registeredSessionId = $this->app['session']->getId();

        $this->assertNotSame($guestSessionId, $registeredSessionId);
    }

    public function test_logout_invalidates_the_session_id(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/user')->assertOk();
        $beforeSessionId = $this->app['session']->getId();

        $this->actingAs($user)->postJson('/api/logout')->assertNoContent();
        $afterSessionId = $this->app['session']->getId();

        $this->assertNotSame($beforeSessionId, $afterSessionId);
    }

    public function test_repeated_login_attempts_are_rate_limited(): void
    {
        User::factory()->create([
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ]);

        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/login', [
                'email' => 'gusano@example.com',
                'password' => 'wrong-password',
            ])->assertFails(422);
        }

        // The 6 failed attempts already used the whole per-minute budget for
        // this email+IP pair (config/auth's `login` limiter), even with the
        // right password now.
        $this->postJson('/api/login', [
            'email' => 'gusano@example.com',
            'password' => 'secret-worm',
        ])->assertFails(429);
    }

    public function test_registration_is_rate_limited(): void
    {
        // /register uses its own `register` limiter (throttle:register in
        // routes/api.php), keyed on IP only — a fresh email per attempt still
        // lands in the same bucket, so 10 sign-ups exhaust the per-minute budget.
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/register', [
                'username' => "gusano{$i}",
                'email' => "gusano{$i}@example.com",
                'password' => 'secret-worm',
                'password_confirmation' => 'secret-worm',
            ])->assertCreated();
        }

        $this->postJson('/api/register', [
            'username' => 'gusano10',
            'email' => 'gusano10@example.com',
            'password' => 'secret-worm',
            'password_confirmation' => 'secret-worm',
        ])->assertFails(429);
    }
}
