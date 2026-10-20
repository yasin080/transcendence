import { FOOD_OPTIONS, SPEED_OPTIONS, labelFor } from './roomOptions.ts'
import type { RoomSummary } from './types.ts'

interface RoomRowProps {
  room: RoomSummary
  onJoin: (room: RoomSummary) => void
  // Ya tengo asiento en esta sala: "Enter" en vez de "Join", aunque esté llena
  isMine: boolean
  // Tengo asiento en otra sala: no puedo unirme a esta
  locked: boolean
}

// Cabecera y filas comparten columnas y relleno para quedar alineadas.
// La última columna tiene ancho fijo: con auto, cada fila la mediría según su
// contenido (botón Join o texto "In game") y las demás columnas se moverían.
const ROW_LAYOUT =
  'grid grid-cols-[minmax(0,1fr)_auto_6.5rem] items-center gap-3 px-4 sm:grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_6.5rem] sm:gap-4 sm:px-[18px]'

// Fila: nombre · tablero · velocidad · plazas + botón.
// Punto verde = sala abierta (Join), naranja = en partida ("In game", sin botón).
export default function RoomRow({ room, onJoin, isMine, locked }: RoomRowProps) {
  const playing = room.status === 'playing'
  const full = room.players_count >= room.settings.players

  return (
    <div className={`${ROW_LAYOUT} py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8`}>
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`size-2.5 flex-none rounded-full ${
            playing
              ? 'bg-ember-600 shadow-[0_0_10px_2px_rgba(255,155,47,.5)]'
              : 'bg-signal-500 shadow-[0_0_10px_2px_rgba(69,224,122,.45)]'
          }`}
        />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{room.name}</div>
          {/* [RETOMAR] CAMBIAR EL NAME DEL HOST POR EL NICK */}
          <div className="truncate text-xs text-white/45">hosted by {room.host.name}</div>
        </div>
      </div>
      <div className="hidden text-center text-[13px] text-white/72">{labelFor(FOOD_OPTIONS, room.settings.food)}</div>
      <div className="hidden text-center text-[13px] text-white/72">{labelFor(SPEED_OPTIONS, room.settings.tickMs)}</div>
      <div className={`whitespace-nowrap text-center text-[13px] font-bold ${playing ? 'text-ember-600' : 'text-signal-500'}`}>
        {room.players_count} / {room.settings.players}
      </div>
      {playing ? (
        <span className="text-center text-[13px] font-bold tracking-[.04em] text-ember-600">In game</span>
      ) : (
        <button
          type="button"
          disabled={!isMine && (full || locked)}
          title={locked ? 'You are already in another room' : undefined}
          onClick={() => onJoin(room)}
          className="py-[9px] rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isMine ? 'Enter' : 'Join'}
        </button>
      )}
    </div>
  )
}

// Títulos de columna sobre la lista. El borde transparente iguala el de las
// filas para que el texto caiga en la misma posición.
export function RoomListHeader() {
  return (
    <div className={`${ROW_LAYOUT} border border-transparent text-[11px] font-bold uppercase tracking-[.14em] text-white/45`}>
      {/* 22px = punto de estado (10px) + su separación (12px): alinea con el nombre */}
      <span className="pl-[22px]">Room</span>
      <span className="hidden text-center sm:block">Food</span>
      <span className="hidden text-center sm:block">Speed</span>
      <span className="text-center">Players</span>
    </div>
  )
}
