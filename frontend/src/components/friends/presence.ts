import { useSyncExternalStore } from 'react'
import { echo } from '../../lib/echo'
import type { FriendSummary } from './types.ts'

// Ficha de cada miembro: lo que devuelve channels.php
type Member = { id: number }

let onlineIds = new Set<string>()
const listeners = new Set<() => void>()
let joined = false

// Sustituye el conjunto y avisa a los componentes suscritos
function publish(next: Set<string>) {
  onlineIds = next
  listeners.forEach((listener) => listener())
}

// Entra en el canal de presencia (una sola vez por sesión)
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

// Sale del canal (al hacer logout)
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

// Ids de usuarios conectados; el componente se repinta al cambiar
export function useOnlineIds() {
  return useSyncExternalStore(subscribe, () => onlineIds)
}

// Sustituye el status de la API por el de la sala de presencia
export function withPresence(list: FriendSummary[], onlineIds: Set<string>) {
  return list.map((user): FriendSummary => ({
    ...user,
    status: onlineIds.has(user.id) ? 'online' : 'offline',
  }))
}