import { apiPost } from '../lib/api'
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
