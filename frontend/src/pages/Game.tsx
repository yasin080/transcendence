import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import CountdownOverlay from '../components/game/CountdownOverlay'
import Scoreboard from '../components/game/Scoreboard'
import Button from '../components/ui/Button'
import MessageModal from '../components/ui/MessageModal'
import Modal from '../components/ui/Modal'
import { loadMatch, type Match } from '../game/api'
import GameCanvas from '../game/GameCanvas'
import { type Game, scoreboard } from '../game/logic/game'

const RETURN_DELAY = 3000

function resultOf(game: Game, you: number) {
  if (game.worms.length === 1) return 'Game over'
  const winner = game.worms.findIndex((worm) => worm.alive)
  if (winner === -1) return 'Draw'
  return winner === you ? 'You win' : `${game.worms[winner].name} wins`
}

export default function Game() {
  const { gameId = '' } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [missing, setMissing] = useState(false)
  const [over, setOver] = useState(false)
  const [eliminated, setEliminated] = useState(false)
  const [countdownEnd, setCountdownEnd] = useState(0)
  const [, setTicks] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setMatch(null)
    setMissing(false)
    setOver(false)
    setEliminated(false)
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
    <div className="flex h-dvh flex-col overflow-hidden bg-void text-white">
      {match && (
        <Scoreboard
          rows={scoreboard(match.game, match.seat)}
          alive={match.game.worms.filter((worm) => worm.alive).length}
          total={match.game.worms.length}
          elapsedMs={match.game.startsAt ? Math.max(0, Date.now() - match.game.startsAt) : 0}
          onLeave={() => setLeaving(true)}
        />
      )}

      <div className="relative min-h-0 flex-1">
        {match && <GameCanvas game={match.game} gameId={gameId} you={match.seat} onGameOver={() => setOver(true)} onEliminated={() => setEliminated(true)} onUpdate={() => setTicks((n) => n + 1)} />}
        {eliminated && !over && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
            <div className="rounded-xl border border-line bg-void/70 px-4 py-2 text-sm text-fg-secondary backdrop-blur-sm">
              Eliminated · watching until the end
            </div>
          </div>
        )}
      </div>

      {countdownEnd > 0 && match && (
        <CountdownOverlay endsAt={countdownEnd} controls={match.game.settings.controls} onDone={() => setCountdownEnd(0)} />
      )}

      {leaving && !over && (
        <Modal onClose={() => setLeaving(false)}>
          <h3 className="display-heading">Leave the match?</h3>
          <p className="mt-3 text-body-muted">You will go back to the room.</p>
          <div className="mt-5.5 flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setLeaving(false)}>
              Cancel
            </Button>
            <Button size="md" className="flex-1" onClick={backToRoom}>
              Leave
            </Button>
          </div>
        </Modal>
      )}

      {over && match && (
        <MessageModal
          kicker="Match over"
          title={resultOf(match.game, match.seat)}
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
