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

    // Código de la sala en la que está el usuario, o null si no está en ninguna
    public function current(Request $request): JsonResponse
    {
        return response()->json(['code' => $request->user()->currentRoom()?->code]);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = DB::transaction(function () use ($request) {
            // Un usuario solo puede estar en una
            // sala a la vez, aunque lleguen varias peticiones a la vez.
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
        // DevMatch usa games para saber a qué partida ir
        return response()->json($this->withPlayers($room)->load('games:id,room_id'));
    }

    public function join(Request $request, Room $room): JsonResponse
    {
        $user = $request->user();
        $userId = $user->id;

        try {
            $error = DB::transaction(function () use ($room, $user, $userId) {
                // Bloquea al usuario: dos joins simultáneos a salas distintas
                // no pueden sentarle en ambas.
                User::whereKey($userId)->lockForUpdate()->first();
                $room = Room::whereKey($room->id)->lockForUpdate()->first();

                // Ya tiene asiento aquí: vuelve a entrar aunque la sala esté llena
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

    // Si sale el host la sala se cierra para todos;
    // si sale un invitado solo libera su asiento.
    public function leave(Request $request, Room $room): JsonResponse
    {
        $userId = $request->user()->id;

    
        $room = DB::transaction(function () use ($room, $userId) {
            $room = Room::whereKey($room->id)->lockForUpdate()->first();
            
            if ($room->status === 'playing') {
                // El host que se va a mitad de partida pasa el mando al siguiente jugador
                // y pierde su asiento; puede volver a entrar como jugador cuando acabe.
                $heir = $room->players()->whereNotNull('user_id')->where('user_id', '!=', $userId)->orderBy('seat')->first();
                if ($room->host_id !== $userId || ! $heir) {
                    // Mid-match you keep your seat, so you can still go back to the game.
                    return null;
                }
                
                $room->update(['host_id' => $heir->user_id]);
                $room->players()->where('user_id', $userId)->delete();
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
