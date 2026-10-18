import { apiGet, apiPost } from '../lib/api'
import { createGame, type Game } from './logic/game'
import { SNAKE } from './logic/settings'

type Room = { code: string }
type GameRecord = { id: number; seat: number; state: Game | null }
export type Match = { game: Game; seat: number }

export async function startQuickMatch(): Promise<number | null> {
  const room = await apiPost<Room>('/api/rooms', { name: 'Quick match', settings: SNAKE })
  if (!room.ok) return null

  const game = await apiPost<GameRecord>(`/api/rooms/${room.data.code}/games`)
  return game.ok ? game.data.id : null
}

export async function loadMatch(gameId: string): Promise<Match | null> {
  if (gameId === 'demo') return { game: createGame(SNAKE), seat: 0 }

  const record = await apiGet<GameRecord>(`/api/games/${gameId}`)
  return record.ok && record.data.state ? { game: record.data.state, seat: record.data.seat } : null
}
