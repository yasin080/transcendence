import { useCallback, useEffect, useState } from 'react'
import EmptyState from '../ui/EmptyState.tsx'
import SearchInput from '../ui/SearchInput.tsx'
import SectionHeader from '../ui/SectionHeader.tsx'
import Sidebar from '../ui/Sidebar.tsx'
import FriendRow from './FriendRow.tsx'
import { acceptRequest, fetchPanel, removeFriendship, searchPlayers, sendRequest } from './api.ts'
import type { FriendState, FriendsPanelData, FriendSummary, SearchResult } from './types.ts'
import { onFriendsChanged } from './events.ts'
import { useOnlineIds, withPresence } from './presence.ts'

const MIN_QUERY = 2
const MAX_QUERY = 20
const SEARCH_DELAY_MS = 300

// Case-insensitive alphabetical order
function byName(a: FriendSummary, b: FriendSummary) {
  return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
}

// Global right sidebar: search, friends and requests of the logged-in user
export default function FriendsPanel() {
  const [data, setData] = useState<FriendsPanelData | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const onlineIds = useOnlineIds()

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

  // Search 300 ms after the last keystroke
  useEffect(() => {
    if (!searching) {
      setResults(null)
      return
    }
    const timer = setTimeout(() => void runSearch(trimmed), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [trimmed, searching, runSearch])

  // Reload when any friendship changes, here or on a profile
  useEffect(
    () =>
      onFriendsChanged(() => {
        void load()
        if (searching) void runSearch(trimmed)
      }),
    [load, runSearch, searching, trimmed],
  )

  // Run the action; the friendship notice reloads the panel and the search
  // Runs a friend action; the user's row stays disabled until the panel has reloaded
  async function act(action: (userId: string) => Promise<FriendState | null>, userId: string) {
    if (busyIds.has(userId)) return
    setBusyIds((prev) => new Set(prev).add(userId))
    try {
      await action(userId)
      await load()
      if (searching) await runSearch(trimmed)
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const friends = withPresence(data?.friends ?? [], onlineIds)
  const received = withPresence(data?.received ?? [], onlineIds).sort(byName)
  const sent = withPresence(data?.sent ?? [], onlineIds).sort(byName)
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
        maxLength={MAX_QUERY}
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
              {withPresence(results, onlineIds).map((user) => (
                <FriendRow
                  key={user.id}
                  user={user}
                  variant="search"
                  friendState={user.friendState}
                  onAdd={() => void act(sendRequest, user.id)}
                  onAccept={() => void act(acceptRequest, user.id)}
                  onRemove={() => void act(removeFriendship, user.id)}
                  busy={busyIds.has(user.id)}
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
                    busy={busyIds.has(user.id)}
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
                    busy={busyIds.has(user.id)}
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