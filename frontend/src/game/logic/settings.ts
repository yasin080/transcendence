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
  bombs: number
  wallHit: Hit
  bodyHit: Hit
  controls: Controls
  camera: Camera
}

export const SNAKE: Settings = {
  width: 20,
  height: 20,
  pillars: false,
  softWalls: 0,
  wrap: false,
  tickMs: 250,
  players: 1,
  startLength: 3,
  food: 3,
  bombs: 0,
  wallHit: 'die',
  bodyHit: 'die',
  controls: 'turn',
  camera: 'board',
}
