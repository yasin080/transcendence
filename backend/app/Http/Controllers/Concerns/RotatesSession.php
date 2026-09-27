<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;

trait RotatesSession
{
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
