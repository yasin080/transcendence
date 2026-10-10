// Tipos de amistad, compartidos por el perfil y el panel de amigos

export type OnlineStatus = 'online' | 'offline'

// Relación entre quien mira y otro jugador (botón de amistad)
export type FriendState = 'none' | 'sent' | 'received' | 'friends'

// Lo mínimo para pintar a un amigo en una lista o cuadrícula
export interface FriendSummary {
  id: string
  username: string
  avatarUrl: string | null // null = avatar por defecto
  status: OnlineStatus
}