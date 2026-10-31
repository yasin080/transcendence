import type { Board } from './board'
import type { Settings } from './settings'
import type { Point, Worm } from './worms'

export type Bomb = Point & { fuse: number }

export type Game = {
  settings: Settings
  board: Board
  worms: Worm[]
  food: Point[]
  pickups: Point[]
  bombs: Bomb[]
  blasts: Point[]
  startsAt?: number
}

/** Ticks a dropped bomb waits before going off. */
export const FUSE = 8

export type ScoreRow = {
  name: string
  colour: string
  score: number
  length: number
  alive: boolean
  away: boolean
  isYou: boolean
}

export function isOver(game: Game) {
  const alive = game.worms.filter((worm) => worm.alive).length
  return game.worms.length === 1 ? alive === 0 : alive <= 1
}

export function scoreboard(game: Game, you: number): ScoreRow[] {
  return game.worms
    .map((worm, i) => ({
      name: worm.name,
      colour: worm.colour,
      score: worm.body.length - game.settings.startLength,
      length: worm.body.length,
      alive: worm.alive,
      away: !!worm.away,
      isYou: i === you,
    }))
    .sort((a, b) => Number(b.alive) - Number(a.alive) || b.score - a.score)
}
