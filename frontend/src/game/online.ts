import { apiPost, apiPostOnClose } from '../lib/api'
import { echo } from '../lib/echo'
import type { Game } from './logic/game'
import type { Point } from './logic/worms'

export type Input = { side: 'left' | 'right' } | { dir: Point }

type Tick = Pick<Game, 'worms' | 'food'>

export function listenOnline(gameId: string, game: Game, onTick: () => void) {
  const channel = `game.${gameId}`
  echo.private(channel).listen('.tick', (tick: Tick) => {
    tick.worms.forEach((worm, i) => Object.assign(game.worms[i], worm))
    game.food = tick.food
    onTick()
  })
  return () => echo.leave(channel)
}

export function sendInput(gameId: string, input: Input) {
  void apiPost(`/api/games/${gameId}/turn`, input)
}

// The server greys out a worm whose page has gone quiet (Presence.php):
// a ping every second, and an explicit leave when the page closes.
export function reportPresence(gameId: string) {
  const ping = () => void apiPost(`/api/games/${gameId}/ping`)
  const leave = () => void apiPostOnClose(`/api/games/${gameId}/leave`)
  ping()
  const timer = setInterval(ping, 1000)
  window.addEventListener('pagehide', leave)
  return () => {
    clearInterval(timer)
    window.removeEventListener('pagehide', leave)
    leave()
  }
}
