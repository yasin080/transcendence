<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RotatesSession;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use RotatesSession;

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        Auth::login($user);
        $this->rotateSession($request);

        return response()->json($user, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $this->rotateSession($request);

        return response()->json($request->user());
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        $this->requireSession($request);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
