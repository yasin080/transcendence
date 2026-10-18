<?php

namespace App\Events;

use App\Models\Room;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

// Avisa a la sala de espera de que la partida ha empezado
class MatchStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Room $room, public int $gameId) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("room.{$this->room->code}")];
    }

    public function broadcastAs(): string
    {
        return 'match.started';
    }

    public function broadcastWith(): array
    {
        return ['gameId' => $this->gameId];
    }
}
