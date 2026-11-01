<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class UpdateProfileRequest extends FormRequest
{
    public function rules(): array
    {
        $user = $this->user();

        // Changing email or password requires the current password,
        // except for Google users who never had one
        $changesCredentials = $this->filled('password') || $this->input('email') !== $user->email;

        return [
            'username' => ['required', 'string', 'regex:/^[A-Za-z0-9_-]{3,20}$/', Rule::unique('users', 'username')->ignore($user->id)],
            'name' => ['nullable', 'string', 'max:50'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'bio' => ['nullable', 'string', 'max:160'],
            // Gallery or default (null) only; uploads go through POST /api/user/avatar.
            // If missing, the avatar is left unchanged.
            'avatar' => ['sometimes', 'nullable', Rule::in(User::AVATAR_PRESETS)],
            'password' => ['nullable', 'string', 'confirmed', Password::defaults()],
            'current_password' => [Rule::requiredIf($changesCredentials && $user->password !== null), 'nullable', 'current_password'],
        ];
    }
}