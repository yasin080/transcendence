import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import WaitingRoomHeader from '../components/waiting-room/WaitingRoomHeader.tsx'
import MatchPanel from '../components/waiting-room/MatchPanel.tsx'
import PlayerGrid from '../components/waiting-room/PlayerGrid.tsx'
import BackstageBanner from '../components/waiting-room/BackstageBanner.tsx'
import MessageModal from '../components/ui/MessageModal.tsx'
import backstage from '../assets/salon.jpg'
import type { MatchSetting, Player } from '../components/waiting-room/types.ts'
import type { Room } from '../components/lobby/types.ts'
import { apiPost } from '../lib/api.ts'
import { useAuth } from '../auth/useAuth.ts'
import { echo } from '../lib/echo'


const MOCK_SETTINGS: MatchSetting[] = [
  { label: 'Arena', value: 'Neon Grid' },
  { label: 'Mode', value: 'Free-for-all' },
  { label: 'Rounds', value: 'Best of 3' },
  { label: 'Bomb fuse', value: '2.5 s' },
  { label: 'Speed', value: 'Fast' },
  { label: 'Power-ups', value: 'On' },
]

export default function WaitingRoom() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { user } = useAuth()
  const { roomId } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [startError, setStartError] = useState<string | null>(null)

  const preview = searchParams.get('preview')
  const initialPhase = preview === 'closed' || preview === 'kicked' ? preview : 'waiting'
  const [phase, setPhase] = useState<'waiting' | 'closed' | 'kicked'>(initialPhase)


  // Se une al entrar (no solo lee la sala): así entrar por URL también ocupa
  // asiento. Si ya estabas dentro, join devuelve la sala sin tocar nada.
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
    const channel = echo.private(`room.${roomId}`)
    channel.listen('.players.updated', (e: { room: Room }) => {
      setRoom(e.room)
      // Si ya no estoy en la lista, el host me ha expulsado.
      const stillIn = e.room.players.some((p) => p.user_id === user?.id)
      if (stillIn) return
      // Kicked
      echo.leave(`room.${roomId}`)
      setPhase('kicked')
    })
    channel.listen('.match.started', (e: { gameId: number }) => {
      navigate(`/game/${e.gameId}`)
    })
    return () => echo.leave(`room.${roomId}`)
  }, [roomId, joined, user?.id, navigate])



  // Libera el asiento (o cierra la sala si eres el host).
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

  // Solo pide empezar; la navegación llega por el evento match.started.
  async function startMatch() {
    if (!roomId) return
    setStartError(null)
    const result = await apiPost(`/api/rooms/${roomId}/games`)
    if (!result.ok) setStartError(result.failure.message)
  }

  if (error) return <p>{error}</p>
  if (!room) return <p>Loading…</p>

  const players: Player[] = room.players.map((p) =>
  p.user_id === null
    ? {
        id: String(p.id),
        name: `BOT_${p.seat + 1}`,
        isOwner: false,
        isBot: true,
        difficulty: p.bot_difficulty ?? 'medium',
      }
    : {
        id: String(p.id),
        name: p.user?.name ?? 'Player',
        isOwner: p.user_id === room.host_id,
        isBot: false,
        // [RETOMAR] Aún no hay estadísticas ni colores en el backend
        winPct: '—',
        avgScore: '—',
        background: 'linear-gradient(150deg,#3b2f7a,#1b1636)',
        color: '#ff89a5',
      },
)

  const isOwner = room.host_id === user?.id
  const playerCount = room.players.length
  const maxPlayers = room.settings.players
  const hasFreeSeat = playerCount < maxPlayers
  const canStart = playerCount > 0
  

  return (
    <div className="h-full flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-8 font-body">
      <WaitingRoomHeader
        roomName={room.name}
        isOwner={isOwner}
        hasFreeSeat={hasFreeSeat}
        onAddBot={addBot}
      />
      <MatchPanel
        isOwner={isOwner}
        playerCount={playerCount}
        maxPlayers={maxPlayers}
        settings={MOCK_SETTINGS}
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
      />
      <BackstageBanner>
         <img src={backstage} alt="" className="size-full object-cover" />
      </BackstageBanner>

      {(phase === 'closed' || (room.status === 'closed' && !isOwner)) && (
        <MessageModal
          kicker="Room closed"
          title="The host closed the room"
          message="The room creator disconnected, so the match was cancelled for everyone. Nothing counted towards your rank."
          buttonLabel="Back to home"
          onAction={() => navigate('/lobby')}
        />
      )}
      {phase === 'kicked' && (
        <MessageModal
          kicker="Removed"
          title="The host removed you from this room"
          message="You can join another room or start your own match whenever you're ready."
          buttonLabel="Back to home"
          onAction={() => navigate('/lobby')}
        />
      )}
    </div>
  )
}