import type { Settings } from '../../game/logic/settings.ts'

// Sala tal como la devuelve POST /api/rooms (con sus players cargados)
export interface Room {
  id: number
  code: string
  name: string
  host_id: number
  status: 'open' | 'playing' | 'finished' | 'closed'
  settings: Settings
  players: RoomPlayer[]
}

// Sala tal como la devuelve GET /api/rooms
export type RoomSummary = Omit<Room, 'players'> & {
  host: { id: number; name: string }
  players_count: number
  latest_game: { id:number } | null
}

export interface RoomPlayer {
  id: number
  room_id: number
  user_id: number | null
  seat: number
  bot_difficulty: 'easy' | 'medium' | 'hard' | null
  user?: { id: number; name: string } | null
}
