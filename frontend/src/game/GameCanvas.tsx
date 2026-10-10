import { useEffect, useRef } from 'react'

import { listenToDpad, listenToTurns } from './keyboard'
import { runLocally } from './local'
import { type Game, isOver, steer, turn } from './logic/game'
import { createGameScene } from './render/scene'

const YOU = 0

export default function GameCanvas({ game, onGameOver }: { game: Game; onGameOver: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createGameScene(canvas, game)
    const stopListening =
      game.settings.controls === 'dpad'
        ? listenToDpad((dir) => turn(game, YOU, dir))
        : listenToTurns((side) => steer(game, YOU, side))
    const stopRunning = runLocally(game, () => {
      scene.onTick()
      if (isOver(game)) onGameOver()
    })

    return () => {
      stopRunning()
      stopListening()
      scene.dispose()
    }
  }, [game])

  return <canvas ref={canvasRef} className="block h-full w-full touch-none outline-none" />
}
