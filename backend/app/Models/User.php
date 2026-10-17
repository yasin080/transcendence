<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['username', 'name', 'email', 'password', 'avatar_url', 'bio'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
            'avatar_url' => $this->avatar_url,
        ];
    }

    /**
     * Get the attributes that should be cast.
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', #RETOMAR, 
            'password' => 'hashed',
        ];
    }
}
