import { useSyncExternalStore } from 'react'
import { echo } from '../../lib/echo'
import type { FriendSummary } from './types.ts'

// Each member's data: what channels.php returns
type Member = { id: number }

let onlineIds = new Set<string>()
const listeners = new Set<() => void>()
let joined = false

// Replace the set and notify subscribed components
function publish(next: Set<string>) {
  onlineIds = next
  listeners.forEach((listener) => listener())
}

// Join the presence channel (once per session)
export function joinPresence() {
  if (joined) return
  joined = true
  echo
    .join('online')
    .here((members: Member[]) => publish(new Set(members.map((m) => String(m.id)))))
    .joining((member: Member) => publish(new Set(onlineIds).add(String(member.id))))
    .leaving((member: Member) => {
      const next = new Set(onlineIds)
      next.delete(String(member.id))
      publish(next)
    })
}

// Leave the channel (on logout)
export function leavePresence() {
  if (!joined) return
  echo.leave('online')
  joined = false
  publish(new Set())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Ids of online users; the component re-renders when they change
export function useOnlineIds() {
  return useSyncExternalStore(subscribe, () => onlineIds)
}

// Replace the API status with the presence one, keeping extra fields (e.g. friendState)
export function withPresence<T extends FriendSummary>(list: T[], onlineIds: Set<string>): T[] {
  return list.map((user) => ({
    ...user,
    status: onlineIds.has(user.id) ? 'online' : 'offline',
  }))
}