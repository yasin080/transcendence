import { type Board, Cell, cellAt, generateBoard } from './board'
import type { Settings } from './settings'
import { applyTurn, isOnWorm, nextCell, type Point, spawnWorms, type Worm } from './worms'

export type Game = {
  settings: Settings
  board: Board
  worms: Worm[]
  food: Point[]
  startsAt?: number
}

export type ScoreRow = {
  name: string
  colour: string
  score: number
  length: number
  alive: boolean
  isYou: boolean
}

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

function freeCell(game: Game): Point | undefined {
  const { width, cells } = game.board
  const free = cells
    .map((type, i) => ({ type, cell: { x: i % width, y: Math.floor(i / width) } }))
    .filter(({ type, cell }) => type === Cell.Empty && !game.food.some((f) => same(f, cell)) && !isOnWorm(game.worms, cell))
  return free[Math.floor(Math.random() * free.length)]?.cell
}

export function createGame(settings: Settings): Game {
  const board = generateBoard(settings)
  const worms = spawnWorms(board, settings)
  for (const p of worms.flatMap((worm) => worm.body)) board.cells[p.y * board.width + p.x] = Cell.Empty
  const game: Game = { settings, board, worms, food: [] }
  for (let i = 0, cell; i < settings.food && (cell = freeCell(game)); i++) game.food.push(cell)
  return game
}

export function turn(game: Game, player: number, dir: Point) {
  game.worms[player].wanted = dir
}

export function steer(game: Game, player: number, side: 'left' | 'right') {
  const { x, y } = game.worms[player].dir
  game.worms[player].wanted = side === 'left' ? { x: -y, y: x } : { x: y, y: -x }
}

function headOn(game: Game, next: Point[], i: number) {
  const head = (k: number) => game.worms[k].body[0]
  return game.worms.some(
    (other, j) =>
      j !== i && other.alive && (same(next[j], next[i]) || (same(next[i], head(j)) && same(next[j], head(i)))),
  )
}

function moveWorm(game: Game, worm: Worm, next: Point) {
  const wall = cellAt(game.board, next.x, next.y) !== Cell.Empty
  if (wall || isOnWorm(game.worms, next)) {
    const hit = wall ? game.settings.wallHit : game.settings.bodyHit
    if (hit === 'die') worm.alive = false
    return
  }

  const eaten = game.food.findIndex((f) => same(f, next))
  worm.body = [next, ...(eaten >= 0 ? worm.body : worm.body.slice(0, -1))]
  if (eaten < 0) return
  game.food.splice(eaten, 1)
  const cell = freeCell(game)
  if (cell) game.food.push(cell)
}

export function tick(game: Game) {
  for (const worm of game.worms) if (worm.alive) applyTurn(worm)
  const next = game.worms.map((worm) => nextCell(worm, game.board))
  const crashed = game.worms.map((worm, i) => worm.alive && headOn(game, next, i))
  game.worms.forEach((worm, i) => {
    if (crashed[i]) worm.alive = false
    else if (worm.alive) moveWorm(game, worm, next[i])
  })
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
      isYou: i === you,
    }))
    .sort((a, b) => Number(b.alive) - Number(a.alive) || b.score - a.score)
}
