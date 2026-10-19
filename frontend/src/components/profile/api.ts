import { apiGet, apiPatch, apiPost, type ApiResult } from '../../lib/api'
import { toSummary, type ApiUser } from '../friends/api.ts'
import type { FriendState, FriendSummary } from '../friends/types.ts'
import type { ProfileStats, ProfileUser } from './types.ts'

// Cómo envía Laravel un perfil
interface ApiProfile extends ApiUser {
  name: string | null
  bio: string | null
  created_at: string
  is_own: boolean
  friend_state: FriendState
  friend_count: number
  friends: ApiUser[]
}

// Lo que necesita la página de perfil
export interface ProfileData {
  profile: ProfileUser
  isOwn: boolean
  friendState: FriendState
  friends: FriendSummary[]
}

// [RETOMAR] Stats falsas hasta que el juego guarde resultados
const PLACEHOLDER_STATS: ProfileStats = { played: 148, won: 63, bombs: 1240 }

export async function fetchProfile(userId: string): Promise<ProfileData | null> {
  const result = await apiGet<ApiProfile>(`/api/users/${userId}`)
  if (!result.ok) return null

  const data = result.data
  return {
    profile: {
      id: String(data.id),
      username: data.username,
      name: data.name ?? undefined,
      avatarUrl: data.avatar,
      bio: data.bio ?? '',
      memberSince: data.created_at,
      friendCount: data.friend_count,
      stats: PLACEHOLDER_STATS,
    },
    isOwn: data.is_own,
    friendState: data.friend_state,
    friends: data.friends.map(toSummary),
  }
}

// Lo que acepta PATCH /api/user
export interface ProfileUpdate {
  username: string
  name: string
  email: string
  bio: string
  avatar?: string | null // solo al elegir de la galería o volver al de por defecto
  password?: string
  password_confirmation?: string
  current_password?: string
}

export function updateProfile(update: ProfileUpdate): Promise<ApiResult<unknown>> {
  return apiPatch('/api/user', update)
}

export function uploadAvatar(file: File): Promise<ApiResult<{ avatar: string }>> {
  const form = new FormData()
  form.append('avatar', file)
  return apiPost('/api/user/avatar', form)
}
