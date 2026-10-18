import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { useAuth } from '../../auth/useAuth'

import Button from '../../components/ui/Button'
import { SNAKE } from '../../game/logic/settings'
import { apiGet, apiPost } from '../../lib/api'

type Room = {
  code: string
  host_id: number
  status: string
  players: { seat: number; user: { name: string } | null }[]
  games: { id: number }[]
}

/**
 * [RETOMAR] TEMPORAL: prueba de partidas con varios jugadores hasta que la sala
 * de espera esté conectada. Quitar junto con su ruta y su enlace del grupo Dev.
 */
export default function DevMatch() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const after = Number(params.get('after') ?? 0)
  const [players, setPlayers] = useState(2)
  const [code, setCode] = useState('')
  const [roomCode, setRoomCode] = useState(params.get('room'))
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const isHost = room?.host_id === user?.id

  useEffect(() => {
    if (!roomCode) return
    const refresh = async () => {
      const result = await apiGet<Room>(`/api/rooms/${roomCode}`)
      if (!result.ok) return
      setRoom(result.data)
      const game = result.data.games.at(-1)
      if (result.data.status === 'playing' && game && game.id > after) navigate(`/game/${game.id}`)
    }
    void refresh()
    const timer = setInterval(refresh, 1000)
    return () => clearInterval(timer)
  }, [roomCode, after, navigate])

  async function host() {
    const result = await apiPost<Room>('/api/rooms', { name: 'Dev match', settings: { ...SNAKE, players } })
    if (!result.ok) return setError(result.failure.message)
    setRoomCode(result.data.code)
  }

  async function join() {
    const result = await apiPost<Room>(`/api/rooms/${code.trim().toUpperCase()}/join`)
    if (!result.ok) return setError(result.failure.message)
    setRoomCode(result.data.code)
  }

  async function start() {
    if (!room) return
    const result = await apiPost<{ id: number }>(`/api/rooms/${room.code}/games`)
    if (!result.ok) return setError(result.failure.message)
    navigate(`/game/${result.data.id}`)
  }

  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-8">
      <p className="text-eyebrow">Dev</p>
      <h1 className="mt-2 display-heading">Multiplayer test</h1>
      <p className="mt-2 text-body-muted">Open a second browser (or a private window) with another user to join.</p>

      {error && <p className="mt-4 text-sm text-fuse-400">{error}</p>}

      {!roomCode && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-fill p-5">
            <h2 className="font-display text-lg">Host</h2>
            <label className="text-sm text-fg-secondary">
              Players{' '}
              <select
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className="ml-2 rounded-lg bg-surface px-2 py-1 text-white"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <Button size="md" onClick={host}>
              Create room
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-fill p-5">
            <h2 className="font-display text-lg">Join</h2>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Room code"
              maxLength={6}
              className="rounded-xl border border-line-strong bg-surface-input px-3.5 py-3 text-sm uppercase text-white outline-none"
            />
            <Button size="md" disabled={code.trim().length !== 6} onClick={join}>
              Join room
            </Button>
          </div>
        </div>
      )}

      {room && (
        <div className="mt-6 flex max-w-md flex-col gap-4 rounded-2xl border border-line bg-fill p-5">
          <p className="text-sm text-fg-secondary">
            Room code <span className="ml-2 font-display text-2xl tracking-widest text-white">{room.code}</span>
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {room.players.map((p) => (
              <li key={p.seat}>
                Seat {p.seat + 1}: {p.user?.name ?? 'Bot'}
              </li>
            ))}
          </ul>
          {isHost ? (
            <Button size="md" disabled={room.status !== 'open'} onClick={start}>
              Start match
            </Button>
          ) : (
            <p className="text-sm text-fg-muted">Waiting for the host to start…</p>
          )}
        </div>
      )}
    </section>
  )
}
