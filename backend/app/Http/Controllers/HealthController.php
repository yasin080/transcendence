<?php

namespace App\Http\Controllers;

use App\Game\LiveGames;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Redis;
use Throwable;

/**
 * Liveness probe for the whole stack.
 *
 * Deliberately touches the real dependencies instead of just saying "ok":
 * a health endpoint that cannot fail tells you nothing. The verdict travels
 * in the body (`status`), always with HTTP 200: Chrome paints any 5xx red in
 * the console, and a degraded stack is a report, not an error of this request.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $checks = array_map($this->run(...), [
            'database' => fn () => [true, $this->ms(fn () => DB::select('select 1'))],
            'redis' => fn () => [true, $this->ms(fn () => Redis::ping())],
            'gameloop' => $this->gameLoop(...),
            'queue' => $this->queue(...),
            'backup' => $this->lastBackup(...),
        ]);

        return response()->json([
            'status' => collect($checks)->every('ok') ? 'ok' : 'degraded',
            'checks' => $checks,
            'laravel' => app()->version(),
        ]);
    }

    private function run(callable $check): array
    {
        try {
            [$ok, $value] = $check();
        } catch (Throwable $e) {
            report($e);
            [$ok, $value] = [false, 'unreachable'];
        }

        return ['ok' => $ok, 'value' => $value];
    }

    private function ms(callable $probe): string
    {
        $start = hrtime(true);
        $probe();

        return round((hrtime(true) - $start) / 1e6, 1).' ms';
    }

    /** The loop writes a heartbeat on every pass; a few seconds without one means it is stuck. */
    private function gameLoop(): array
    {
        $running = time() - LiveGames::lastHeartbeat() < 5;

        return [$running, $running ? 'running' : 'stopped'];
    }

    /** Jobs piling up means the queue worker is not picking them up. */
    private function queue(): array
    {
        $pending = Queue::size();

        return [$pending < 10, "$pending pending"];
    }

    /** Dumps run every 6 hours, so one older than 7 means a run was missed. */
    private function lastBackup(): array
    {
        $times = array_map('filemtime', glob('/var/www/backups/*.sql.gz'));
        if (! $times) {
            return [false, 'none'];
        }

        return [time() - max($times) < 7 * 3600, Carbon::createFromTimestamp(max($times))->diffForHumans()];
    }
}
