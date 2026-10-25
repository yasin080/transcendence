import { useEffect, useRef } from 'react'

import { listenToDpad, listenToTurns } from './keyboard'
import { type Game, isOver } from './logic/game'
import { type Input, listenOnline, reportPresence, sendInput } from './online'
import { createGameScene } from './render/scene'
import { listenToTouch } from './touch'

type Props = {
  game: Game
  gameId: string
  you: number | null
  onGameOver: () => void
  onEliminated: () => void
  onUpdate: () => void
}

export default function GameCanvas({ game, gameId, you, onGameOver, onEliminated, onUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createGameScene(canvas, game, you)
    // Back to a match that already ended: no more ticks will come, so show the result now
    if (isOver(game)) {
      onGameOver()
      return () => scene.dispose()
    }
    const onTick = () => {
      scene.onTick()
      onUpdate()
      if (isOver(game)) onGameOver()
      else if (you !== null && !game.worms[you].alive) onEliminated()
    }

    const stopRunning = listenOnline(gameId, game, onTick)
    // A spectator only watches: no controls, and no pings, since the server only takes them from players.
    if (you === null) {
      return () => {
        stopRunning()
        scene.dispose()
      }
    }

    const send = (input: Input) => {
      if (!game.worms[you].alive) return
      sendInput(gameId, input)
    }

    const stopListening =
      game.settings.controls === 'dpad'
        ? listenToDpad((dir) => send({ dir }))
        : listenToTurns((side) => send({ side }))
    const stopTouching = listenToTouch(
      canvas,
      (side) => send({ side }),
      (dir) => send({ dir }),
    )
    const stopReporting = reportPresence(gameId)

    return () => {
      stopRunning()
      stopReporting()
      stopListening()
      stopTouching()
      scene.dispose()
    }
  }, [game, gameId, you])

  return <canvas ref={canvasRef} className="block h-full w-full touch-none outline-none" />
}
