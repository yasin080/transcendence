<?php

namespace App\Models;

use Database\Factories\UserFactory;
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
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Avatares de la galería (frontend/public/avatar/). null = el de por defecto.
    // Una imagen subida se guarda en la misma columna (AvatarController).
    public const AVATAR_PRESETS = ['/avatar/red-worm.png'];

    // Si al crear un usuario nadie da username, se genera uno a partir de name
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

    // Solicitudes que este usuario ha enviado
    public function sentFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'requester_id');
    }

    // Solicitudes que este usuario ha recibido
    public function receivedFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'addressee_id');
    }

    // Lo mínimo para pintar a un usuario en una lista
    public function summary(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'avatar' => $this->avatar,
        ];
    }

    /**
     * Get the attributes that should be cast.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the room the user is currently in.
     */
    public function currentRoom(): ?Room
    {
        return Room::whereIn('status', ['open', 'playing'])
            ->whereHas('players', fn ($q) => $q->where('user_id', $this->id))
            ->first();
    }
}
