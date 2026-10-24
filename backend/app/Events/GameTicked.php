<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class GameTicked implements ShouldBroadcastNow
{
    public function __construct(public int $gameId, public array $state) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel("game.{$this->gameId}");
    }

    public function broadcastAs(): string
    {
        return 'tick';
    }

    public function broadcastWith(): array
    {
        return [
            'worms' => $this->state['worms'],
            'food' => $this->state['food'],
            'pickups' => $this->state['pickups'],
            'bombs' => $this->state['bombs'],
            'blasts' => $this->state['blasts'],
        ];
    }
}
