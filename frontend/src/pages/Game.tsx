import { useState } from 'react'
import { Link } from 'react-router'

import MessageModal from '../components/ui/MessageModal'
import { createGame } from '../game/logic/game'
import GameCanvas from '../game/GameCanvas'
import { SNAKE } from '../game/logic/settings'

export default function Game() {
  const [game, setGame] = useState(() => createGame(SNAKE))
  const [over, setOver] = useState(false)

  function playAgain() {
    setGame(createGame(SNAKE))
    setOver(false)
  }

  return (
    <div className="relative h-screen overflow-hidden bg-void text-white">
      <GameCanvas game={game} onGameOver={() => setOver(true)} />

      <Link
        to="/dashboard"
        className="absolute left-4 top-4 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-sm text-fg-secondary backdrop-blur-sm transition hover:border-line-strong hover:text-white"
      >
        ← Back to lobby
      </Link>

      {over && (
        <MessageModal
          kicker="Game over"
          title={`Length ${game.worms[0].body.length}`}
          message="You crashed. Try again and grow a longer worm."
          buttonLabel="Play again"
          onAction={playAgain}
        />
      )}
    </div>
  )
}
