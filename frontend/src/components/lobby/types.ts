export type GameStatus = 'waiting' | 'playing' | 'finished'

// Partida tal como la mostrará el lobby. [RETOMAR] Ajustar al JSON real de la API
// cuando el backend fije la ruta; mode y variant son provisionales.
export interface GameSummary {
  id: number
  name: string
  hostName: string
  mode: string
  variant: string
  players: number
  maxPlayers: number
  status: GameStatus
}
