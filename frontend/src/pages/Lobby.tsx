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
import { PRESETS, quickMatchSettings } from '../components/lobby/roomOptions.ts'
import { apiGet, apiPost } from '../lib/api.ts'
import { echo } from '../lib/echo'


const PAGE_SIZE = 6

type CurrentRoom = { code: string | null }

async function leaveCurrentRoom(): Promise<string | null> {
  const current = await apiGet<CurrentRoom>('/api/rooms/current')
  if (!current.ok || !current.data.code) return null
  await apiPost(`/api/rooms/${current.data.code}/leave`)
  const after = await apiGet<CurrentRoom>('/api/rooms/current')
  return after.ok ? after.data.code : null
}

export default function Lobby() {
  const [preset, setPreset] = useState(PRESETS[0])
  const navigate = useNavigate()
  const [playError, setPlayError] = useState(false)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')

  async function playNow() {
    setPlayError(false)
    const id = await startQuickMatch(quickMatchSettings(preset))
    if (id) navigate(`/game/${id}`)
    else setPlayError(true)
  }



  // null = todavía cargando
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Código de la sala en la que ya tengo asiento (null = en ninguna)
  const [myRoomCode, setMyRoomCode] = useState<string | null>(null)

  // Pide las salas y mi sala actual una vez, al entrar en el lobby
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
    // Si cierran o termina mi sala, ya no estoy en ninguna
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

  // Primero ocupa un asiento en el backend; solo si lo consigue entra en la sala.
  // Si ya tengo asiento en ella, entro directamente.
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



  // Filtra por nombre o código, sin distinguir mayúsculas
  const q = query.trim().toLowerCase()
  const roomList = (rooms ?? []).filter(
    (room) => room.name.toLowerCase().includes(q) || room.code.toLowerCase().includes(q),
  )
  const pageCount = Math.max(1, Math.ceil(roomList.length / PAGE_SIZE))
  const firstIndex = (page - 1) * PAGE_SIZE
  const pageRooms = roomList.slice(firstIndex, firstIndex + PAGE_SIZE)


  return (
    <section className="flex-1 min-w-0 overflow-y-auto px-4 pt-6 pb-8 md:px-7">

      {/* ─── 1. Cabecera: título + buscador ─── */}
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

      {/* ─── 2. Partida rápida (hero): Play now → cuenta atrás → /game ─── */}
      <QuickMatchHero
        modes={PRESETS.map((p) => p.label)}
        selectedMode={preset.label}
        onSelectMode={(label) => setPreset(PRESETS.find((p) => p.label === label) ?? PRESETS[0])}
        onPlay={playNow}
      />
      {playError && <p className="mt-2 text-sm text-fuse-400">Could not start a match. Try again.</p>}

      {/* ─── 3. Salas abiertas (máx. 6 por página) + paginador ─── */}
      <SectionHeader size="lg" title="Open rooms" className="mt-[26px] mb-3">
        <span className="text-xs text-white/40">{roomList.length} rooms</span>

        <button
          type="button"
          disabled={myRoomCode !== null}
          title={myRoomCode ? 'You are already in another room' : undefined}
          onClick={() => setCreatingRoom(true)}
          className="px-4 py-2 rounded-[10px] border border-white/12 bg-white/5 text-[13px] font-bold text-white cursor-pointer enabled:hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Create room
        </button>
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
        {pageRooms.length > 0 && <RoomListHeader />}
        {pageRooms.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            onJoin={joinRoom}
            isMine={room.code === myRoomCode}
            locked={myRoomCode !== null && room.code !== myRoomCode}
          />
        ))}
      </div>


      {/* Paginador */}
        <div className="flex items-center gap-2.5 mt-3.5">
          {roomList.length > 0 && (
          <span className="text-xs text-white/40">

              Showing {firstIndex + 1}–{firstIndex + pageRooms.length} of {roomList.length}

          </span>
          )}

          <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="grid place-items-center size-[34px] rounded-[10px] border border-white/12 bg-white/5 text-white cursor-pointer enabled:hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/25"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`min-w-[34px] h-[34px] px-2.5 rounded-[10px] border text-[13px] font-bold cursor-pointer ${
                n === page ? 'border-fuse-600 bg-fuse-600 text-white' : 'border-white/12 bg-white/5 text-white/60'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={page === pageCount}
            onClick={() => setPage(page + 1)}
            className="grid place-items-center size-[34px] rounded-[10px] border border-white/12 bg-white/5 text-white cursor-pointer enabled:hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/25"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
