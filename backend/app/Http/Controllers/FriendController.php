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

    // POST /api/friends/{user} — enviar solicitud
    public function store(Request $request, User $user): JsonResponse
    {
        $me = $request->user();

        if ($user->id == $me->id) {
            return response()->json(['message' => "You can't add yourself."], 422);
        }

        $friendship = $this->between($me, $user);

        if (! $friendship) {
            $friendship = Friendship::create(['requester_id' => $me->id, 'addressee_id' => $user->id]);
        } elseif ($friendship->status === 'pending' && $friendship->addressee_id == $me->id) {
            // Él ya me la había enviado: añadirle equivale a aceptar
            $friendship->update(['status' => 'accepted']);
        }

        return response()->json(['friend_state' => $this->stateOf($friendship, $me)]);
    }

    // POST /api/friends/{user}/accept — aceptar su solicitud
    public function accept(Request $request, User $user): JsonResponse
    {
        $friendship = Friendship::where('requester_id', $user->id)
            ->where('addressee_id', $request->user()->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return response()->json(['friend_state' => 'friends']);
    }

    // DELETE /api/friends/{user} — rechazar, cancelar o eliminar
    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->between($request->user(), $user)?->delete();

        return response()->json(['friend_state' => 'none']);
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

    // La amistad entre dos usuarios, sea cual sea la dirección
    private function between(User $me, User $other): ?Friendship
    {
        return Friendship::where(fn ($q) => $q->where('requester_id', $me->id)->where('addressee_id', $other->id))
            ->orWhere(fn ($q) => $q->where('requester_id', $other->id)->where('addressee_id', $me->id))
            ->first();
    }

    // Traduce una fila de amistad al estado del botón, visto desde el usuario activo
    private function stateOf(?Friendship $friendship, User $me): string
    {
        if (! $friendship) {
            return 'none';
        }
        if ($friendship->status === 'accepted') {
            return 'friends';
        }

        return $friendship->requester_id == $me->id ? 'sent' : 'received';
    }
}