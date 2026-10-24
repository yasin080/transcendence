<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Database\Seeder;

// Cuentas con las que se puede entrar: las de .env y tester (solo en local)
class AccountsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (config('seeding.accounts') as $account) {
            if (! $account['username'] || ! $account['email'] || ! $account['password']) {
                continue; // faltan datos en .env: no se crea
            }
            User::firstOrCreate(
                ['email' => $account['email']],
                ['username' => $account['username'], 'name' => '', 'password' => $account['password']],
            );
        }

        if (app()->environment('local')) {
            $this->seedTester();
        }
    }

    // test@example.com / password, con amigos y solicitudes para probar el panel
    private function seedTester(): void
    {
        $tester = User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['username' => 'tester', 'name' => 'Test User', 'password' => 'password'],
        );

        $player = fn (string $username) => User::where('username', $username)->firstOrFail();
        $link = fn (User $from, User $to, string $status) => Friendship::firstOrCreate(
            ['requester_id' => $from->id, 'addressee_id' => $to->id],
            ['status' => $status],
        );

        foreach (['Boomer_92', 'ex0', 'Mochi', 'Detonator'] as $username) {
            $link($tester, $player($username), 'accepted');
        }
        foreach (['Kiro_TNT', 'Tanuki'] as $username) {
            $link($player($username), $tester, 'pending'); // solicitudes recibidas
        }
        foreach (['BoltX', 'Wasabi'] as $username) {
            $link($tester, $player($username), 'pending'); // solicitudes enviadas
        }
    }
}