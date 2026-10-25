import { apiGet, apiPost } from '../lib/api'
import { type Game } from './logic/game'
import type { Settings } from './logic/settings'

type Room = { code: string }
type GameRecord = { id: number; seat: number | null; now: number; room: { code: string }; state: Game | null }
export type Match = { game: Game; seat: number | null; roomCode: string | null }

// Room names must be unique among active rooms, so each quick match gets its own.
// The other seats go to bots, so the match starts right away.
export async function startQuickMatch(settings: Settings): Promise<number | null> {
  const name = `Quick match ${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const room = await apiPost<Room>('/api/rooms', { name, settings })
  if (!room.ok) return null

  for (let seat = 1; seat < settings.players; seat++) {
    const bot = await apiPost(`/api/rooms/${room.data.code}/bots`)
    if (!bot.ok) return null
  }

  const game = await apiPost<GameRecord>(`/api/rooms/${room.data.code}/games`)
  return game.ok ? game.data.id : null
}

export async function loadMatch(gameId: string): Promise<Match | null> {
  const record = await apiGet<GameRecord>(`/api/games/${gameId}`)
  if (!record.ok || !record.data.state) return null
  const { state, seat, now, room } = record.data
  if (state.startsAt) state.startsAt += Date.now() - now
  return { game: state, seat, roomCode: room.code }
}
