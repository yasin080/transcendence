import { useEffect, useRef } from 'react'

import { listenToDpad, listenToTurns } from './keyboard'
import { runLocally } from './local'
import { type Game, isOver, steer, turn } from './logic/game'
import { type Input, listenOnline, sendInput } from './online'
import { createGameScene } from './render/scene'

const YOU = 0

type Props = { game: Game; gameId: string; onGameOver: () => void }

export default function GameCanvas({ game, gameId, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const scene = createGameScene(canvas, game)
    const onTick = () => {
      scene.onTick()
      if (!game.worms[YOU].alive || isOver(game)) onGameOver()
    }

    const online = gameId !== 'demo'
    const applyLocally = (input: Input) =>
      'side' in input ? steer(game, YOU, input.side) : turn(game, YOU, input.dir)
    const send = online ? (input: Input) => sendInput(gameId, input) : applyLocally

    const stopListening =
      game.settings.controls === 'dpad'
        ? listenToDpad((dir) => send({ dir }))
        : listenToTurns((side) => send({ side }))
    const stopRunning = online ? listenOnline(gameId, game, onTick) : runLocally(game, onTick)

    return () => {
      stopRunning()
      stopListening()
      scene.dispose()
    }
  }, [game, gameId])

  return <canvas ref={canvasRef} className="block h-full w-full touch-none outline-none" />
}
