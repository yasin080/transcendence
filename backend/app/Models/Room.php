<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['code', 'name', 'host_id', 'status', 'quick', 'settings'])]
class Room extends Model
{
    protected $attributes = ['status' => 'open'];

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

    public function latestGame(): HasOne
    {
        return $this->hasOne(Game::class)->latestOfMany();
    }

    protected function casts(): array
    {
        return [
            'quick' => 'boolean',
            'settings' => 'array',
        ];
    }
}
