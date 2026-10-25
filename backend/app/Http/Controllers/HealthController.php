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
            'last_backup' => $this->lastBackup(),
        ], $healthy ? 200 : 503);
    }

    /** When the newest dump in ./backups was written, or null if there is none. */
    private function lastBackup(): ?string
    {
        $times = array_map('filemtime', glob('/var/www/backups/*.sql.gz'));

        return $times ? date(DATE_ATOM, max($times)) : null;
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
