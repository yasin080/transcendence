<?php

namespace App\Events;

use App\Models\Room;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class LobbyRoomUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public Room $room) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('lobby')];
    }

    public function broadcastAs(): string
    {
        return 'room.updated';
    }

    public function broadcastWith(): array
    {
        return ['room' => $this->room
            ->withoutRelations()
            ->load('host:id,username', 'latestGame')
            ->loadCount('players')];
    }

}
