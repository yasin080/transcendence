import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../ui/Sidebar.tsx'
import FriendRow from './FriendRow.tsx'
import { acceptRequest, fetchPanel, removeFriendship, searchPlayers, sendRequest } from './api.ts'
import { SearchIcon, XIcon } from './icons.tsx'
import type { FriendState, FriendsPanelData, FriendSummary, SearchResult } from './types.ts'
import { onFriendsChanged } from './events.ts'

const MIN_QUERY = 2
const SEARCH_DELAY_MS = 300

// Orden alfabético sin distinguir mayúsculas
function byName(a: FriendSummary, b: FriendSummary) {
  return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
}

// Sidebar derecho global: buscador, amigos y solicitudes del usuario autenticado
export default function FriendsPanel() {
  const [data, setData] = useState<FriendsPanelData | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)

  const trimmed = query.trim()
  const searching = trimmed.length >= MIN_QUERY

  const load = useCallback(async () => {
    const panel = await fetchPanel()
    if (panel) {
      setData(panel)
      setFailed(false)
    } else {
      setFailed(true)
    }
  }, [])

  const runSearch = useCallback(async (text: string) => {
    setResults(await searchPlayers(text))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Busca 300 ms después de la última tecla
  useEffect(() => {
    if (!searching) {
      setResults(null)
      return
    }
    const timer = setTimeout(() => void runSearch(trimmed), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [trimmed, searching, runSearch])

  // Recarga cuando cambia cualquier amistad, aquí o en un perfil
  useEffect(
    () =>
      onFriendsChanged(() => {
        void load()
        if (searching) void runSearch(trimmed)
      }),
    [load, runSearch, searching, trimmed],
  )

  // Lanza la acción; el aviso de amistades recarga panel y búsqueda
  async function act(action: (userId: string) => Promise<FriendState | null>, userId: string) {
    await action(userId)
  }

  const friends = data?.friends ?? []
  const received = [...(data?.received ?? [])].sort(byName)
  const sent = [...(data?.sent ?? [])].sort(byName)
  const online = friends.filter((friend) => friend.status === 'online').sort(byName)
  const offline = friends.filter((friend) => friend.status !== 'online').sort(byName)

  const header = (
    <>
      <PanelHeader onlineCount={online.length} />
      <SearchBox value={query} onChange={setQuery} />
    </>
  )

  return (
    <Sidebar header={header}>
      <div className="flex flex-col gap-4 px-2.5 pb-4">
        {failed && <EmptyBox title="Couldn't load your friends" text="Reload the page to try again." />}

        {searching ? (
          results !== null &&
          (results.length > 0 ? (
            <section className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                <SectionLabel title="Results" count={results.length} />
              </div>
              {results.map((user) => (
                <FriendRow
                  key={user.id}
                  user={user}
                  variant="search"
                  friendState={user.friendState}
                  onAdd={() => void act(sendRequest, user.id)}
                  onAccept={() => void act(acceptRequest, user.id)}
                  onRemove={() => void act(removeFriendship, user.id)}
                />
              ))}
            </section>
          ) : (
            <EmptyBox title="No player with that name" text="Check the spelling and try again." />
          ))
        ) : (
          <>
            {received.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                  <SectionLabel title="Requests" count={received.length} highlight />
                </div>
                {received.map((user) => (
                  <FriendRow
                    key={user.id}
                    user={user}
                    variant="received"
                    onAccept={() => void act(acceptRequest, user.id)}
                    onRemove={() => void act(removeFriendship, user.id)}
                  />
                ))}
              </section>
            )}

            {data && friends.length === 0 && (
              <EmptyBox title="No friends yet" text="Use the search above to find players and send a request." />
            )}

            {online.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                  <SectionLabel title="Online" count={online.length} />
                </div>
                {online.map((friend) => (
                  <FriendRow key={friend.id} user={friend} variant="friend" />
                ))}
              </section>
            )}

            {offline.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                  <SectionLabel title="Offline" count={offline.length} />
                </div>
                {offline.map((friend) => (
                  <FriendRow key={friend.id} user={friend} variant="friend" />
                ))}
              </section>
            )}

            {sent.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
                  <SectionLabel title="Sent requests" count={sent.length} />
                </div>
                {sent.map((user) => (
                  <FriendRow
                    key={user.id}
                    user={user}
                    variant="sent"
                    onRemove={() => void act(removeFriendship, user.id)}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </Sidebar>
  )
}

function PanelHeader({ onlineCount }: { onlineCount: number }) {
  return (
    <div className="flex items-baseline gap-3 px-5 pt-5.5 pb-3.5">
      <h3 className="font-display text-lg">Friends</h3>
      <span className="flex items-center gap-1.5 text-meta text-fg-muted">
        <span aria-hidden="true" className="size-2 rounded-full bg-online" />
        {onlineCount} online
      </span>
    </div>
  )
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const active = value.trim().length >= MIN_QUERY

  return (
    <div className="px-5 pb-3.5">
      <div
        className={`flex items-center gap-2.5 rounded-xl border bg-fill-strong px-3.5 py-2.5 transition-colors ${
          active ? 'border-fuse-600/50' : 'border-line-strong'
        }`}
      >
        <SearchIcon className="size-4 flex-none text-fg-muted" />
        <input
          name="player-search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search players"
          aria-label="Search players"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-fg-muted"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="grid size-5 flex-none cursor-pointer place-items-center rounded-full bg-fill-strong text-fg-secondary hover:text-white"
          >
            <XIcon className="size-3" />
          </button>
        )}
      </div>
    </div>
  )
}

// Título de sección + línea + contador. highlight = estilo de "Requests"
function SectionLabel({ title, count, highlight = false }: { title: string; count: number; highlight?: boolean }) {
  return (
    <>
      <span className={`text-micro-label ${highlight ? 'text-ember-450' : 'text-fg-muted'}`}>{title}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
      {highlight ? (
        <span className="grid h-4.5 min-w-4.5 place-items-center rounded-full bg-fuse-600 px-1 text-2xs font-bold text-white">
          {count}
        </span>
      ) : (
        <span className="text-meta text-fg-muted">{count}</span>
      )}
    </>
  )
}

function EmptyBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong p-5 text-center">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-meta text-fg-muted">{text}</p>
    </div>
  )
}