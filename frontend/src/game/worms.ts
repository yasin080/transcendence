import { type Board, Cell, cellAt } from './board'

export type Point = { x: number; y: number }

export type Worm = {
  colour: string
  body: Point[]
  dir: Point
}

const START_LENGTH = 5
const SAFE_RADIUS = 3

function clearAround(board: Board, center: Point) {
  for (let y = center.y - SAFE_RADIUS; y <= center.y + SAFE_RADIUS; y++) {
    for (let x = center.x - SAFE_RADIUS; x <= center.x + SAFE_RADIUS; x++) {
      if (cellAt(board, x, y) === Cell.Soft) board.cells[y * board.width + x] = Cell.Empty
    }
  }
}

export function spawnWorms(board: Board): Worm[] {
  const left = START_LENGTH
  const right = board.width - 1 - START_LENGTH
  const top = 1
  const bottom = board.height - 2

  const spawns = [
    { colour: '#33d1ff', head: { x: left, y: top }, dir: { x: 1, y: 0 } },
    { colour: '#ff6b52', head: { x: right, y: top }, dir: { x: -1, y: 0 } },
    { colour: '#8fff57', head: { x: left, y: bottom }, dir: { x: 1, y: 0 } },
    { colour: '#eb99ff', head: { x: right, y: bottom }, dir: { x: -1, y: 0 } },
  ]

  return spawns.map(({ colour, head, dir }) => {
    const body = Array.from({ length: START_LENGTH }, (_, i) => ({
      x: head.x - dir.x * i,
      y: head.y - dir.y * i,
    }))
    for (const p of body) clearAround(board, p)
    return { colour, body, dir }
  })
}

export function turnWorm(worm: Worm, dir: Point) {
  const backwards = dir.x === -worm.dir.x && dir.y === -worm.dir.y
  if (!backwards) worm.dir = dir
}

function isFree(board: Board, worms: Worm[], cell: Point) {
  if (cellAt(board, cell.x, cell.y) !== Cell.Empty) return false
  return worms.every((worm) => worm.body.every((p) => p.x !== cell.x || p.y !== cell.y))
}

export function moveWorm(worm: Worm, board: Board, worms: Worm[]) {
  const [head] = worm.body
  const next = { x: head.x + worm.dir.x, y: head.y + worm.dir.y }
  if (isFree(board, worms, next)) worm.body = [next, ...worm.body.slice(0, -1)]
}
