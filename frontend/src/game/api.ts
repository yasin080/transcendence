import { apiGet, apiPost } from '../lib/api'
import { createGame, type Game } from './logic/game'
import { SNAKE } from './logic/settings'

type Room = { code: string }
type GameRecord = { id: number; state: Game | null }

export async function startQuickMatch(): Promise<number | null> {
  const room = await apiPost<Room>('/api/rooms', { name: 'Quick match', settings: SNAKE })
  if (!room.ok) return null

  const game = await apiPost<GameRecord>(`/api/rooms/${room.data.code}/games`)
  return game.ok ? game.data.id : null
}

export async function loadGame(gameId: string): Promise<Game | null> {
  if (gameId === 'demo') return createGame(SNAKE)

  const game = await apiGet<GameRecord>(`/api/games/${gameId}`)
  return game.ok ? game.data.state : null
}
