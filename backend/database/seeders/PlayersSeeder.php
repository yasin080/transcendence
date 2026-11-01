<?php

namespace Database\Seeders;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

// Player population for production: safe to run several times
class PlayersSeeder extends Seeder
{
    // username => bio
    private const PLAYERS = [
        'Boomer_92' => 'Old school. Drops bombs first, asks questions never.',
        'ex0' => 'Quiet, fast and always one tile ahead.',
        'Pixel_Rex' => 'Teams main. If you see a long green tail, run.',
        'ash_fuse' => 'Short fuse, shorter temper.',
        'Mochi' => 'Soft name, hard plays.',
        'zeroKelvin' => 'Ice cold under pressure.',
        'Tanuki' => 'Here for the chaos.',
        'Bomba_Loca' => 'Bombs everywhere. Sorry not sorry.',
        'Kiro_TNT' => 'Spiral trap specialist.',
        'BoltX' => 'Speed is a strategy.',
        'Wasabi' => 'Spicy corners only.',
        'BombJovi' => "Livin' on a fuse.",
        'boomerang' => 'What goes around comes around. Usually my bombs.',
        'Nebula' => 'New here. Be gentle.',
        'nyx_exe' => 'Playing at night, every night.',
        'FuseBox' => 'Collects explosions like stamps.',
        'Sparky' => 'Just learning the ropes.',
        'Detonator' => 'Top of the food chain. Allegedly.',
    ];

    // Accepted friendships between them (Nebula and Sparky have no friends)
    private const FRIENDSHIPS = [
        ['Boomer_92', 'ex0'], ['Boomer_92', 'Pixel_Rex'], ['Boomer_92', 'ash_fuse'],
        ['Boomer_92', 'Mochi'], ['Boomer_92', 'Detonator'],
        ['ex0', 'Pixel_Rex'], ['ex0', 'zeroKelvin'], ['ex0', 'nyx_exe'],
        ['Pixel_Rex', 'Kiro_TNT'], ['Pixel_Rex', 'BoltX'],
        ['ash_fuse', 'Bomba_Loca'], ['ash_fuse', 'FuseBox'],
        ['Mochi', 'Tanuki'], ['Mochi', 'Wasabi'],
        ['zeroKelvin', 'nyx_exe'], ['zeroKelvin', 'Detonator'],
        ['Tanuki', 'Wasabi'], ['Tanuki', 'boomerang'],
        ['Bomba_Loca', 'Kiro_TNT'], ['Bomba_Loca', 'BombJovi'],
        ['BoltX', 'Wasabi'], ['BombJovi', 'boomerang'],
        ['FuseBox', 'Detonator'], ['Kiro_TNT', 'FuseBox'],
    ];

    public function run(): void
    {
        $users = [];
        foreach (self::PLAYERS as $username => $bio) {
            $users[$username] = User::firstOrCreate(
                ['username' => $username],
                [
                    'name' => '',
                    'email' => strtolower($username) . '@players.invalid',
                    'password' => Str::random(40),
                    'bio' => $bio,
                ],
            );
        }

        foreach (self::FRIENDSHIPS as [$a, $b]) {
            Friendship::firstOrCreate(
                ['requester_id' => $users[$a]->id, 'addressee_id' => $users[$b]->id],
                ['status' => 'accepted'],
            );
        }
    }
}