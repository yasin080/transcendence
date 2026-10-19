<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Chrome logs every 4xx response in the console, even an expected "wrong
 * password" or "room not found". So the API never answers 4xx: a client error
 * goes out as 200 with `ok: false` and the real status in the body. Server
 * errors (5xx) keep their status: those are bugs and should be seen.
 */
class SoftFailures
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $status = $response->getStatusCode();
        if (! $request->is('api/*') || $status < 400 || $status >= 500) {
            return $response;
        }

        $body = json_decode((string) $response->getContent(), true);
        $response->setContent(json_encode(['ok' => false, 'status' => $status] + (is_array($body) ? $body : [])));
        $response->headers->set('Content-Type', 'application/json');

        return $response->setStatusCode(200);
    }
}
