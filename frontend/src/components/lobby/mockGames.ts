import type { GameSummary } from './types.ts'

// [RETOMAR] Provisional sin backend: sustituir por la llamada a la API.
export const MOCK_GAMES: GameSummary[] = [
  { id: 1, name: 'Neon Grid', hostName: 'ex0', mode: 'Free-for-all', variant: 'Neon Grid', players: 9, maxPlayers: 12, status: 'waiting' },
  { id: 2, name: 'Emerald Sprint', hostName: 'ex1', mode: 'Teams 4v4', variant: 'Emerald Grid', players: 8, maxPlayers: 8, status: 'playing' },
  { id: 3, name: 'Chaos Cellar', hostName: 'ex2', mode: 'Chaos', variant: 'Cellar', players: 5, maxPlayers: 16, status: 'waiting' },
  { id: 4, name: 'Rookie Sandbox', hostName: 'ex99', mode: 'Free-for-all', variant: 'Neon Grid', players: 3, maxPlayers: 12, status: 'waiting' },
  { id: 5, name: 'Tail Hunters', hostName: 'ex3', mode: 'Duos', variant: 'Brick Yard', players: 10, maxPlayers: 12, status: 'waiting' },
  { id: 6, name: 'Midnight Bricks', hostName: 'ex4', mode: 'Teams 3v3', variant: 'Brick Yard', players: 6, maxPlayers: 6, status: 'playing' },
  { id: 7, name: 'Pixel Pit', hostName: 'ex5', mode: 'Free-for-all', variant: 'Cellar', players: 2, maxPlayers: 8, status: 'waiting' },
  { id: 8, name: 'Fuse Box', hostName: 'ex6', mode: 'Duos', variant: 'Neon Grid', players: 4, maxPlayers: 4, status: 'waiting' },
  { id: 9, name: 'Coil Court', hostName: 'ex7', mode: 'Chaos', variant: 'Emerald Grid', players: 11, maxPlayers: 16, status: 'playing' },
  { id: 10, name: 'Late Night Duel', hostName: 'ex8', mode: 'Teams 3v3', variant: 'Brick Yard', players: 1, maxPlayers: 6, status: 'waiting' },
  { id: 11, name: 'Snake Pit', hostName: 'ex9', mode: 'Free-for-all', variant: 'Cellar', players: 7, maxPlayers: 12, status: 'waiting' },
]
