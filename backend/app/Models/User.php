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

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function oauthAccounts(): HasMany
    {
        return $this->hasMany(OauthAccount::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', #RETOMAR, 
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
