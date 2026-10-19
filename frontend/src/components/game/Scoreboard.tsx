import type { ScoreRow } from '../../game/logic/game'
import Button from '../ui/Button'

const rows: ScoreRow[] = [
  { name: 'ex_player1', colour: '#8fff57', score: 12, length: 15, alive: true, away: false, isYou: false },
  { name: 'ex_player2', colour: '#33d1ff', score: 9, length: 12, alive: true, away: false, isYou: true },
  { name: 'ex_player3', colour: '#ff6b52', score: 4, length: 7, alive: true, away: true, isYou: false },
  { name: 'ex_player4_long_name', colour: '#eb99ff', score: 6, length: 9, alive: false, away: false, isYou: false },
]
const alive = 3
const total = 4

export default function Scoreboard() {
  return (
    <header className="flex h-11 flex-none items-center gap-4 border-b border-line bg-surface px-4 text-sm">
      <ul className="flex min-w-0 flex-1 items-center gap-1">
        {rows.map((row) => (
          <li
            key={row.name}
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

      <div className="flex flex-none items-center gap-4">
        <span className="text-fg-secondary">
          {alive} / {total} alive
        </span>
        <span className="font-semibold text-white tabular-nums">01:42</span>
        <span className="h-5 w-px bg-line" />
        <Button variant="ghost" size="sm">
          Leave
        </Button>
      </div>
    </header>
  )
}
