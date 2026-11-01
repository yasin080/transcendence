<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['requester_id', 'addressee_id', 'status'])]
class Friendship extends Model
{
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function addressee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'addressee_id');
    }

    // The friendship between two users, in either direction
    public static function between(User $a, User $b): ?self
    {
        return static::where(fn ($q) => $q->where('requester_id', $a->id)->where('addressee_id', $b->id))
            ->orWhere(fn ($q) => $q->where('requester_id', $b->id)->where('addressee_id', $a->id))
            ->first();
    }

    // Friend button state, as seen by $me
    public static function stateFor(?self $friendship, User $me): string
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
