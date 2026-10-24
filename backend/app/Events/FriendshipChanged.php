<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

// Avisa a un usuario de que una amistad suya ha cambiado
// (solicitud recibida, aceptada, rechazada o eliminada).
class FriendshipChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(public int $userId) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("App.Models.User.{$this->userId}")];
    }

    public function broadcastAs(): string
    {
        return 'friends.changed';
    }

    // Solo avisa: el front recarga el panel por HTTP
    public function broadcastWith(): array
    {
        return [];
    }
}