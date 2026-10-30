<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    private function googleReturns(string $email, bool $verified): void
    {
        $googleUser = (new GoogleUser)
            ->setRaw(['email_verified' => $verified])
            ->map(['id' => 'google-123', 'name' => 'Worm', 'email' => $email]);
        $googleUser->setToken('token');

        Socialite::shouldReceive('driver->user')->andReturn($googleUser);
    }

    public function test_a_verified_google_email_logs_into_the_matching_account(): void
    {
        $user = User::factory()->create(['email' => 'worm@example.com']);
        $this->googleReturns('worm@example.com', verified: true);

        $this->get('/auth/google/callback')->assertRedirect('/lobby');

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('oauth_accounts', ['user_id' => $user->id, 'provider_id' => 'google-123']);
    }

    public function test_a_new_google_user_gets_an_account_with_a_generated_username(): void
    {
        $this->googleReturns('worm@example.com', verified: true);

        $this->get('/auth/google/callback')->assertRedirect('/lobby');

        $user = User::where('email', 'worm@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('Worm', $user->username);
        $this->assertNotNull($user->email_verified_at);
        $this->assertDatabaseHas('oauth_accounts', ['user_id' => $user->id, 'provider' => 'google', 'provider_id' => 'google-123']);
    }

    public function test_a_returning_google_user_logs_into_the_linked_account(): void
    {
        // Email distinto en Google: se le encuentra por el vínculo, no por email
        $user = User::factory()->create(['email' => 'old@example.com']);
        $user->oauthAccounts()->create(['provider' => 'google', 'provider_id' => 'google-123']);
        $this->googleReturns('new@example.com', verified: true);

        $this->get('/auth/google/callback')->assertRedirect('/lobby');

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('oauth_accounts', 1);
    }

    public function test_an_unverified_google_email_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'worm@example.com']);
        $this->googleReturns('worm@example.com', verified: false);

        $this->get('/auth/google/callback')->assertRedirect('/?error=oauth');

        $this->assertGuest();
        $this->assertDatabaseCount('oauth_accounts', 0);
    }
}
