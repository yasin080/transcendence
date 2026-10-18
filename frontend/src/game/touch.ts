import type { Point } from './logic/worms'

type Side = 'left' | 'right'

const SWIPE_PX = 30

export const isTouch = navigator.maxTouchPoints > 0

// Tap a half of the screen to turn that way; swipe to head that way.
// A swipe fires as soon as the finger has travelled far enough.
export function listenToTouch(canvas: HTMLCanvasElement, onSide: (side: Side) => void, onDir: (dir: Point) => void) {
  let start: { x: number; y: number } | null = null

  const onDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch') start = { x: event.clientX, y: event.clientY }
  }
  const onMove = (event: PointerEvent) => {
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_PX) return
    start = null
    navigator.vibrate?.(8)
    onDir(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: -Math.sign(dy) })
  }
  const onUp = (event: PointerEvent) => {
    if (!start) return
    start = null
    navigator.vibrate?.(8)
    const { left, width } = canvas.getBoundingClientRect()
    onSide(event.clientX < left + width / 2 ? 'left' : 'right')
  }
  const onCancel = () => (start = null)

  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)
  return () => {
    canvas.removeEventListener('pointerdown', onDown)
    canvas.removeEventListener('pointermove', onMove)
    canvas.removeEventListener('pointerup', onUp)
    canvas.removeEventListener('pointercancel', onCancel)
  }
}
