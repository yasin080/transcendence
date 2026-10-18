<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Chrome logs every 4xx response in the console, even an expected "wrong
 * password". The expected outcomes of a form (validation, conflict, rate
 * limit) go out as 200 with `ok: false` and the real status in the body;
 * misuse of the API (401, 403, 404, 419) stays a 4xx.
 */
class SoftFailures
{
    private const SOFT = [409, 422, 429];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $status = $response->getStatusCode();
        if (! $request->is('api/*') || ! in_array($status, self::SOFT, true)) {
            return $response;
        }

        $body = json_decode((string) $response->getContent(), true);
        $response->setContent(json_encode(['ok' => false, 'status' => $status] + (is_array($body) ? $body : [])));
        $response->headers->set('Content-Type', 'application/json');

        return $response->setStatusCode(200);
    }
}
