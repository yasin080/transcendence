// Forma de los datos que necesita la página de perfil.
// Es del frontend: no copia la tabla de la BD. Cuando exista la API,
// una función adaptadora traducirá su JSON a estos tipos.

export interface ProfileStats {
  played: number
  won: number
  bombs: number
}

export interface ProfileUser {
  id: string
  username: string
  name?: string
  avatarUrl: string | null // null = avatar por defecto
  bio: string
  memberSince: string // fecha ISO, p. ej. '2026-03-14'
  friendCount: number
  stats: ProfileStats
}

export interface ProfileEdits {
  username: string
  name: string
  email: string
  bio: string
  avatarUrl: string | null
}