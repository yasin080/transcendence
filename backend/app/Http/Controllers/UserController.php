<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateProfileRequest;

class UserController extends Controller
{
    // GET /api/users/{user} — a player's profile, as seen by the authenticated user
    public function show(Request $request, User $user): JsonResponse
    {
        $me = $request->user();
        $isOwn = $user->id == $me->id;

        // Their accepted friendships, whichever column they are in
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

    // PATCH /api/user — the authenticated user updates their own profile
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->safe()->except(['password', 'current_password']);
        if ($request->filled('password')) {
            $data['password'] = $request->input('password');
        }

        $user->update($data);

        return $this->show($request, $user);
    }
}