import { Vector3 } from '@babylonjs/core/Maths/math.vector'

import type { Board } from '../logic/board'
import type { Point } from '../logic/worms'

export function toWorld(board: Board, cell: Point, height = 0) {
  return new Vector3(cell.x - board.width / 2 + 0.5, height, cell.y - board.height / 2 + 0.5)
}
