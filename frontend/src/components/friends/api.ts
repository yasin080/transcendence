import { apiDelete, apiGet, apiPost } from '../../lib/api'
import type { FriendState, FriendsPanelData, FriendSummary, SearchResult } from './types.ts'
import { notifyFriendsChanged } from './events.ts'

// Cómo envía Laravel a un usuario: id numérico y snake_case
export interface ApiUser {
  id: number
  username: string
  avatar_url: string | null
}

interface ApiPanel {
  friends: ApiUser[]
  received: ApiUser[]
  sent: ApiUser[]
}

interface ApiSearchUser extends ApiUser {
  friend_state: FriendState
}

interface ApiStateResponse {
  friend_state: FriendState
}

// Traduce un usuario del backend al tipo del frontend.
// [RETOMAR] status llegará por el canal de presencia de Reverb; de momento, todos offline.
export function toSummary(user: ApiUser): FriendSummary {
  return {
    id: String(user.id),
    username: user.username,
    avatarUrl: user.avatar_url,
    status: 'offline',
  }
}

export async function fetchPanel(): Promise<FriendsPanelData | null> {
  const result = await apiGet<ApiPanel>('/api/friends')
  if (!result.ok) return null

  return {
    friends: result.data.friends.map(toSummary),
    received: result.data.received.map(toSummary),
    sent: result.data.sent.map(toSummary),
  }
}

export async function searchPlayers(query: string): Promise<SearchResult[]> {
  const result = await apiGet<ApiSearchUser[]>(`/api/users/search?q=${encodeURIComponent(query)}`)
  if (!result.ok) return []

  return result.data.map((user) => ({ ...toSummary(user), friendState: user.friend_state }))
}

// Acciones: devuelven el nuevo estado de la relación, o null si fallan

export async function sendRequest(userId: string): Promise<FriendState | null> {
  const result = await apiPost<ApiStateResponse>(`/api/friends/${userId}`)
  if (!result.ok) return null
  notifyFriendsChanged()
  return result.data.friend_state
}

export async function acceptRequest(userId: string): Promise<FriendState | null> {
  const result = await apiPost<ApiStateResponse>(`/api/friends/${userId}/accept`)
  if (!result.ok) return null
  notifyFriendsChanged()
  return result.data.friend_state
}

// Rechazar, cancelar o eliminar: en el backend son la misma acción
export async function removeFriendship(userId: string): Promise<FriendState | null> {
  const result = await apiDelete<ApiStateResponse>(`/api/friends/${userId}`)
  if (!result.ok) return null
  notifyFriendsChanged()
  return result.data.friend_state
}