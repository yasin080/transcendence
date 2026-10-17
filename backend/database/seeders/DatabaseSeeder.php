<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario fijo para entrar: test@example.com / password
        $me = User::factory()->create([
            'username' => 'tester',
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Crea un usuario por cada username de la lista
        $make = fn (array $usernames) => collect($usernames)
            ->map(fn (string $username) => User::factory()->create(['username' => $username]));

        $friends = $make(['Boomer_92', 'ex0', 'Pixel_Rex', 'ash_fuse', 'Mochi', 'zeroKelvin', 'Tanuki']);
        $received = $make(['Bomba_Loca', 'Kiro_TNT']);
        $sent = $make(['BoltX', 'Wasabi']);
        $make(['BombJovi', 'boomerang', 'Nebula']); // sin relación: solo salen en el buscador

        User::factory(20)->create(); // relleno aleatorio

        foreach ($friends as $friend) {
            Friendship::create(['requester_id' => $me->id, 'addressee_id' => $friend->id, 'status' => 'accepted']);
        }
        foreach ($received as $player) {
            Friendship::create(['requester_id' => $player->id, 'addressee_id' => $me->id]);
        }
        foreach ($sent as $player) {
            Friendship::create(['requester_id' => $me->id, 'addressee_id' => $player->id]);
        }
    }
}