<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    // GET /api/friends — el panel del usuario autenticado
    public function index(Request $request): JsonResponse
    {
        $me = $request->user();

        $friendships = Friendship::with(['requester', 'addressee'])
            ->where('requester_id', $me->id)
            ->orWhere('addressee_id', $me->id)
            ->get();

        $friends = [];
        $received = [];
        $sent = [];

        foreach ($friendships as $friendship) {
            $iSent = $friendship->requester_id == $me->id;
            $other = $iSent ? $friendship->addressee : $friendship->requester;

            if ($friendship->status === 'accepted') {
                $friends[] = $this->summary($other);
            } elseif ($iSent) {
                $sent[] = $this->summary($other);
            } else {
                $received[] = $this->summary($other);
            }
        }

        return response()->json(compact('friends', 'received', 'sent'));
    }

    // GET /api/users/search?q=bo — jugadores por username, con mi relación con cada uno
    public function search(Request $request): JsonResponse
    {
        $me = $request->user();
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([]);
        }

        $users = User::where('id', '!=', $me->id)
            ->where('username', 'like', '%' . addcslashes($query, '%_\\') . '%')
            ->orderBy('username')
            ->limit(20)
            ->get();

        // Mis amistades con esos usuarios, en una sola consulta
        $ids = $users->pluck('id');
        $friendships = Friendship::where(fn ($q) => $q->where('requester_id', $me->id)->whereIn('addressee_id', $ids))
            ->orWhere(fn ($q) => $q->where('addressee_id', $me->id)->whereIn('requester_id', $ids))
            ->get();

        $stateOf = [];
        foreach ($friendships as $friendship) {
            $iSent = $friendship->requester_id == $me->id;
            $otherId = $iSent ? $friendship->addressee_id : $friendship->requester_id;
            $stateOf[$otherId] = $friendship->status === 'accepted' ? 'friends' : ($iSent ? 'sent' : 'received');
        }

        return response()->json($users->map(fn (User $user) => [
            ...$this->summary($user),
            'friend_state' => $stateOf[$user->id] ?? 'none',
        ]));
    }

    // Lo mínimo para pintar a un usuario en una lista
    private function summary(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'avatar_url' => $user->avatar_url,
        ];
    }
}