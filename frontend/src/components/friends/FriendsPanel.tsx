import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../ui/EmptyState.tsx'
import SearchInput from '../ui/SearchInput.tsx'
import SectionHeader from '../ui/SectionHeader.tsx'
import Sidebar from '../ui/Sidebar.tsx'
import FriendRow from './FriendRow.tsx'
import { acceptRequest, fetchPanel, removeFriendship, searchPlayers, sendRequest } from './api.ts'
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
      <SearchInput
        name="player-search"
        placeholder="Search players"
        value={query}
        onChange={setQuery}
        active={searching}
        className="mx-5 mb-3.5"
      />
    </>
  )

  return (
    <Sidebar header={header}>
      <div className="flex flex-col gap-4 px-2.5 pb-4">
        {failed && <EmptyState title="Couldn't load your friends" text="Reload the page to try again." />}

        {searching ? (
          results !== null &&
          (results.length > 0 ? (
            <section className="flex flex-col gap-0.5">
              <SectionHeader size="sm" className="px-2.5 pb-1.5" title="Results" count={results.length} />
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
            <EmptyState title="No player with that name" text="Check the spelling and try again." />
          ))
        ) : (
          <>
            {received.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <SectionHeader size="sm" className="px-2.5 pb-1.5" title="Requests" count={received.length} highlight />
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
              <EmptyState title="No friends yet" text="Use the search above to find players and send a request." />
            )}

            {online.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <SectionHeader size="sm" className="px-2.5 pb-1.5" title="Online" count={online.length} />
                {online.map((friend) => (
                  <FriendRow key={friend.id} user={friend} variant="friend" />
                ))}
              </section>
            )}

            {offline.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <SectionHeader size="sm" className="px-2.5 pb-1.5" title="Offline" count={offline.length} />
                {offline.map((friend) => (
                  <FriendRow key={friend.id} user={friend} variant="friend" />
                ))}
              </section>
            )}

            {sent.length > 0 && (
              <section className="flex flex-col gap-0.5">
                <SectionHeader size="sm" className="px-2.5 pb-1.5" title="Sent requests" count={sent.length} />
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