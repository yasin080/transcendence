import { useEffect, useRef } from 'react'

import type { Board } from './board'
import type { Worm } from './worms'
import { createGameScene } from './render/scene'

export default function GameCanvas({ board, worms }: { board: Board; worms: Worm[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = createGameScene(canvas, board, worms)
    return () => game.dispose()
  }, [board, worms])

  return <canvas ref={canvasRef} className="block h-full w-full touch-none outline-none" />
}
