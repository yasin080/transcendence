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
      : 'text-white/45'

  return (
    <div
      className={`relative flex flex-col gap-3.5 rounded-[14px] border p-4 ${
        player.isBot ? 'border-mint/[.22] bg-online/5' : 'border-white/[.08] bg-white/[.035]'
      }`}
    >
      {onKick && (
        <button
          type="button"
          onClick={() => onKick(player.id)}
          title={`Kick ${player.name}`}
          aria-label={`Kick ${player.name}`}
          className="absolute top-2.5 right-2.5 grid size-6 cursor-pointer place-items-center rounded-lg border border-white/[.12] bg-[#080718]/60 p-0 hover:border-fuse-600 hover:bg-fuse-600"
        >
          <XIcon />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-3 pr-[26px]">
        {player.isBot ? (
          <BotAvatar />
        ) : (
          <Avatar name={player.name} background={player.background} color={player.color} />
        )}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-[7px]">
            <div className="truncate text-card-title">{player.name}</div>
            {player.isOwner && <CrownIcon />}
          </div>
          <div className={`mt-[3px] text-micro-label font-semibold ${roleColor}`}>
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
      className="grid size-[52px] flex-none place-items-center rounded-2xl display-stat-sm"
      style={{ background, color }}
    >
      {initials}
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="grid size-[52px] flex-none place-items-center rounded-2xl border border-mint/[.35] bg-[linear-gradient(150deg,rgba(69,224,122,.22),rgba(20,80,44,.5))]">
      <BotIcon className="size-[27px] text-mint" />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[10px] bg-white/5 px-[11px] py-[9px]">
      <div className="display-stat-sm">{value}</div>
      <div className="mt-1 text-micro-label text-white/45">{label}</div>
    </div>
  )
}