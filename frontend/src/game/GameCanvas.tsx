import { useEffect, useRef } from 'react'

import type { Board } from './board'
import { createGameScene } from './render/scene'

export default function GameCanvas({ board }: { board: Board }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = createGameScene(canvas, board)
    return () => game.dispose()
  }, [board])

  return <canvas ref={canvasRef} className="block h-full w-full touch-none outline-none" />
}
