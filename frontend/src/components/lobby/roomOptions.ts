import { SNAKE, type Settings } from '../../game/logic/settings.ts'

export interface Option<T> {
  label: string
  value: T
}

// Lo que el host elige al crear la sala; el resto de Settings sale de SNAKE.
// boardSize se convierte en width y height (tablero cuadrado).
export type RoomChoices = Pick<
  Settings,
  'players' | 'tickMs' | 'food' | 'bombs' | 'pillars' | 'softWalls' | 'startLength' | 'wallHit' | 'bodyHit'
> & {
  boardSize: number
}

// Opciones numéricas de min a max: range(1, 4) → 1, 2, 3, 4
function range(min: number, max: number, step = 1, label: (n: number) => string = String): Option<number>[] {
  return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => {
    const value = min + i * step
    return { label: label(value), value }
  })
}

export const PLAYER_OPTIONS = range(1, 4)

export const BOARD_OPTIONS: Option<number>[] = [
  { label: 'Small', value: 20 },
  { label: 'Medium', value: 35 },
  { label: 'Large', value: 50 },
]

// tickMs: menos milisegundos por paso = gusano más rápido, por eso va de 300 a 100
export const SPEED_OPTIONS = range(100, 300, 25, (ms) => `${ms} ms`).reverse()

export const FOOD_OPTIONS = range(1, 50)

export const BOMB_OPTIONS = range(1, 10)
export const BOMBS_ON = 3

// Proporción de muros rompibles: de 0 a 0.05
export const SOFT_WALL_OPTIONS = range(0, 5, 1, (n) => `${n}%`).map(({ label, value }) => ({ label, value: value / 100 }))

// El largo inicial crece con el tablero: el 30 % del lado (20 → 6, 35 → 10, 50 → 15)
export const maxStartLength = (boardSize: number) => Math.floor((boardSize * 3) / 10)
export const startLengthOptions = (boardSize: number) => range(1, maxStartLength(boardSize))

export const DEFAULT_CHOICES: RoomChoices = {
  players: 2,
  boardSize: 35,
  tickMs: 150,
  food: 1,
  bombs: 0,
  pillars: false,
  softWalls: 0,
  startLength: 3,
  wallHit: 'die',
  bodyHit: 'die',
}

// Etiqueta de un valor guardado: labelFor(BOARD_OPTIONS, 35) → 'Medium'
export function labelFor<T>(options: Option<T>[], value: T): string {
  return options.find((option) => option.value === value)?.label ?? String(value)
}

// Settings completos que exige el backend: SNAKE de base y encima lo elegido
export function toSettings({ boardSize, ...rest }: RoomChoices): Settings {
  return { ...SNAKE, ...rest, width: boardSize, height: boardSize }
}
