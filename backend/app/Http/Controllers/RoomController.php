<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
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

    private function newCode(): string
    {
        do {
            $code = Str::upper(Str::random(6));
        } while (Room::where('code', $code)->exists());

        return $code;
    }
}
