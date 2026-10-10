import type { Settings } from './settings'

export const Cell = {
  Empty: 0,
  Hard: 1,
  Soft: 2,
} as const
export type Cell = (typeof Cell)[keyof typeof Cell]

export type Board = {
  width: number
  height: number
  cells: Cell[]
}

export const cellAt = (board: Board, x: number, y: number): Cell =>
  board.cells[y * board.width + x]

export function generateBoard({ width, height, wrap, pillars, softWalls }: Settings): Board {
  const cells: Cell[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rim = !wrap && (x === 0 || y === 0 || x === width - 1 || y === height - 1)
      const pillar = pillars && x % 2 === 0 && y % 2 === 0
      if (rim || pillar) cells.push(Cell.Hard)
      else cells.push(Math.random() < softWalls ? Cell.Soft : Cell.Empty)
    }
  }
  return { width, height, cells }
}
