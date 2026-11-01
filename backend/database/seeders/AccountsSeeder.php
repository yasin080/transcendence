<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Database\Seeder;

// Demo accounts with credentials from .env (also in production)
class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        [$showcase, $clean] = config('seeding.accounts');

        // USER1: full panel, with friends and pending requests
        if ($user = $this->createAccount($showcase)) {
            foreach (['Boomer_92', 'ex0', 'Mochi', 'Detonator'] as $username) {
                $this->befriend($user, $this->player($username), 'accepted');
            }
            foreach (['Kiro_TNT', 'Tanuki'] as $username) {
                $this->befriend($this->player($username), $user, 'pending'); // received
            }
            $this->befriend($user, $this->player('BoltX'), 'pending'); // sent
        }

        // USER2: a few friends and no link to USER1, to test requests between the two
        if ($user = $this->createAccount($clean)) {
            foreach (['Mochi', 'zeroKelvin'] as $username) {
                $this->befriend($user, $this->player($username), 'accepted');
            }
        }
    }

    // Returns the account only if it was just created; an existing one is left untouched
    private function createAccount(array $account): ?User
    {
        if (! $account['username'] || ! $account['email'] || ! $account['password']) {
            return null; // missing data in .env: not created
        }
        if (User::where('email', $account['email'])->exists()) {
            return null;
        }
        if (User::where('username', $account['username'])->exists()) {
            $this->command?->warn("Username {$account['username']} already taken: account skipped");

            return null;
        }

        return User::create([
            'username' => $account['username'],
            'name' => '',
            'email' => $account['email'],
            'password' => $account['password'],
        ]);
    }

    private function player(string $username): User
    {
        return User::where('username', $username)->firstOrFail();
    }

    private function befriend(User $from, User $to, string $status): void
    {
        Friendship::create(['requester_id' => $from->id, 'addressee_id' => $to->id, 'status' => $status]);
    }
}