import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import QuickMatchHero from '../components/lobby/QuickMatchHero.tsx'
import CreateRoomModal from '../components/lobby/CreateRoomModal.tsx'
import RoomRow, { RoomListHeader } from '../components/lobby/RoomRow.tsx'
import type { RoomSummary } from '../components/lobby/types.ts'
import EmptyState from '../components/ui/EmptyState.tsx'
import SearchInput from '../components/ui/SearchInput.tsx'
import SectionHeader from '../components/ui/SectionHeader.tsx'
import { startQuickMatch } from '../game/api.ts'
import { apiGet, apiPost } from '../lib/api.ts'
import { echo } from '../lib/echo'
import Button from '../components/ui/Button.tsx'


type CurrentRoom = { code: string | null }

async function leaveCurrentRoom(): Promise<string | null> {
  const current = await apiGet<CurrentRoom>('/api/rooms/current')
  if (!current.ok || !current.data.code) return null
  await apiPost(`/api/rooms/${current.data.code}/leave`)
  const after = await apiGet<CurrentRoom>('/api/rooms/current')
  return after.ok ? after.data.code : null
}

const GAME_MODES = ['Bomberman', 'Snake', 'Other'] as const
type GameMode = (typeof GAME_MODES)[number]


export default function Lobby() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GAME_MODES[0])
  const navigate = useNavigate()
  const [playError, setPlayError] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  async function playNow() {
    setPlayError(false)
    const id = await startQuickMatch()
    if (id) navigate(`/game/${id}`)
    else setPlayError(true)
  }


  const [rooms, setRooms] = useState<RoomSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [myRoomCode, setMyRoomCode] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void apiGet<RoomSummary[]>('/api/rooms').then((result) => {
      if (cancelled) return
      if (result.ok) setRooms(result.data)
      else setError(result.failure.message)
    })

    void leaveCurrentRoom().then((code) => {
      if (!cancelled) setMyRoomCode(code)
    })

    echo.private('lobby').listen('.room.updated', ({ room }: { room: RoomSummary }) => {
    if (room.status === 'closed' || room.status === 'finished') {
      setMyRoomCode((prev) => (prev === room.code ? null : prev))
    }
    setRooms((prev) => {
      const list = prev ?? []
      if (room.status === 'closed' || room.status === 'finished') {
        return list.filter((r) => r.id !== room.id)
      }
      const exists = list.some((r) => r.id === room.id)
      return exists ? list.map((r) => (r.id === room.id ? room : r)) : [room, ...list]
    })
  })

    return () => {
      cancelled = true
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
    (room) => room.name.toLowerCase().includes(q) || room.code.toLowerCase().includes(q),
  )


  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-4 pt-6 pb-8 md:px-7">

      <div className="flex flex-wrap items-center gap-4 mb-[22px]">
        <h1 className="font-display text-[26px] tracking-[0.01em]">Lobby</h1>

        <div className="flex w-full items-center gap-2.5 sm:ml-auto sm:w-auto">
          <SearchInput
            name="room-search"
            placeholder="Search room or code"
            value={query}
            onChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            className="min-w-0 flex-1 sm:w-61 sm:flex-none"
          />
        </div>
      </div>

      <QuickMatchHero
        modes={GAME_MODES}
        selectedMode={selectedMode}
        onSelectMode={setSelectedMode}
        canPlay={selectedMode !== 'Other'}
        onPlay={playNow}
      />
      {playError && <p className="mt-2 text-sm text-fuse-400">Could not start a match. Try again.</p>}

      <SectionHeader size="lg" title="Open rooms" className="mt-[26px] mb-3">

        <Button
            variant="primary"
            size="md"
            disabled={myRoomCode !== null}
            title={myRoomCode ? 'You are already in another room' : undefined}
            onClick={() => setCreatingRoom(true)}
          >
            + Create room
          </Button>
      </SectionHeader>

      {creatingRoom && <CreateRoomModal onClose={() => setCreatingRoom(false)} />}

      <div className="flex flex-col gap-2">
        {error && <p className="text-sm text-fuse-600">{error}</p>}
        {joinError && <p className="text-sm text-fuse-600">{joinError}</p>}
        {!error && rooms === null && <p className="text-sm text-white/45">Loading rooms…</p>}
        {rooms?.length === 0 && <EmptyState title="No open rooms yet" text="Create one!" />}
        {rooms && rooms.length > 0 && roomList.length === 0 && (
          <EmptyState title={`No rooms match "${query.trim()}"`} text="Try another name or code." />
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


      </section>
  )
}
