<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use App\Models\RoomPlayer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Database\UniqueConstraintViolationException;
use App\Events\RoomPlayersUpdated;
use App\Events\LobbyRoomUpdated;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = Room::whereIn('status', ['open', 'playing'])
            ->where('quick', false)
            ->with('host:id,username')
            ->with('latestGame')
            ->withCount('players')
            ->latest()
            ->get();

        return response()->json($rooms);
    }

    // Code of the room the user is in, or null if they are in none
    public function current(Request $request): JsonResponse
    {
        $room = $request->user()->currentRoom();

        return response()->json([
            'code' => $room?->code,
            'name' => $room?->name,
            'status' => $room?->status,
            'game_id' => $room?->status === 'playing' ? $room->latestGame?->id : null,
        ]);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = DB::transaction(function () use ($request) {
            // A user can only be in one room at a time,
            // even when several requests arrive at once.
            User::whereKey($request->user()->id)->lockForUpdate()->first();
            if ($request->user()->currentRoom()) {
                return null;
            }

            $room = Room::create([
                'code' => $this->newCode(),
                'name' => $request->validated('name'),
                'host_id' => $request->user()->id,
                'quick' => $request->boolean('quick'),
                'settings' => $request->validated('settings'),
            ]);
            $room->players()->create(['user_id' => $request->user()->id, 'seat' => 0]);

            return $room;
        });

        if (! $room) {
            return response()->json(['message' => 'You are already in another room'], 409);
        }

        LobbyRoomUpdated::dispatch($room);
        return response()->json($room->load('players'), 201);
    }



    private function newCode(): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (Room::where('code', $code)->exists());

        return $code;
    }

    public function show(Room $room): JsonResponse
    {
        // DevMatch uses games to know which match to go to
        return response()->json($this->withPlayers($room)->load('games:id,room_id'));
    }

    public function join(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        try {
            $error = DB::transaction(function () use ($room, $user, $userId) {
                // Locks the user: two simultaneous joins to different rooms
                // cannot seat them in both.
                User::whereKey($userId)->lockForUpdate()->first();
                $room = Room::whereKey($room->id)->lockForUpdate()->first();

                // Already seated here: they get back in even if the room is full
                if ($room->players()->where('user_id', $userId)->exists()) {
                    return null;
                }
                if ($user->currentRoom()) {
                    return 'You are already in another room';
                }
                if ($room->status !== 'open') {
                    return 'Room is not open';
                }

                $taken = $room->players()->pluck('seat')->all();
                $free = array_values(array_diff(range(0, $room->settings['players'] - 1), $taken));
                if ($free === []) {
                    return 'Room is full';
                }

                $room->players()->create(['user_id' => $userId, 'seat' => $free[0]]);

                return null;
            });
        } catch (UniqueConstraintViolationException) {
            $error = 'Room is full';
        }

        if ($error) {
            return response()->json(['message' => $error], 409);
        }

        RoomPlayersUpdated::dispatch($room);
        LobbyRoomUpdated::dispatch($room);
        return response()->json($this->withPlayers($room));
    }

    // If the host leaves, the room closes for everyone;
    // if a guest leaves, only their seat is freed.
    public function leave(Request $request, Room $room): JsonResponse
    {
        $userId = $request->user()->id;

    
        $room = DB::transaction(function () use ($room, $userId) {
            $room = Room::whereKey($room->id)->lockForUpdate()->first();
            
            if ($room->status === 'playing') {
                // Leaving mid-match is explicit (the lobby asks first), so the seat goes.
                // The worm stays on the board and Presence takes it out when the pings stop.
                $room->players()->where('user_id', $userId)->delete();
                if ($room->host_id === $userId) {
                    // The host hands the room to the next human; with none left, the room
                    // closes so it does not linger in the lobby with nobody able to start it.
                    $heir = $room->players()->whereNotNull('user_id')->orderBy('seat')->first();
                    $room->update($heir ? ['host_id' => $heir->user_id] : ['status' => 'closed']);
                }

                return $room;
            }

            if ($room->host_id === $userId) {
                if ($room->status === 'open') {
                    $room->update(['status' => 'closed']);
                }
            } else {
                $room->players()->where('user_id', $userId)->delete();
            }
            return $room;
        });
        if ($room) {
            RoomPlayersUpdated::dispatch($room);
            LobbyRoomUpdated::dispatch($room);
        }
        return response()->json(null, 204);
    }

    private function withPlayers(Room $room): Room
    {
        return $room->load([
            'host:id,username',
            'players' => fn ($q) => $q->orderBy('seat'),
            'players.user:id,username,avatar',
        ]);
    }

    public function kick(Request $request, Room $room, RoomPlayer $player): JsonResponse
    {
        abort_unless($room->host_id === $request->user()->id, 403);
        abort_unless($player->room_id === $room->id, 404);
        abort_if($player->user_id === $room->host_id, 422);

        $room = DB::transaction(function () use ($room, $player) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');

            $player->delete();

            return $room;
        });
    
        RoomPlayersUpdated::dispatch($room);
        LobbyRoomUpdated::dispatch($room);
        return response()->json(null, 204);
    }


    public function addBot(Request $request, Room $room): JsonResponse
    {
        abort_unless($room->host_id === $request->user()->id, 403, 'Only the host can add bots.');

        DB::transaction(function () use ($room) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');

            $free = collect(range(0, $room->settings['players'] - 1))->diff($room->players()->pluck('seat'))->first();
            abort_if($free === null, 409, 'This room is full.');

            $room->players()->create(['seat' => $free]);
        });

        RoomPlayersUpdated::dispatch($room);
        LobbyRoomUpdated::dispatch($room);
        return $this->show($room);
    }


}
