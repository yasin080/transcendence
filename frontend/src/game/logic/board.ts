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
