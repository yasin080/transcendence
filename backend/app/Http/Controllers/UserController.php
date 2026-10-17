<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // GET /api/users/{user} — perfil de un jugador, visto por el usuario autenticado
    public function show(Request $request, User $user): JsonResponse
    {
        $me = $request->user();
        $isOwn = $user->id == $me->id;

        // Sus amistades aceptadas, esté en la columna que esté
        $friendships = Friendship::with(['requester', 'addressee'])
            ->where('status', 'accepted')
            ->where(fn ($q) => $q->where('requester_id', $user->id)->orWhere('addressee_id', $user->id))
            ->get();

        $friends = $friendships
            ->map(fn (Friendship $f) => $f->requester_id == $user->id ? $f->addressee : $f->requester)
            ->sortBy('username', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->map(fn (User $friend) => $friend->summary());

        return response()->json([
            ...$user->summary(),
            'name' => $isOwn ? $user->name : null,
            'bio' => $user->bio,
            'created_at' => $user->created_at,
            'is_own' => $isOwn,
            'friend_state' => $isOwn ? 'none' : Friendship::stateFor(Friendship::between($me, $user), $me),
            'friend_count' => $friends->count(),
            'friends' => $friends,
        ]);
    }
}