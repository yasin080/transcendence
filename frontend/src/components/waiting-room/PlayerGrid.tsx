import PlayerCard from './PlayerCard.tsx'
import { BotIcon } from '../left-sidebar/ui/Icons.tsx'
import type { Player } from './types.ts'

interface PlayerGridProps {
  players: Player[]
  maxPlayers: number
  isOwner: boolean
  onKick: (playerId: string) => void
  onAddBot: () => void
}

export default function PlayerGrid({ players, maxPlayers, isOwner, onKick, onAddBot }: PlayerGridProps) {
  const seated = players.slice(0, maxPlayers)
  const emptyCount = Math.max(0, maxPlayers - seated.length)
  const columns = maxPlayers > 9 ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-3'

  return (
    <section>
      <div className="mt-6.5 mb-3 flex items-center gap-3.5">
        <h2 className="text-section-title">Players</h2>
        <span className="text-meta text-fg-muted">
          {seated.length} / {maxPlayers}
        </span>

        {isOwner && emptyCount > 0 && (
          <button
            type="button"
            onClick={onAddBot}
            title="Fill the next free seat with a bot"
            className="ml-auto flex cursor-pointer items-center gap-2 rounded-full border border-mint/35 bg-mint/10 py-2.25 pr-3.75 pl-2.75 text-bot-action hover:border-mint/65 hover:bg-mint/20"
          >
            <BotIcon />
            <span>Add bot</span>
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 gap-2.5 ${columns}`}>
        {seated.map((p) => (
          <PlayerCard key={p.id} player={p} onKick={isOwner && !p.isOwner ? onKick : undefined} />
        ))}
        {Array.from({ length: emptyCount }, (_, i) => (
          <EmptySlot key={`empty-${i}`} />
        ))}
      </div>
    </section>
  )
}

function EmptySlot() {
  return (
    <div className="flex min-h-21 animate-breathe items-center gap-3 rounded-2xl border border-dashed border-line-strong bg-fill-subtle p-4 motion-reduce:animate-none sm:min-h-37.5 sm:flex-col sm:justify-center">
    <div className="size-13 rounded-2xl border border-dashed border-line-strong" />
    <div className="text-micro-label text-fg-faint">Waiting for player</div>
    </div>
  )
}