import { apiGet, apiPost } from '../lib/api'
import { type Settings, SNAKE } from './logic/settings'

type Room = { code: string }
type GameRecord = { id: number; room: { settings: Settings } }

export async function startQuickMatch(): Promise<number | null> {
  const room = await apiPost<Room>('/api/rooms', { name: 'Quick match', settings: SNAKE })
  if (!room.ok) return null

  const game = await apiPost<GameRecord>(`/api/rooms/${room.data.code}/games`)
  return game.ok ? game.data.id : null
}

export async function loadSettings(gameId: string): Promise<Settings | null> {
  if (gameId === 'demo') return SNAKE

  const game = await apiGet<GameRecord>(`/api/games/${gameId}`)
  return game.ok ? game.data.room.settings : null
}
