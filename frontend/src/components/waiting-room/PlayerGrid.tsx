import PlayerCard from './PlayerCard.tsx'
import type { Player } from './types.ts'

interface PlayerGridProps {
  players: Player[]
  maxPlayers: number
  isOwner: boolean
  onKick: (playerId: string) => void
}

export default function PlayerGrid({ players, maxPlayers, isOwner, onKick }: PlayerGridProps) {
  const seated = players.slice(0, maxPlayers)
  const emptyCount = Math.max(0, maxPlayers - seated.length)
  // Hasta 9 plazas: 3 por fila. Más de 9: 5 por fila, para que la cuadrícula no se alargue.
  const columns = maxPlayers > 9 ? 'grid-cols-5' : 'grid-cols-3'

  return (
    <section>
      <div className="mt-6.5 mb-3 flex items-center gap-3.5">
        <h2 className="text-section-title">Players</h2>
      </div>

      <div className={`grid gap-2.5 ${columns}`}>
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
    <div className="flex min-h-37.5 animate-breathe flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-fill-subtle p-4 motion-reduce:animate-none">
      <div className="size-13 rounded-2xl border border-dashed border-line-strong" />
      <div className="text-micro-label text-fg-faint">Waiting for player</div>
    </div>
  )
}