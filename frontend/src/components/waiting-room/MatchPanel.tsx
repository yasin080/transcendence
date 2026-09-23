import type { MatchSetting } from './types.ts'
import arena from '../../assets/arena.png'

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
    <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-surface-2">
      <div
       aria-hidden="true"
       className="absolute inset-0 bg-cover bg-center opacity-70"
       style={{ backgroundImage: `url(${arena})` }}
      />
      <div
       aria-hidden="true"
       className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,14,44,.85)_0%,rgba(18,14,44,.45)_55%,rgba(18,14,44,.1)_100%)]"
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
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart}
              className="cursor-pointer rounded-[14px] bg-fuse-600 px-8.5 py-4.75 text-button-label text-white enabled:hover:bg-fuse-650 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:enabled:animate-boom-pulse"
            >
              Start match
            </button>
          )}
          <button
            type="button"
            onClick={onLeave}
            className="cursor-pointer rounded-[14px] border border-white/40 bg-white/30 px-7 py-4.75 text-button-label text-white hover:bg-white/50"
          >
            Leave room
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingChip({ label, value }: MatchSetting) {
  return (
    <div className="flex flex-col rounded-[10px] border border-white/10 bg-[#080718]/50 py-1.75 pr-3 pl-2.25 leading-[1.15]">
      <span className="text-micro-label font-bold text-white/40">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  )
}