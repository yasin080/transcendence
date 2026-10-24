<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use App\Events\FriendshipChanged;
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
                $friends[] = $other->summary();
            } elseif ($iSent) {
                $sent[] = $other->summary();
            } else {
                $received[] = $other->summary();
            }
        }

        return response()->json(compact('friends', 'received', 'sent'));
    }

    // GET /api/users/search?q=bo — jugadores por username, con mi relación con cada uno
    public function search(Request $request): JsonResponse
    {
        $request->validate(['q' => ['nullable', 'string', 'max:20']]);
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
            ...$user->summary(),
            'friend_state' => $stateOf[$user->id] ?? 'none',
        ]));
    }

    // POST /api/friends/{user} — enviar solicitud
    public function store(Request $request, User $user): JsonResponse
    {
        $me = $request->user();

        if ($user->id == $me->id) {
            return response()->json(['message' => "You can't add yourself."], 422);
        }

        $friendship = Friendship::between($me, $user);

        if (! $friendship) {
            $friendship = Friendship::create(['requester_id' => $me->id, 'addressee_id' => $user->id]);
        } elseif ($friendship->status === 'pending' && $friendship->addressee_id == $me->id) {
            // Él ya me la había enviado: añadirle equivale a aceptar
            $friendship->update(['status' => 'accepted']);
        }
        FriendshipChanged::dispatch($user->id);

        return response()->json(['friend_state' => Friendship::stateFor($friendship, $me)]);
    }

    // POST /api/friends/{user}/accept — aceptar su solicitud
    public function accept(Request $request, User $user): JsonResponse
    {
        $friendship = Friendship::where('requester_id', $user->id)
            ->where('addressee_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);
        FriendshipChanged::dispatch($user->id);

        return response()->json(['friend_state' => 'friends']);
    }

    // DELETE /api/friends/{user} — rechazar, cancelar o eliminar
    public function destroy(Request $request, User $user): JsonResponse
    {
        Friendship::between($request->user(), $user)?->delete();
        FriendshipChanged::dispatch($user->id);

        return response()->json(['friend_state' => 'none']);
    }
}