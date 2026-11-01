import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import WaitingRoomHeader from '../components/waiting-room/WaitingRoomHeader.tsx'
import MatchPanel from '../components/waiting-room/MatchPanel.tsx'
import PlayerGrid from '../components/waiting-room/PlayerGrid.tsx'
import BackstageBanner from '../components/waiting-room/BackstageBanner.tsx'
import MessageModal from '../components/ui/MessageModal.tsx'
import backstage from '../assets/backstage.png'
import type { MatchSetting, Player } from '../components/waiting-room/types.ts'
import type { Room } from '../components/lobby/types.ts'
import { BOARD_OPTIONS, CAMERA_OPTIONS, FOOD_OPTIONS, SOFT_WALL_OPTIONS, SPEED_OPTIONS, labelFor } from '../components/lobby/roomOptions.ts'
import type { Settings } from '../game/logic/settings.ts'
import { apiGet, apiPost } from '../lib/api.ts'
import { useAuth } from '../auth/useAuth.ts'
import { echo, onReconnect } from '../lib/echo'
import Button from '../components/ui/Button.tsx'


function settingChips(s: Settings): MatchSetting[] {
  return [
    { label: 'Board', value: labelFor(BOARD_OPTIONS, s.width) },
    { label: 'Speed', value: labelFor(SPEED_OPTIONS, s.tickMs) },
    { label: 'Food', value: labelFor(FOOD_OPTIONS, s.food) },
    { label: 'Start length', value: String(s.startLength) },
    { label: 'Pillars', value: s.pillars ? 'On' : 'Off' },
    { label: 'Random walls', value: labelFor(SOFT_WALL_OPTIONS, s.softWalls) },
    { label: 'Wall hit', value: s.wallHit === 'die' ? 'Deadly' : 'Blocks' },
    { label: 'Body hit', value: s.bodyHit === 'die' ? 'Deadly' : 'Blocks' },
    { label: 'Bombs', value: s.bombs > 0 ? String(s.bombs) : 'Off' },
    { label: 'Bot mistakes', value: `${s.botMistakes}%` },
    { label: 'Camera', value: labelFor(CAMERA_OPTIONS, s.camera) },
  ]
}

export default function WaitingRoom() {
  const navigate = useNavigate()

  const { user } = useAuth()
  const { roomId } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'waiting' | 'closed' | 'kicked'>('waiting')


  useEffect(() => {
  if (!roomId) return
    let cancelled = false
    void apiPost<Room>(`/api/rooms/${roomId}/join`).then((result) => {
      if (cancelled) return
      if (result.ok) setRoom(result.data)
      else setError(result.failure.message)
    })
    return () => { cancelled = true }
  }, [roomId])

  const joined = room !== null
  useEffect(() => {
    if (!roomId || !joined) return
    const refresh = () =>
      apiGet<Room>(`/api/rooms/${roomId}`).then((result) => {
        if (!result.ok) return null
        setRoom(result.data)
        const stillIn = result.data.players.some((p) => p.user_id === user?.id)
        if (stillIn) return result.data
        echo.leave(`room.${roomId}`)
        setPhase('kicked')
        return null
      })
    const channel = echo.private(`room.${roomId}`)
    channel.listen('.players.updated', () => void refresh())
    channel.listen('.match.started', (e: { gameId: number }) => {
      navigate(`/game/${e.gameId}`)
    })
    // match.started may have been lost while the socket was down
    const stopReconnect = onReconnect(() =>
      void refresh().then((fresh) => {
        const games = fresh?.games ?? []
        if (fresh?.status === 'playing' && games.length > 0) {
          navigate(`/game/${Math.max(...games.map((g) => g.id))}`)
        }
      }),
    )
    return () => {
      stopReconnect()
      echo.leave(`room.${roomId}`)
    }
  }, [roomId, joined, user?.id, navigate])


  async function leaveRoom() {
    if (!roomId) return
    echo.leave(`room.${roomId}`)
    await apiPost(`/api/rooms/${roomId}/leave`)
    navigate('/lobby')
  }

  async function addBot() {
    if (!roomId) return
    setStartError(null)
    const result = await apiPost<Room>(`/api/rooms/${roomId}/bots`)
    if (result.ok) setRoom(result.data)
    else setStartError(result.failure.message)
  }

  async function startMatch() {
    if (!roomId) return
    setStartError(null)
    const result = await apiPost(`/api/rooms/${roomId}/games`)
    if (!result.ok) setStartError(result.failure.message)
  }

  if (error) {
    return (
      <div className="h-full flex-1 min-w-0 px-4 pt-6 pb-8 font-body md:px-7">
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-fuse-600">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => navigate('/lobby')}>
            Back to lobby
          </Button>
        </div>
      </div>
    )
  }
  if (!room) {
    return (
      <div className="h-full flex-1 min-w-0 px-4 pt-6 pb-8 font-body md:px-7">
        <p className="text-sm text-white/45">Loading room…</p>
      </div>
    )
  }

  const players: Player[] = room.players.map((p) =>
  p.user_id === null
    ? {
        id: String(p.id),
        name: `BOT_${p.seat + 1}`,
        isOwner: false,
        isBot: true,
      }
    : {
        id: String(p.id),
        name: p.user?.username ?? 'Player',
        isOwner: p.user_id === room.host_id,
        isBot: false,
        avatar: p.user?.avatar ?? null,
      },
)

  const isOwner = room.host_id === user?.id
  const playerCount = room.players.length
  const maxPlayers = room.settings.players
  const canStart = playerCount > 0


  return (
    <div className="h-full flex-1 min-w-0 overflow-y-auto px-4 pt-6 pb-8 font-body md:px-7">
      <WaitingRoomHeader roomName={room.name} isOwner={isOwner} />
      <MatchPanel
        isOwner={isOwner}
        settings={settingChips(room.settings)}
        canStart={canStart}
        onStart={startMatch}
        onLeave={leaveRoom}
      />
      {startError && <p className="mt-2 text-sm text-fuse-400">{startError}</p>}
      <PlayerGrid
        players={players}
        maxPlayers={maxPlayers}
        isOwner={isOwner}
        onKick={(playerId) => void apiPost(`/api/rooms/${roomId}/kick/${playerId}`)}
        onAddBot={addBot}
      />
      <BackstageBanner>
         <img src={backstage} alt="" className="size-full object-cover object-[center_70%]" />
      </BackstageBanner>

      {(phase === 'closed' || (room.status === 'closed' && !isOwner)) && (
        <MessageModal
          kicker="Room closed"
          title="The host left the room"
          message="The room creator disconnected, so the match was cancelled for everyone. Nothing counted towards your rank."
          buttonLabel="Back to lobby"
          onAction={() => navigate('/lobby')}
        />
      )}
      {phase === 'kicked' && (
        <MessageModal
          kicker="Removed"
          title="The host removed you from this room"
          message="You can join another room or start your own match whenever you're ready."
          buttonLabel="Back to lobby"
          onAction={() => navigate('/lobby')}
        />
      )}
    </div>
  )
}