import type { Board } from './board'
import type { Settings } from './settings'

export type Point = { x: number; y: number }

export type Worm = {
  name: string
  colour: string
  body: Point[]
  dir: Point
  wanted: Point
  alive: boolean
}

export function spawnWorms(board: Board, { players, startLength }: Settings): Worm[] {
  const right = board.width - 2
  const top = board.height - 2

  const spawns = [
    { colour: '#33d1ff', head: { x: startLength, y: 1 }, dir: { x: 1, y: 0 } },
    { colour: '#ff6b52', head: { x: right, y: startLength }, dir: { x: 0, y: 1 } },
    { colour: '#8fff57', head: { x: right + 1 - startLength, y: top }, dir: { x: -1, y: 0 } },
    { colour: '#eb99ff', head: { x: 1, y: top + 1 - startLength }, dir: { x: 0, y: -1 } },
  ]

  return spawns.slice(0, players).map(({ colour, head, dir }, i) => ({
    name: `Player ${i + 1}`,
    colour,
    body: Array.from({ length: startLength }, (_, k) => ({ x: head.x - dir.x * k, y: head.y - dir.y * k })),
    dir,
    wanted: dir,
    alive: true,
  }))
}

export function applyTurn(worm: Worm) {
  const backwards = worm.wanted.x === -worm.dir.x && worm.wanted.y === -worm.dir.y
  if (!backwards) worm.dir = worm.wanted
}

export function nextCell(worm: Worm, board: Board): Point {
  const [head] = worm.body
  return {
    x: (head.x + worm.dir.x + board.width) % board.width,
    y: (head.y + worm.dir.y + board.height) % board.height,
  }
}

export function isOnWorm(worms: Worm[], cell: Point) {
  return worms.some((worm) => worm.body.some((p) => p.x === cell.x && p.y === cell.y))
}
