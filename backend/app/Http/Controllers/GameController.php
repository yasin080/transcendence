<?php

namespace App\Http\Controllers;

use App\Events\LobbyRoomUpdated;
use App\Events\MatchStarted;
use App\Game\Game as GameLogic;
use App\Game\LiveGames;
use App\Game\Presence;
use App\Models\Game;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    private const DIRECTIONS = [['x' => 1, 'y' => 0], ['x' => -1, 'y' => 0], ['x' => 0, 'y' => 1], ['x' => 0, 'y' => -1]];

    private const START_DELAY = 3;

    public function show(Request $request, Game $game): JsonResponse
    {
        $seat = $game->room->players()->where('user_id', $request->user()->id)->value('seat');

        return response()->json([
            ...$game->load('room:id,code,name,settings')->toArray(),
            'seat' => $seat,
            'now' => now()->getTimestampMs(),
            'state' => LiveGames::load($game->id),
        ]);
    }

    public function store(Request $request, Room $room): JsonResponse
    {
        abort_unless($room->host_id === $request->user()->id, 403, 'Only the host can start the match.');

        [$game, $state] = DB::transaction(function () use ($room) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');

            foreach ($room->players()->orderBy('seat')->get() as $i => $player) {
                $player->update(['seat' => $i]);
            }

            $room->update(['status' => 'playing']);

            return [$room->games()->create(), $this->initialState($room)];
        });

        LiveGames::start($game->id, $state);

        MatchStarted::dispatch($room, $game->id);
        LobbyRoomUpdated::dispatch($room->refresh());

        return response()->json($game, 201);
    }

    public function turn(Request $request, Game $game): Response
    {
        $seat = $this->seatOf($request, $game);
        $input = $request->validate([
            'side' => ['required_without:dir', 'in:left,right'],
            // Solo las cuatro direcciones: ni diagonal ni quieto
            'dir' => ['required_without:side', 'array:x,y', fn ($attribute, $dir, $fail) => in_array($dir, self::DIRECTIONS) || $fail('The direction must be up, down, left or right.')],
        ]);
        abort_if($game->ended_at !== null, 409, 'This match has already ended.');

        // El bucle compara la dirección con ===, así que no puede llegar como cadena
        if (isset($input['dir'])) {
            $input['dir'] = array_map(intval(...), $input['dir']);
        }
        LiveGames::push($game->id, $seat, $input);

        return response()->noContent();
    }

    public function ping(Request $request, Game $game): Response
    {
        abort_if($game->ended_at !== null, 409, 'This match has already ended.');
        LiveGames::seen($game->id, $this->seatOf($request, $game), now()->getTimestampMs());

        return response()->noContent();
    }

    public function leave(Request $request, Game $game): Response
    {
        abort_if($game->ended_at !== null, 409, 'This match has already ended.');
        LiveGames::seen($game->id, $this->seatOf($request, $game), now()->getTimestampMs() - Presence::AWAY_MS);

        return response()->noContent();
    }

    private function seatOf(Request $request, Game $game): int
    {
        $player = $game->room->players()->where('user_id', $request->user()->id)->first();
        abort_if($player === null, 403, 'You are not playing in this match.');

        return $player->seat;
    }

    private function initialState(Room $room): array
    {
        $state = GameLogic::create(['players' => $room->players()->count()] + $room->settings);
        foreach ($room->players()->with('user')->get() as $player) {
            if (isset($state['worms'][$player->seat])) {
                $state['worms'][$player->seat]['name'] = $player->user->username ?? 'Bot';
                $state['worms'][$player->seat]['bot'] = $player->isBot();
            }
        }

        $state['startsAt'] = now()->addSeconds(self::START_DELAY)->getTimestampMs();

        return $state;
    }
}
