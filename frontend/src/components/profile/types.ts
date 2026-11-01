// Profile data as the frontend uses it, not a copy of the DB table.
// fetchProfile (api.ts) maps the API's JSON to this shape.

export interface ProfileUser {
  id: string
  username: string
  name?: string
  avatarUrl: string | null
  bio: string
  memberSince: string
  friendCount: number
}