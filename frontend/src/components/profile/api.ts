import { apiGet, apiPatch, apiPost, type ApiResult } from '../../lib/api'
import { toSummary, type ApiUser } from '../friends/api.ts'
import type { FriendState, FriendSummary } from '../friends/types.ts'
import type { ProfileUser } from './types.ts'

// A profile as Laravel sends it
interface ApiProfile extends ApiUser {
  name: string | null
  bio: string | null
  created_at: string
  is_own: boolean
  friend_state: FriendState
  friend_count: number
  friends: ApiUser[]
}

// What the profile page needs
export interface ProfileData {
  profile: ProfileUser
  isOwn: boolean
  friendState: FriendState
  friends: FriendSummary[]
}

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
    },
    isOwn: data.is_own,
    friendState: data.friend_state,
    friends: data.friends.map(toSummary),
  }
}

// What PATCH /api/user accepts
export interface ProfileUpdate {
  username: string
  name: string
  email: string
  bio: string
  avatar?: string | null
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
