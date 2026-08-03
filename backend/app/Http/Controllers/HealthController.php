<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

/**
 * Liveness probe for the whole stack.
 *
 * Deliberately touches the real dependencies instead of just returning 200:
 * a health endpoint that cannot fail tells you nothing.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $database = $this->probe(fn () => DB::connection()->getPdo());
        $redis = $this->probe(fn () => Redis::connection()->ping());

        $healthy = $database === 'ok' && $redis === 'ok';

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'database' => $database,
            'redis' => $redis,
            'laravel' => app()->version(),
        ], $healthy ? 200 : 503);
    }

    private function probe(callable $check): string
    {
        try {
            $check();

            return 'ok';
        } catch (Throwable $e) {
            report($e);

            return 'error';
        }
    }
}
