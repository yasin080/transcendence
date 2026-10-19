import { useEffect, useRef } from 'react'

import { listenToDpad, listenToTurns } from './keyboard'
import { runLocally } from './local'
import { type Game, isOver, steer, turn } from './logic/game'
import { type Input, listenOnline, reportPresence, sendInput } from './online'
import { createGameScene } from './render/scene'
import { listenToTouch } from './touch'

type Props = { game: Game; gameId: string; you: number; onGameOver: () => void; onUpdate: () => void }

export default function GameCanvas({ game, gameId, you, onGameOver, onUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createGameScene(canvas, game)
    const onTick = () => {
      scene.onTick()
      onUpdate()
      if (!game.worms[you].alive || isOver(game)) onGameOver()
    }

    const online = gameId !== 'demo'
    const applyLocally = (input: Input) =>
      'side' in input ? steer(game, you, input.side) : turn(game, you, input.dir)
    const send = (input: Input) => {
      if (!game.worms[you].alive) return
      if (online) sendInput(gameId, input)
      else applyLocally(input)
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
    const stopRunning = online ? listenOnline(gameId, game, onTick) : runLocally(game, onTick)
    const stopReporting = online ? reportPresence(gameId) : () => {}

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
