export type Hit = 'block' | 'die'
export type Controls = 'turn' | 'dpad'
export type Camera = 'board' | 'follow'

export type Settings = {
  width: number
  height: number
  pillars: boolean
  softWalls: number
  wrap: boolean
  tickMs: number
  players: number
  startLength: number
  food: number
  wallHit: Hit
  bodyHit: Hit
  controls: Controls
  camera: Camera
}

export const SNAKE: Settings = {
  width: 30,
  height: 30,
  pillars: false,
  softWalls: 0,
  wrap: false,
  tickMs: 150,
  players: 1,
  startLength: 3,
  food: 1,
  wallHit: 'die',
  bodyHit: 'die',
  controls: 'turn',
  camera: 'board',
}
