import type { MatchSetting } from './types.ts'
import arena from '../../assets/arena.png'
import Button from '../ui/Button.tsx'

interface MatchPanelProps {
  isOwner: boolean
  playerCount: number
  maxPlayers: number
  settings: MatchSetting[]
  canStart: boolean
  onStart: () => void
  onLeave: () => void
}

export default function MatchPanel({
  isOwner,
  playerCount,
  maxPlayers,
  settings,
  canStart,
  onStart,
  onLeave,
}: MatchPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
      <div
       aria-hidden="true"
       className="absolute inset-0 bg-cover bg-center opacity-70"
       style={{ backgroundImage: `url(${arena})` }}
      />
      <div
       aria-hidden="true"
       className="absolute inset-0 bg-linear-to-r from-surface/85 via-surface/45 via-55% to-surface/10"
      />
      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-5 px-7 py-6.5">
        <div className="min-w-0 flex-1">
          <div className="text-eyebrow">Players in room</div>
          <div className="mt-1.5 flex items-baseline gap-2.5">
            <div className="flex-none display-stat-lg whitespace-nowrap">
              {playerCount} / {maxPlayers}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.map((s) => (
              <SettingChip key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        <div className="flex flex-none items-center gap-3">
          {isOwner && (
          <Button
            onClick={onStart}
            disabled={!canStart}
            className="motion-safe:enabled:animate-boom-pulse"
          >
            Start match
          </Button>
          )}
          <Button variant="secondary" onClick={onLeave}>
            Leave room
          </Button>
        </div>
      </div>
    </div>
  )
}

function SettingChip({ label, value }: MatchSetting) {
  return (
    <div className="flex flex-col rounded-xl border border-line bg-void/50 py-1.75 pr-3 pl-2.25 leading-[1.15]">
      <span className="text-micro-label text-fg-muted">{label}</span>
      <span className="text-meta">{value}</span>
    </div>
  )
}