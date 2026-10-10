<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function store(Request $request, Room $room): JsonResponse
    {
        abort_unless($room->host_id === $request->user()->id, 403, 'Only the host can start the match.');

        $game = DB::transaction(function () use ($room) {
            $room = Room::lockForUpdate()->find($room->id);
            abort_unless($room->status === 'open', 409, 'This match has already started.');

            $room->update(['status' => 'playing']);

            return $room->games()->create();
        });

        return response()->json($game, 201);
    }
}
