import { BotIcon, CrownIcon, XIcon } from '../ui/icons.tsx'
import Avatar from '../ui/Avatar.tsx'
import type { Player } from './types.ts'

interface PlayerCardProps {
  player: Player
  onKick?: (playerId: string) => void
}

export default function PlayerCard({ player, onKick }: PlayerCardProps) {
  const roleLabel = player.isOwner
    ? 'Room owner'
    : player.isBot
      ? 'Bot'
      : 'Player'
  const roleColor = player.isOwner
    ? 'text-gold'
    : player.isBot
      ? 'text-mint'
      : 'text-fg-muted'

  return (
    <div
      className={`relative flex flex-col gap-3.5 rounded-2xl border p-4 ${
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
          <XIcon className="size-3 text-white/70" />
        </button>
      )}

      <div className="flex min-w-0 items-center gap-3 pr-6.5">
        {player.isBot ? (
          <BotAvatar />
        ) : (
          <Avatar size={52} src={player.avatar} />
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
    </div>
  )
}

function BotAvatar() {
  return (
    <div className="grid size-13 flex-none place-items-center rounded-2xl border border-mint/35 bg-linear-150 from-mint/22 to-mint/10">
      <BotIcon className="size-6.75 text-mint" />
    </div>
  )
}
