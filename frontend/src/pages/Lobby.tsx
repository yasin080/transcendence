import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import QuickMatchHero from '../components/lobby/QuickMatchHero.tsx'
import CreateRoomModal from '../components/lobby/CreateRoomModal.tsx'
import type { RoomSummary } from '../components/lobby/types.ts'
import EmptyState from '../components/ui/EmptyState.tsx'
import SearchInput from '../components/ui/SearchInput.tsx'
import SectionHeader from '../components/ui/SectionHeader.tsx'
import { startQuickMatch } from '../game/api.ts'
import { PRESETS, quickMatchSettings } from '../components/lobby/roomOptions.ts'
import { apiGet, apiPost } from '../lib/api.ts'
import { echo, onReconnect } from '../lib/echo'
import Button from '../components/ui/Button.tsx'
import Modal from '../components/ui/Modal.tsx'
import duel from '../assets/duel.webp'
import RoomRow from '../components/lobby/RoomRow.tsx'
import LegalLinks from '../components/ui/LegalLinks.tsx'


// The room the player still has a seat in, if any (GET /api/rooms/current)
type CurrentRoom = {
  code: string | null
  name: string | null
  status: 'open' | 'playing' | null
  game_id: number | null
}

export default function Lobby() {
  const [preset, setPreset] = useState(PRESETS[0])
  const navigate = useNavigate()
  const [playError, setPlayError] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [query, setQuery] = useState('')

  async function playNow() {
    setPlayError(false)
    const id = await startQuickMatch(quickMatchSettings(preset))
    if (id) navigate(`/game/${id}`)
    else setPlayError(true)
  }


  const [rooms, setRooms] = useState<RoomSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // A player who still has a seat is asked whether to go back or leave; nothing is decided for them
  const [current, setCurrent] = useState<CurrentRoom | null>(null)
  const [asking, setAsking] = useState(false)
  const myRoomCode = current?.code ?? null

  function backToRoom() {
    if (!current?.code) return
    const playing = current.status === 'playing' && current.game_id !== null
    navigate(playing ? `/game/${current.game_id}` : `/waiting-room/${current.code}`)
  }

  async function leaveRoom() {
    if (!current?.code) return
    await apiPost(`/api/rooms/${current.code}/leave`)
    setCurrent(null)
    setAsking(false)
  }

  useEffect(() => {
    let cancelled = false

    const loadRooms = () =>
      void apiGet<RoomSummary[]>('/api/rooms').then((result) => {
        if (cancelled) return
        if (result.ok) setRooms(result.data)
        else setError(result.failure.message)
      })
    loadRooms()
    const stopReconnect = onReconnect(loadRooms)

    void apiGet<CurrentRoom>('/api/rooms/current').then((result) => {
      if (cancelled || !result.ok) return
      setCurrent(result.data)
      setAsking(result.data.code !== null)
    })

    echo.private('lobby').listen('.room.updated', ({ room }: { room: RoomSummary }) => {
      if (room.status === 'closed') {
        setCurrent((prev) => (prev?.code === room.code ? null : prev))
      }
      setRooms((prev) => {
        const list = prev ?? []
        if (room.status === 'closed') {
          return list.filter((r) => r.id !== room.id)
        }
        const exists = list.some((r) => r.id === room.id)
        return exists ? list.map((r) => (r.id === room.id ? room : r)) : [room, ...list]
      })
    })

    return () => {
      cancelled = true
      stopReconnect()
      echo.leave('lobby')
    }
  }, [])

  const [joinError, setJoinError] = useState<string | null>(null)

  async function joinRoom(room: RoomSummary) {
    setJoinError(null)
    if (room.code === myRoomCode) {
      navigate(`/waiting-room/${room.code}`)
      return
    }
    const result = await apiPost(`/api/rooms/${room.code}/join`)
    if (result.ok) navigate(`/waiting-room/${room.code}`)
    else setJoinError(result.failure.message)
  }


  const q = query.trim().toLowerCase()
  const roomList = (rooms ?? []).filter(
    (room) => room.name.toLowerCase().includes(q))


  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-4 pt-6 pb-8 md:px-7 flex flex-col *:shrink-0">

      <div className="mb-[22px]">
        <h1 className="font-display text-[26px] tracking-[0.01em]">Lobby</h1>
      </div>

      <QuickMatchHero
        modes={PRESETS.map((p) => p.label)}
        selectedMode={preset.label}
        onSelectMode={(label) => setPreset(PRESETS.find((p) => p.label === label) ?? PRESETS[0])}
        onPlay={playNow}
      />
      {playError && <p className="mt-2 text-sm text-fuse-400">Could not start a match. Try again.</p>}

      <section className="relative mt-6.5 overflow-hidden rounded-[20px] border border-line">
        <img src={duel} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-radial from-void/90 via-void/65 to-void/20" />

        <div className="relative flex flex-col items-center gap-3 px-5 py-8 text-center">
          <p className="text-eyebrow">Custom match</p>
          <h2 className="font-display text-2xl sm:text-[28px]">Call your rivals</h2>
          <Button
            variant="primary"
            size="md"
            disabled={myRoomCode !== null}
            title={myRoomCode ? 'You are already in another room' : undefined}
            onClick={() => setCreatingRoom(true)}
          >
            + Create room
          </Button>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-6 mb-3">
        <SectionHeader size="lg" title="Open rooms" className="sm:flex-1" />
        <SearchInput
          name="room-search"
          maxLength={40}
          placeholder="Search room name"
          value={query}
          onChange={setQuery}
          className="sm:w-61"
        />
      </div>

      {creatingRoom && <CreateRoomModal onClose={() => setCreatingRoom(false)} />}

      {asking && current?.code && (
        <Modal onClose={() => setAsking(false)}>
          <div className="text-eyebrow">{current.status === 'playing' ? 'Match in progress' : 'Waiting room'}</div>
          <h3 className="mt-2.5 display-heading">You are still in {current.name}</h3>
          <p className="mt-3 text-body-muted">Go back to it, or leave it to play somewhere else.</p>
          <div className="mt-5.5 flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => void leaveRoom()}>
              Leave room
            </Button>
            <Button size="md" className="flex-1" onClick={backToRoom}>
              {current.status === 'playing' ? 'Back to the match' : 'Back to the room'}
            </Button>
          </div>
        </Modal>
      )}

      <div className="flex flex-col gap-2">
        {error && <p className="text-sm text-fuse-600">{error}</p>}
        {joinError && <p className="text-sm text-fuse-600">{joinError}</p>}
        {!error && rooms === null && <p className="text-sm text-white/45">Loading rooms…</p>}
        {rooms?.length === 0 && <EmptyState title="No open rooms yet" text="Create one!" />}
        {rooms && rooms.length > 0 && roomList.length === 0 && (
          <EmptyState title={`No rooms match "${query.trim()}"`} text="Try another name." />
        )}
        {roomList.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            onJoin={joinRoom}
            isMine={room.code === myRoomCode}
            locked={myRoomCode !== null && room.code !== myRoomCode}
          />
        ))}
      </div>
      <div className="mt-auto pt-8 flex justify-center" >
        <LegalLinks/>
      </div>

      </section>
  )
}
