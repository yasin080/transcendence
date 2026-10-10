import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import MessageModal from '../components/ui/MessageModal'
import { loadSettings, startQuickMatch } from '../game/api'
import GameCanvas from '../game/GameCanvas'
import { createGame, type Game as GameState } from '../game/logic/game'

export default function Game() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState<GameState | null>(null)
  const [missing, setMissing] = useState(false)
  const [over, setOver] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGame(null)
    setMissing(false)
    setOver(false)
    loadSettings(gameId).then((settings) => {
      if (cancelled) return
      if (settings) setGame(createGame(settings))
      else setMissing(true)
    })
    return () => {
      cancelled = true
    }
  }, [gameId])

  async function playAgain() {
    const id = await startQuickMatch()
    if (id) navigate(`/game/${id}`)
  }

  return (
    <div className="relative h-screen overflow-hidden bg-void text-white">
      {game && <GameCanvas game={game} onGameOver={() => setOver(true)} />}

      <Link
        to="/dashboard"
        className="absolute left-4 top-4 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-sm text-fg-secondary backdrop-blur-sm transition hover:border-line-strong hover:text-white"
      >
        ← Back to lobby
      </Link>

      {over && game && (
        <MessageModal
          kicker="Game over"
          title={`Length ${game.worms[0].body.length}`}
          message="You crashed. Try again and grow a longer worm."
          buttonLabel="Play again"
          onAction={playAgain}
        />
      )}

      {missing && (
        <MessageModal
          kicker="Match not found"
          title="This match is not available"
          message="It may not exist, or you are not one of its players."
          buttonLabel="Back to lobby"
          onAction={() => navigate('/dashboard')}
        />
      )}
    </div>
  )
}
