import type { GameSummary } from './types.ts'

interface GameRowProps {
  game: GameSummary
  onJoin: (game: GameSummary) => void
  onSpectate: (game: GameSummary) => void
}

// Fila: nombre · modo · variante · plazas + botón.
// Punto verde = esperando jugadores (Join), naranja = en partida (Spectate).
export default function GameRow({ game, onJoin, onSpectate }: GameRowProps) {
  const playing = game.status === 'playing'
  const full = game.players >= game.maxPlayers

  return (
    <div className="grid grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_auto] items-center gap-4 px-[18px] py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`size-2.5 flex-none rounded-full ${
            playing
              ? 'bg-ember-600 shadow-[0_0_10px_2px_rgba(255,155,47,.5)]'
              : 'bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]'
          }`}
        />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{game.name}</div>
          <div className="text-xs text-white/45">hosted by {game.hostName}</div>
        </div>
      </div>
      <div className="text-[13px] text-white/72">{game.mode}</div>
      <div className="text-[13px] text-white/72">{game.variant}</div>
      <div className={`text-[13px] font-bold ${playing ? 'text-ember-600' : 'text-signal-500'}`}>
        {game.players} / {game.maxPlayers}
      </div>
      <button
        type="button"
        disabled={!playing && full}
        onClick={() => (playing ? onSpectate(game) : onJoin(game))}
        className="px-5 py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
      >
        {playing ? 'Spectate' : 'Join'}
      </button>
    </div>
  )
}
