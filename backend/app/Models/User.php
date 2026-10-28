<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['username', 'name', 'email', 'password', 'avatar', 'bio'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const AVATAR_PRESETS = ['/avatar/red-worm.png'];

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            $user->username ??= static::uniqueUsername($user->name ?? '');
        });
    }

    public static function uniqueUsername(string $from): string
    {
        $base = substr(preg_replace('/[^A-Za-z0-9_-]/', '', Str::ascii($from)), 0, 16);
        if (strlen($base) < 3) {
            $base = 'player';
        }

        $candidate = $base;
        $n = 1;
        while (static::where('username', $candidate)->exists()) {
            $candidate = $base . $n++;
        }

        return $candidate;
    }

    public function oauthAccounts(): HasMany
    {
        return $this->hasMany(OauthAccount::class);
    }

    public function sentFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    public function receivedFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }


    public function summary(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'avatar' => $this->avatar,
        ];
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function currentRoom(): ?Room
    {
        return Room::whereIn('status', ['open', 'playing'])
            ->whereHas('players', fn ($q) => $q->where('user_id', $this->id))
            ->first();
    }
}
