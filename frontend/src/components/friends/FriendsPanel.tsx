import { useCallback, useEffect, useState } from 'react'
import Sidebar from '../ui/Sidebar.tsx'
import FriendRow from './FriendRow.tsx'
import { acceptRequest, fetchPanel, removeFriendship } from './api.ts'
import type { FriendState, FriendsPanelData, FriendSummary } from './types.ts'

// Orden alfabético sin distinguir mayúsculas
function byName(a: FriendSummary, b: FriendSummary) {
  return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
}

// Sidebar derecho global: amigos y solicitudes del usuario autenticado
export default function FriendsPanel() {
  const [data, setData] = useState<FriendsPanelData | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async () => {
    const panel = await fetchPanel()
    if (panel) {
      setData(panel)
      setFailed(false)
    } else {
      setFailed(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Lanza la acción y recarga el panel para reflejar el resultado
  async function act(action: (userId: string) => Promise<FriendState | null>, userId: string) {
    await action(userId)
    await load()
  }

  const friends = data?.friends ?? []
  const received = [...(data?.received ?? [])].sort(byName)
  const sent = [...(data?.sent ?? [])].sort(byName)
  const online = friends.filter((friend) => friend.status === 'online').sort(byName)
  const offline = friends.filter((friend) => friend.status !== 'online').sort(byName)

  return (
    <Sidebar header={<PanelHeader onlineCount={online.length} />}>
      <div className="flex flex-col gap-4 px-2.5 pb-4">
        {failed && <EmptyBox title="Couldn't load your friends" text="Reload the page to try again." />}

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