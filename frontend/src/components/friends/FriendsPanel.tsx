import { useEffect, useState, type ReactNode } from 'react'
import Sidebar from '../ui/Sidebar.tsx'
import FriendRow from './FriendRow.tsx'
import { fetchPanel } from './api.ts'
import type { FriendsPanelData, FriendSummary } from './types.ts'

// Orden alfabético sin distinguir mayúsculas
function byName(a: FriendSummary, b: FriendSummary) {
  return a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
}

// Sidebar derecho global: amigos del usuario autenticado
export default function FriendsPanel() {
  const [data, setData] = useState<FriendsPanelData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    void fetchPanel().then((panel) => {
      if (!active) return
      if (panel) setData(panel)
      else setFailed(true)
    })

    return () => {
      active = false
    }
  }, [])

  const friends = data?.friends ?? []
  const online = friends.filter((friend) => friend.status === 'online').sort(byName)
  const offline = friends.filter((friend) => friend.status !== 'online').sort(byName)

  return (
    <Sidebar header={<PanelHeader onlineCount={online.length} />}>
      <div className="flex flex-col gap-4 px-2.5 pb-4">
        {failed && <EmptyBox title="Couldn't load your friends" text="Reload the page to try again." />}

        {data && friends.length === 0 && (
          <EmptyBox title="No friends yet" text="Use the search above to find players and send a request." />
        )}

        {online.length > 0 && (
          <Section title="Online" count={online.length}>
            {online.map((friend) => (
              <FriendRow key={friend.id} user={friend} variant="friend" />
            ))}
          </Section>
        )}

        {offline.length > 0 && (
          <Section title="Offline" count={offline.length}>
            {offline.map((friend) => (
              <FriendRow key={friend.id} user={friend} variant="friend" />
            ))}
          </Section>
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

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2.5 px-2.5 pb-1.5">
        <h4 className="text-micro-label text-fg-muted">{title}</h4>
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        <span className="text-meta text-fg-muted">{count}</span>
      </div>
      {children}
    </section>
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