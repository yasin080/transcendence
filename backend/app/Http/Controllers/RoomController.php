<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RoomController extends Controller
{
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

    public function show(Room $room): JsonResponse
    {
        return response()->json($room->load(['players' => fn ($players) => $players->orderBy('seat'), 'players.user:id,name', 'games:id,room_id']));
    }

    public function join(Request $request, Room $room): JsonResponse
    {
        DB::transaction(function () use ($request, $room) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');

            $seats = $room->players()->pluck('seat', 'user_id');
            if ($seats->has($request->user()->id)) {
                return;
            }
            $free = collect(range(0, $room->settings['players'] - 1))->diff($seats)->first();
            abort_if($free === null, 409, 'This room is full.');

            $room->players()->create(['user_id' => $request->user()->id, 'seat' => $free]);
        });

        return $this->show($room);
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

        return $this->show($room);
    }

    private function newCode(): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (Room::where('code', $code)->exists());

        return $code;
    }
}
