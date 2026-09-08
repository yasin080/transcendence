<?php

namespace App\Http\Controllers;

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
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        Auth::login($user);
        $this->rotateSession($request);

        return response()->json($user, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
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

    private function rotateSession(Request $request): void
    {
        $this->requireSession($request);
        $request->session()->regenerate();
    }

    private function requireSession(Request $request): void
    {
        abort_unless($request->hasSession(), 419, 'This API authenticates with the frontend session.');
    }
}
