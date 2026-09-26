import { BotIcon, CrownIcon, XIcon } from './icons.tsx'
import type { Player } from './types.ts'

interface PlayerCardProps {
  player: Player
  onKick?: (playerId: string) => void
}

export default function PlayerCard({ player, onKick }: PlayerCardProps) {
  const roleLabel = player.isOwner
    ? 'Room owner'
    : player.isBot
      ? `Bot · ${player.difficulty}`
      : 'Player'
  const roleColor = player.isOwner
    ? 'text-gold'
    : player.isBot
      ? 'text-mint'
      : 'text-fg-muted'

  return (
    <div
      className={`relative flex flex-col gap-3.5 rounded-2x1 border p-4 ${
        player.isBot ? 'border-mint/25 bg-mint/5' : 'border-line bg-fill'
      }`}
    >
      {onKick && (
        <button
          type="button"
          onClick={() => onKick(player.id)}
          title={`Kick ${player.name}`}
          aria-label={`Kick ${player.name}`}
          className="absolute top-2.5 right-2.5 grid size-6 cursor-pointer place-items-center rounded-lg border border-line-strong bg-void/50 p-0 hover:border-fuse-600 hover:bg-fuse-600"
        >
          <XIcon />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-3 pr-6.5">
        {player.isBot ? (
          <BotAvatar />
        ) : (
          <Avatar name={player.name} background={player.background} color={player.color} />
        )}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.75">
            <div className="truncate text-card-title">{player.name}</div>
            {player.isOwner && <CrownIcon />}
          </div>
          <div className={`mt-0.75 text-micro-label ${roleColor}`}>
            {roleLabel}
          </div>
        </div>
      </div>

      {!player.isBot && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(68px,1fr))] gap-2">
          <Stat value={player.winPct} label="Win rate" />
          <Stat value={player.avgScore} label="Avg score" />
        </div>
      )}
    </div>
  )
}

function Avatar({ name, background, color }: { name: string; background: string; color: string }) {
  const initials = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '?'

  return (
    <div
      className="grid size-13 flex-none place-items-center rounded-2xl display-stat-sm"
      style={{ background, color }}
    >
      {initials}
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="grid size-13 flex-none place-items-center rounded-2xl border border-mint/35 bg-linear-150 from-mint/22 to-[#14502c]/50">
      <BotIcon className="size-6.75 text-mint" />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-x1 bg-fill-strong px-2.75 py-2.25">
      <div className="display-stat-sm">{value}</div>
      <div className="mt-1 text-micro-label text-fg-muted">{label}</div>
    </div>
  )
}