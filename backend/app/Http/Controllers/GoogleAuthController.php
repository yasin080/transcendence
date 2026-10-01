<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RotatesSession;
use App\Models\OauthAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    use RotatesSession;

    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')
            ->with(['access_type' => 'offline'])
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception) {
            return redirect('/?error=oauth');
        }

        $account = OauthAccount::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        if ($account) {
            $user = $account->user;

            $account->update([
                'access_token' => $googleUser->token,
                'refresh_token' => $googleUser->refreshToken ?? $account->refresh_token,
            ]);
        } else {
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getEmail(),
                    'email' => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                ]);
            }

            $user->oauthAccounts()->create([
                'provider' => 'google',
                'provider_id' => $googleUser->getId(),
                'access_token' => $googleUser->token,
                'refresh_token' => $googleUser->refreshToken,
            ]);
        }

        Auth::login($user);
        $this->rotateSession($request);

        return redirect('/dashboard');
    }
}
