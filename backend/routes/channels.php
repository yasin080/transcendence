<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Room;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('game.{game}', fn ($user) => true);

Broadcast::channel('room.{code}', function ($user, $code) {
    return Room::where('code', $code)
        ->whereHas('players', fn ($q) => $q->where('user_id', $user->id))
        ->exists();
});

Broadcast::channel('lobby', fn ($user) => true);
Broadcast::channel('online', fn ($user) => ['id' => $user->id]);
