import { type Board, Cell, cellAt, generateBoard } from './board'
import type { Settings } from './settings'
import { applyTurn, isOnWorm, nextCell, type Point, spawnWorms, type Worm } from './worms'

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

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y

function freeCell(game: Game): Point | undefined {
  const { width, cells } = game.board
  const taken = [...game.food, ...game.pickups, ...game.bombs]
  const free = cells
    .map((type, i) => ({ type, cell: { x: i % width, y: Math.floor(i / width) } }))
    .filter(({ type, cell }) => type === Cell.Empty && !taken.some((t) => same(t, cell)) && !isOnWorm(game.worms, cell))
  return free[Math.floor(Math.random() * free.length)]?.cell
}

export function createGame(settings: Settings): Game {
  const board = generateBoard(settings)
  const worms = spawnWorms(board, settings)
  for (const p of worms.flatMap((worm) => worm.body)) board.cells[p.y * board.width + p.x] = Cell.Empty
  const game: Game = { settings, board, worms, food: [], pickups: [], bombs: [], blasts: [] }
  for (let i = 0, cell; i < settings.food && (cell = freeCell(game)); i++) game.food.push(cell)
  for (let i = 0, cell; i < settings.bombs && (cell = freeCell(game)); i++) game.pickups.push(cell)
  return game
}

export function turn(game: Game, player: number, dir: Point) {
  game.worms[player].wanted = dir
}

export function steer(game: Game, player: number, side: 'left' | 'right') {
  const { x, y } = game.worms[player].dir
  game.worms[player].wanted = side === 'left' ? { x: -y, y: x } : { x: y, y: -x }
}

const moves = (worm: Worm) => worm.alive && !worm.away

function headOn(game: Game, next: Point[], i: number) {
  const head = (k: number) => game.worms[k].body[0]
  return game.worms.some(
    (other, j) =>
      j !== i && moves(other) && (same(next[j], next[i]) || (same(next[i], head(j)) && same(next[j], head(i)))),
  )
}

function moveWorm(game: Game, worm: Worm, next: Point) {
  const wall = cellAt(game.board, next.x, next.y) !== Cell.Empty
  if (wall || isOnWorm(game.worms, next)) {
    const hit = wall ? game.settings.wallHit : game.settings.bodyHit
    if (hit === 'die') worm.alive = false
    return
  }

  const tail = worm.body[worm.body.length - 1]
  const eaten = game.food.findIndex((f) => same(f, next))
  worm.body = [next, ...(eaten >= 0 ? worm.body : worm.body.slice(0, -1))]
  if (eaten >= 0) respawn(game, game.food, eaten)

  // A bomb goes in through the mouth and drops at once where the tail was.
  const swallowed = game.pickups.findIndex((p) => same(p, next))
  if (swallowed >= 0) {
    game.bombs.push({ x: tail.x, y: tail.y, fuse: FUSE })
    respawn(game, game.pickups, swallowed)
  }
}

function respawn(game: Game, items: Point[], index: number) {
  items.splice(index, 1)
  const cell = freeCell(game)
  if (cell) items.push(cell)
}

export function blastCells(board: Board, cell: Point): Point[] {
  const cells: Point[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = (cell.x + dx + board.width) % board.width
      const y = (cell.y + dy + board.height) % board.height
      if (cellAt(board, x, y) === Cell.Empty) cells.push({ x, y })
    }
  }
  return cells
}

function explode(game: Game) {
  for (const bomb of game.bombs) bomb.fuse--
  game.blasts = game.bombs.filter((bomb) => bomb.fuse <= 0).map(({ x, y }) => ({ x, y }))
  game.bombs = game.bombs.filter((bomb) => bomb.fuse > 0)

  const hit = game.blasts.flatMap((blast) => blastCells(game.board, blast))
  for (const worm of game.worms) {
    const k = worm.body.findIndex((segment) => hit.some((cell) => same(cell, segment)))
    if (!worm.alive || k < 0) continue
    if (k === 0) worm.alive = false
    else worm.body = worm.body.slice(0, k)
  }
}

export function tick(game: Game) {
  for (const worm of game.worms) if (moves(worm)) applyTurn(worm)
  const next = game.worms.map((worm) => nextCell(worm, game.board))
  const crashed = game.worms.map((worm, i) => moves(worm) && headOn(game, next, i))
  game.worms.forEach((worm, i) => {
    if (crashed[i]) worm.alive = false
    else if (moves(worm)) moveWorm(game, worm, next[i])
  })
  explode(game)
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
