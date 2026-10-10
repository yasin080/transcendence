import type { Point } from './logic/worms'

type Side = 'left' | 'right'

const UP = { x: 0, y: 1 }
const DOWN = { x: 0, y: -1 }
const LEFT = { x: -1, y: 0 }
const RIGHT = { x: 1, y: 0 }

const DPAD: Record<string, Point> = {
  w: UP,
  arrowup: UP,
  s: DOWN,
  arrowdown: DOWN,
  a: LEFT,
  arrowleft: LEFT,
  d: RIGHT,
  arrowright: RIGHT,
}

const TURN: Record<string, Side> = {
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
}

function listen<T>(keys: Record<string, T>, onKey: (value: T) => void) {
  const onKeyDown = (event: KeyboardEvent) => {
    const value = keys[event.key.toLowerCase()]
    if (value === undefined) return
    event.preventDefault()
    onKey(value)
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}

export const listenToDpad = (onDir: (dir: Point) => void) => listen(DPAD, onDir)
export const listenToTurns = (onSide: (side: Side) => void) => listen(TURN, onSide)
