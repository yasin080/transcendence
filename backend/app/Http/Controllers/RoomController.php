<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Database\UniqueConstraintViolationException;

class RoomController extends Controller
{
    public function index(): JsonResponse
    {
        $rooms = Room::whereIn('status', ['open', 'playing'])
            ->with('host:id,name')
            ->withCount('players')
            ->latest()
            ->get();

        return response()->json($rooms);
    }

    public function store(StoreRoomRequest $request): JsonResponse
    {
        $room = DB::transaction(function () use ($request) {
            $room = Room::create([
                'code' => $this->newCode(),
                'name' => $request->validated('name'),
                'host_id' => $request->user()->id,
                'settings' => $request->validated('settings'),
            ]);
            $room->players()->create(['user_id' => $request->user()->id, 'seat' => 0]);

            return $room;
        });

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
        return response()->json($this->withPlayers($room));
    }

    public function join(Request $request, Room $room): JsonResponse
    {
        $userId = $request->user()->id;

        try {
            $error = DB::transaction(function () use ($room, $userId) {
                $room = Room::whereKey($room->id)->lockForUpdate()->first();

                if ($room->players()->where('user_id', $userId)->exists()) {
                    return null;
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

        return response()->json($this->withPlayers($room));
    }

    // Si sale el host la sala se cierra para todos (deja de salir en el lobby);
    // si sale un invitado solo libera su asiento.
    public function leave(Request $request, Room $room): JsonResponse
    {
        $userId = $request->user()->id;

        if ($room->host_id === $userId) {
            if ($room->status === 'open') {
                $room->update(['status' => 'closed']);
            }
        } else {
            $room->players()->where('user_id', $userId)->delete();
        }

        return response()->json(null, 204);
    }

    private function withPlayers(Room $room): Room
    {
        return $room->load([
            'host:id,name',
            'players' => fn ($q) => $q->orderBy('seat'),
            'players.user:id,name',
        ]);
    }

}
