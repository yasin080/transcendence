<?php

namespace App\Http\Controllers;

use App\Game\Game as GameLogic;
use App\Game\LiveGames;
use App\Models\Game;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use App\Events\LobbyRoomUpdated;
use App\Events\MatchStarted;

class GameController extends Controller
{
    private const START_DELAY = 3;

    public function show(Request $request, Game $game): JsonResponse
    {
        $seat = $this->seatOf($request, $game);

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

        $game = DB::transaction(function () use ($room) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');
            abort_if($room->players()->count() < $room->settings['players'], 409, 'The room is not full yet.');

            $room->update(['status' => 'playing']);

            return $room->games()->create();
        });

        LiveGames::start($game->id, $this->initialState($room));

        MatchStarted::dispatch($room, $game->id);
        LobbyRoomUpdated::dispatch($room->refresh());
        return response()->json($game, 201);
    }

    public function turn(Request $request, Game $game): Response
    {
        $seat = $this->seatOf($request, $game);
        $input = $request->validate([
            'side' => ['required_without:dir', 'in:left,right'],
            'dir' => ['required_without:side', 'array:x,y'],
            'dir.x' => ['required_with:dir', 'integer', 'between:-1,1'],
            'dir.y' => ['required_with:dir', 'integer', 'between:-1,1'],
        ]);
        abort_if($game->ended_at !== null, 409, 'This match has already ended.');

        LiveGames::push($game->id, $seat, $input);

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
        $state = GameLogic::create($room->settings);
        foreach ($room->players()->with('user')->get() as $player) {
            if (isset($state['worms'][$player->seat])) {
                $state['worms'][$player->seat]['name'] = $player->user->name ?? 'Bot';
            }
        }

        $state['startsAt'] = now()->addSeconds(self::START_DELAY)->getTimestampMs();

        return $state;
    }
}
