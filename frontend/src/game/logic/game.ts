import { type Board, Cell, cellAt, generateBoard } from './board'
import type { Settings } from './settings'
import { applyTurn, isOnWorm, nextCell, type Point, spawnWorms, type Worm } from './worms'

export type Game = {
  settings: Settings
  board: Board
  worms: Worm[]
  food: Point[]
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

function freeCell(game: Game): Point {
  for (;;) {
    const cell = { x: Math.floor(Math.random() * game.board.width), y: Math.floor(Math.random() * game.board.height) }
    const wall = cellAt(game.board, cell.x, cell.y) !== Cell.Empty
    const food = game.food.some((f) => same(f, cell))
    if (!wall && !food && !isOnWorm(game.worms, cell)) return cell
  }
}

export function createGame(settings: Settings): Game {
  const board = generateBoard(settings)
  const game: Game = { settings, board, worms: spawnWorms(board, settings), food: [] }
  for (let i = 0; i < settings.food; i++) game.food.push(freeCell(game))
  return game
}

export function turn(game: Game, player: number, dir: Point) {
  game.worms[player].wanted = dir
}

export function steer(game: Game, player: number, side: 'left' | 'right') {
  const { x, y } = game.worms[player].dir
  game.worms[player].wanted = side === 'left' ? { x: -y, y: x } : { x: y, y: -x }
}

function moveWorm(game: Game, worm: Worm) {
  applyTurn(worm)
  const next = nextCell(worm, game.board)
  const wall = cellAt(game.board, next.x, next.y) !== Cell.Empty
  if (wall || isOnWorm(game.worms, next)) {
    const hit = wall ? game.settings.wallHit : game.settings.bodyHit
    if (hit === 'die') worm.alive = false
    return
  }

  const eaten = game.food.findIndex((f) => same(f, next))
  worm.body = [next, ...(eaten >= 0 ? worm.body : worm.body.slice(0, -1))]
  if (eaten >= 0) game.food[eaten] = freeCell(game)
}

export function tick(game: Game) {
  for (const worm of game.worms) if (worm.alive) moveWorm(game, worm)
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
