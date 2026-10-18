import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import CountdownOverlay from '../components/game/CountdownOverlay'
import MessageModal from '../components/ui/MessageModal'
import { loadMatch, type Match } from '../game/api'
import GameCanvas from '../game/GameCanvas'

const RETURN_DELAY = 3000

export default function Game() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [missing, setMissing] = useState(false)
  const [over, setOver] = useState(false)
  const [countdownEnd, setCountdownEnd] = useState(0)

  useEffect(() => {
    let cancelled = false
    setMatch(null)
    setMissing(false)
    setOver(false)
    loadMatch(gameId).then((loaded) => {
      if (cancelled) return
      if (!loaded) return setMissing(true)
      setMatch(loaded)
      setCountdownEnd(loaded.game.startsAt ?? 0)
    })
    return () => {
      cancelled = true
    }
  }, [gameId])

  function backToRoom() {
    if (!match?.roomCode) return navigate('/lobby')
    navigate(`/waiting-room/${match.roomCode}`)
  }

  useEffect(() => {
    if (!over) return
    const timer = setTimeout(backToRoom, RETURN_DELAY)
    return () => clearTimeout(timer)
  }, [over])

  return (
    <div className="relative h-screen overflow-hidden bg-void text-white">
      {match && <GameCanvas game={match.game} gameId={gameId} you={match.seat} onGameOver={() => setOver(true)} />}

      <Link
        to="/lobby"
        className="absolute left-4 top-4 rounded-xl border border-line bg-void/60 px-3 py-1.5 text-sm text-fg-secondary backdrop-blur-sm transition hover:border-line-strong hover:text-white"
      >
        ← Back to lobby
      </Link>

      {countdownEnd > 0 && match && (
        <CountdownOverlay endsAt={countdownEnd} controls={match.game.settings.controls} onDone={() => setCountdownEnd(0)} />
      )}

      {over && match && (
        <MessageModal
          kicker={match.game.worms[match.seat].alive ? 'You win' : 'Game over'}
          title={`Length ${match.game.worms[match.seat].body.length}`}
          message="Back to the room in 3 seconds."
          buttonLabel="OK"
          onAction={backToRoom}
        />
      )}

      {missing && (
        <MessageModal
          kicker="Match not found"
          title="This match is not available"
          message="It may not exist, or you are not one of its players."
          buttonLabel="Back to lobby"
          onAction={() => navigate('/lobby')}
        />
      )}
    </div>
  )
}
