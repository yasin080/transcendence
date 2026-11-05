import { FOOD_OPTIONS, SPEED_OPTIONS, labelFor } from './roomOptions.ts'
import { Link } from 'react-router'
import type { RoomSummary } from './types.ts'

interface RoomRowProps {
  room: RoomSummary
  onJoin: (room: RoomSummary) => void
  // Already seated in this room: "Enter" instead of "Join", even if it's full
  isMine: boolean
  // Seated in another room: can't join this one
  locked: boolean
}

// Header and rows share columns and padding so they stay aligned.
// The last column has a fixed width: with auto, each row would size it by its
// content (Join button or Spectate link) and the other columns would shift.
// On mobile only name, seats and button; from sm up, food and speed too.

const ROW_LAYOUT =
  'grid grid-cols-[minmax(0,1fr)_auto_6.5rem] items-center gap-3 px-4 sm:grid-cols-[minmax(0,1.6fr)_.9fr_.9fr_.7fr_6.5rem] sm:gap-4 sm:px-[18px]'

// Row: name · board · speed · seats + button.
// Green dot = open room (Join), orange = match in progress (Spectate, or Enter if it's your own).
export default function RoomRow({ room, onJoin, isMine, locked }: RoomRowProps) {
  const playing = room.status === 'playing'
  const full = room.players_count >= room.settings.players

  return (
    <div className={`${ROW_LAYOUT} py-3.5 rounded-[14px] border border-white/8 bg-white/4 hover:border-fuse-600/40 hover:bg-white/8`}>
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`size-2.5 flex-none rounded-full ${
            playing
              ? 'bg-ember-600 shadow-[0_0_10px_2px] shadow-ember-600/50'
              : 'bg-signal-500 shadow-[0_0_10px_2px] shadow-signal-500/45'
          }`}
        />
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{room.name}</div>
          <div className="truncate text-xs text-white/45">hosted by {room.host.username}</div>
        </div>
      </div>
      <div className="hidden text-center text-[13px] text-white/72 sm:block">{labelFor(FOOD_OPTIONS, room.settings.food)}</div>
      <div className="hidden text-center text-[13px] text-white/72 sm:block">{labelFor(SPEED_OPTIONS, room.settings.tickMs)}</div>
      <div className={`whitespace-nowrap text-center text-[13px] font-bold ${playing ? 'text-ember-600' : 'text-signal-500'}`}>
        {room.players_count} / {room.settings.players}
      </div>
      {playing ? (
        <Link
          to={`/game/${room.latest_game?.id}`}
          className="py-2.25 rounded-[10px] border border-ember-600/60 text-center text-[13px] font-bold tracking-[.04em] text-ember-600 hover:bg-ember-600/15"
        >
          {isMine ? 'Enter' : 'Spectate'}
        </Link>

      ) : (
        <button
          type="button"
          disabled={!isMine && (full || locked)}
          title={locked ? 'You are already in another room' : undefined}
          onClick={() => onJoin(room)}
          className="py-2.25 rounded-[10px] bg-fuse-600 text-[13px] font-bold tracking-[.04em] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isMine ? 'Enter' : 'Join'}
        </button>
      )}
    </div>
  )
}
