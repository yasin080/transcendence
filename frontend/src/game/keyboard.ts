import type { Point } from './worms'

const UP = { x: 0, y: 1 }
const DOWN = { x: 0, y: -1 }
const LEFT = { x: -1, y: 0 }
const RIGHT = { x: 1, y: 0 }

const KEYS: Record<string, Point> = {
  w: UP,
  arrowup: UP,
  s: DOWN,
  arrowdown: DOWN,
  a: LEFT,
  arrowleft: LEFT,
  d: RIGHT,
  arrowright: RIGHT,
}

export function listenToArrows(onArrow: (dir: Point) => void) {
  const onKeyDown = (event: KeyboardEvent) => {
    const dir = KEYS[event.key.toLowerCase()]
    if (!dir) return
    event.preventDefault()
    onArrow(dir)
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
