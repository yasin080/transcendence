import type { ScoreRow } from '../../game/logic/game'
import Button from '../ui/Button'

type Props = { rows: ScoreRow[]; alive: number; total: number; elapsedMs: number }

function formatTime(ms: number) {
  const seconds = Math.floor(ms / 1000)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function Scoreboard({ rows, alive, total, elapsedMs }: Props) {
  return (
    <header className="flex flex-none flex-col border-b border-line bg-surface px-4 text-sm sm:flex-row sm:items-center sm:gap-4">
      <ul className="order-last grid grid-cols-2 gap-1 pb-2 sm:order-none sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:pb-0">
        {rows.map((row) => (
          <li
            key={row.colour}
            className={`flex min-w-0 items-center gap-2 rounded-full border px-3 py-1 ${
              row.isYou
                ? 'border-fuse-600/60 bg-fuse-600/15 font-semibold text-white'
                : row.away
                  ? 'border-transparent text-fg-faint'
                  : 'border-transparent text-fg-secondary'
            } ${row.alive ? '' : 'opacity-50'}`}
          >
            <span
              className="size-2.5 flex-none rounded-full"
              style={{ backgroundColor: row.away ? 'var(--color-offline)' : row.colour }}
            />
            <span className={`truncate ${row.alive ? '' : 'line-through'}`}>{row.name}</span>
            <span className="flex-none font-semibold text-gold tabular-nums">{row.score}</span>
          </li>
        ))}
      </ul>

      <div className="flex h-11 flex-none items-center justify-end gap-4">
        <span className="text-fg-secondary">
          {alive} / {total} alive
        </span>
        {formatTime(elapsedMs)}
        <span className="h-5 w-px bg-line" />
        <Button variant="ghost" size="sm">
          Leave
        </Button>
      </div>
    </header>
  )
}
