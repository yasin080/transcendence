<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class UpdateProfileRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $user = $this->user();

        // Cambiar email o contraseña exige la contraseña actual,
        // salvo a quien entró con Google y nunca tuvo contraseña
        $changesCredentials = $this->filled('password') || $this->input('email') !== $user->email;

        return [
            'username' => ['required', 'string', 'regex:/^[A-Za-z0-9_-]{3,20}$/', Rule::unique('users', 'username')->ignore($user->id)],
            'name' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'bio' => ['nullable', 'string', 'max:160'],
            // Solo galería o por defecto (null); la imagen subida va por POST /api/user/avatar.
            // Si no viene, el avatar no se toca.
            'avatar' => ['sometimes', 'nullable', Rule::in(User::AVATAR_PRESETS)],
            'password' => ['nullable', 'string', 'confirmed', Password::defaults()],
            'current_password' => [Rule::requiredIf($changesCredentials && $user->password !== null), 'nullable', 'current_password'],
        ];
    }
}