import { type Game, isOver, tick } from './logic/game'

export function runLocally(game: Game, onTick: () => void) {
  const timer = setInterval(() => {
    tick(game)
    if (isOver(game)) clearInterval(timer)
    onTick()
  }, game.settings.tickMs)
  return () => clearInterval(timer)
}
