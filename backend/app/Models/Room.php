<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'host_id', 'status', 'settings'])]
class Room extends Model
{
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function players(): HasMany
    {
        return $this->hasMany(RoomPlayer::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }
}
