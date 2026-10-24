<?php

namespace App\Events;

use App\Models\Room;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class RoomPlayersUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Room $room) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("room.{$this->room->code}")];
    }

    public function broadcastAs(): string
    {
        return 'players.updated';
    }

    public function broadcastWith(): array
    {
        return ['room' => $this->room->load([
            'host:id,username',
            'players' => fn ($q) => $q->orderBy('seat'),
            'players.user:id,username',
        ])];
    }
}
