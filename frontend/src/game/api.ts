import { apiGet, apiPost } from '../lib/api'
import { createGame, type Game } from './logic/game'
import { SNAKE } from './logic/settings'

type Room = { code: string }
type GameRecord = { id: number; seat: number; now: number; room: { code: string }; state: Game | null }
export type Match = { game: Game; seat: number; roomCode: string | null }

export async function startQuickMatch(): Promise<number | null> {
  const room = await apiPost<Room>('/api/rooms', { name: 'Quick match', settings: SNAKE })
  if (!room.ok) return null

  const game = await apiPost<GameRecord>(`/api/rooms/${room.data.code}/games`)
  return game.ok ? game.data.id : null
}

export async function loadMatch(gameId: string): Promise<Match | null> {
  if (gameId === 'demo') return { game: createGame(SNAKE), seat: 0, roomCode: null }

  const record = await apiGet<GameRecord>(`/api/games/${gameId}`)
  if (!record.ok || !record.data.state) return null
  const { state, seat, now, room } = record.data
  if (state.startsAt) state.startsAt += Date.now() - now
  return { game: state, seat, roomCode: room.code }
}
