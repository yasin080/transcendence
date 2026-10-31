<?php

namespace App\Console\Commands;

use App\Events\GameTicked;
use App\Events\LobbyRoomUpdated;
use App\Game\Bot;
use App\Game\Game as GameLogic;
use App\Game\LiveGames;
use App\Game\Presence;
use App\Models\Game;
use Illuminate\Console\Command;

class GameTick extends Command
{
    protected $signature = 'game:tick';

    protected $description = 'Advance every live game, one tick at a time';

    private array $nextTick = [];

    public function handle(): void
    {
        while (true) {
            LiveGames::heartbeat();
            foreach (LiveGames::active() as $id) {
                $this->advance($id);
            }
            usleep(10_000);
        }
    }

    private function advance(int $id): void
    {
        $now = microtime(true) * 1000;
        if ($now < ($this->nextTick[$id] ?? 0)) {
            return;
        }

        $state = LiveGames::load($id);
        if ($state === null) {
            $this->end($id);

            return;
        }
        if ($now < $state['startsAt']) {
            $this->nextTick[$id] = $state['startsAt'];

            return;
        }
        $this->nextTick[$id] = ($this->nextTick[$id] ?? $now) + $state['settings']['tickMs'];

        Presence::apply($state, LiveGames::lastSeen($id), (int) $now);
        Bot::play($state);
        foreach (LiveGames::takeInputs($id) as $seat => $input) {
            if (! isset($state['worms'][$seat])) {
                continue;
            }
            isset($input['side'])
                ? GameLogic::steer($state, $seat, $input['side'])
                : GameLogic::turn($state, $seat, $input['dir']);
        }
        GameLogic::tick($state);
        LiveGames::save($id, $state);
        broadcast(new GameTicked($id, $state));

        if (GameLogic::isOver($state)) {
            $this->end($id);
        }
    }

    private function end(int $id): void
    {
        LiveGames::finish($id);
        unset($this->nextTick[$id]);
        $game = Game::find($id);
        $game?->update(['ended_at' => now()]);
        $game?->room()->where('status', 'playing')->update(['status' => 'open']);
        if ($game) {
            LobbyRoomUpdated::dispatch($game->room);
        }
    }
}
